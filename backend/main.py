import time
import json
import logging
from typing import List, Set
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from stt import config
from stt.engine import STTEngine
from stt.session import StreamingSession
import db
import ai_extractor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("signclass.backend")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        msg = f"[WS CONNECTED] Client connected to /ws/stt. Total connected clients: {len(self.active_connections)}"
        logger.info(msg)
        print(msg, flush=True)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        msg = f"[WS DISCONNECTED] Client disconnected from /ws/stt. Total remaining clients: {len(self.active_connections)}"
        logger.info(msg)
        print(msg, flush=True)

    async def broadcast(self, message: dict):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                disconnected.add(connection)
        for conn in disconnected:
            self.active_connections.discard(conn)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SignClass STT & Persistence Backend...")
    print("[SERVER INIT] Initializing SignClass STT & Persistence Backend...", flush=True)
    db.init_db()
    try:
        STTEngine.get_instance().load()
    except Exception as e:
        logger.error(f"Engine load failed during startup: {e}")
        print(f"[SERVER ERROR] Engine load failed: {e}", flush=True)
    yield
    logger.info("Shutting down SignClass STT & Persistence Backend...")

app = FastAPI(title="SignClass STT & AI Backend Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS + ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    engine = STTEngine.get_instance()
    return {
        "status": "ok",
        "model": config.MODEL_SIZE,
        "device": config.DEVICE,
        "compute_type": config.COMPUTE_TYPE,
        "model_loaded": engine.is_loaded,
        "active_sessions": len(manager.active_connections)
    }

@app.websocket("/ws/stt")
async def websocket_stt_endpoint(websocket: WebSocket, class_id: str = "CS204A"):
    print("[WS CONNECTED] /ws/stt client connected", flush=True)
    await manager.connect(websocket)

    engine = STTEngine.get_instance()
    if not engine.is_loaded:
        await websocket.send_json({
            "type": "error",
            "code": "MODEL_LOAD_FAILED",
            "message": "Speech model failed to load on backend.",
            "fatal": True
        })
        await websocket.close(code=1011)
        manager.disconnect(websocket)
        return

    await websocket.send_json({"type": "status", "status": "listening"})
    session = StreamingSession()

    try:
        frame_counter = 0
        while True:
            print("[WS WAITING] Waiting for audio...", flush=True)
            message = await websocket.receive()
            msg_type = message.get("type")

            if msg_type == "websocket.disconnect":
                print("[WS DISCONNECTED] Client disconnected from /ws/stt", flush=True)
                break

            # Handle binary PCM audio data
            if "bytes" in message and message["bytes"]:
                pcm_data = message["bytes"]
                frame_counter += 1
                
                print(f"[WS AUDIO RECEIVED] bytes: {len(pcm_data)}", flush=True)
                print(f"[PCM RECEIVED] frame: #{frame_counter} ({len(pcm_data)} bytes)", flush=True)

                session.process_pcm_frame(pcm_data)

                if session.should_finalize():
                    final_res = await session.get_final_result()
                    if final_res and final_res.get("text"):
                        now_ms = int(time.time() * 1000)
                        elapsed_sec = int(time.time() - session.start_time)
                        mins = str(elapsed_sec // 60).zfill(2)
                        secs = str(elapsed_sec % 60).zfill(2)
                        timestamp_label = f"{mins}:{secs}"
                        text_str = final_res["text"].strip()

                        segment = {
                            "id": f"seg_py_{now_ms}",
                            "speaker": "student" if text_str.endswith("?") else "teacher",
                            "text": text_str,
                            "isFinal": True,
                            "startMs": elapsed_sec * 1000,
                            "timestampLabel": timestamp_label
                        }

                        # Save transcript to SQLite DB
                        db.save_transcript_segment(class_id, segment)

                        # Extract AI Insights
                        print("[AI EXTRACTION START]", flush=True)
                        insights = ai_extractor.extract_insights_from_segment(text_str, timestamp_label)
                        print(f"[AI EXTRACTION RESULT] {insights}", flush=True)
                        for item in insights.get("items", []):
                            db.save_raw_insight(class_id, item)

                        # Broadcast final segment and extracted items to ALL connected Teacher & Student clients
                        broadcast_msg = {
                            "type": "final",
                            "text": text_str,
                            "segment": segment,
                            "insights": insights,
                            "classId": class_id,
                            "sent_ts": now_ms,
                            "stt_latency_ms": final_res.get("stt_latency_ms", 0)
                        }
                        log_line = f"[FINAL SENT] ts: {now_ms} | stt_latency: {final_res.get('stt_latency_ms')} ms | text: \"{text_str}\""
                        logger.info(log_line)
                        print(f"[STT SENT] {text_str}", flush=True)
                        print(f"[TRANSCRIPT SENT] type: final | ts: {now_ms} | latency: {final_res.get('stt_latency_ms')}ms | text: \"{text_str}\"", flush=True)
                        await manager.broadcast(broadcast_msg)

                elif session.should_interim():
                    interim_res = await session.get_interim_result()
                    if interim_res and interim_res.get("text"):
                        now_ms = int(time.time() * 1000)
                        interim_msg = {
                            "type": "interim",
                            "text": interim_res["text"],
                            "sent_ts": now_ms,
                            "stt_latency_ms": interim_res.get("stt_latency_ms", 0)
                        }
                        log_line = f"[INTERIM SENT] ts: {now_ms} | stt_latency: {interim_res.get('stt_latency_ms')} ms | text: \"{interim_res['text']}\""
                        logger.info(log_line)
                        print(f"[STT SENT] {interim_res['text']}", flush=True)
                        print(f"[TRANSCRIPT SENT] type: interim | ts: {now_ms} | latency: {interim_res.get('stt_latency_ms')}ms | text: \"{interim_res['text']}\"", flush=True)
                        await websocket.send_json(interim_msg)

            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    p_type = payload.get("type")

                    if p_type == "start_class":
                        print("[STT STARTED]", flush=True)
                        db.update_class_status(class_id, "live")
                        await manager.broadcast({"type": "class_status_change", "status": "live", "classId": class_id})

                    elif p_type == "end_class":
                        print("[STT STOPPED]", flush=True)
                        db.update_class_status(class_id, "ended")
                        final_res = await session.get_final_result()
                        if final_res and final_res.get("text"):
                            segment = {
                                "id": f"seg_py_{int(time.time()*1000)}",
                                "speaker": "teacher",
                                "text": final_res["text"].strip(),
                                "isFinal": True,
                                "startMs": 0,
                                "timestampLabel": "End"
                            }
                            db.save_transcript_segment(class_id, segment)

                        await manager.broadcast({"type": "class_ended", "classId": class_id})

                    elif p_type == "update_insight":
                        item = payload.get("item")
                        if item:
                            db.save_raw_insight(class_id, item)
                            await manager.broadcast({"type": "insight_updated", "item": item})

                    elif p_type == "ping":
                        await websocket.send_json({"type": "pong", "ts": int(time.time() * 1000)})
                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        print("[WS DISCONNECTED] Client WebSocket disconnected.", flush=True)
        print("[STT STOPPED]", flush=True)
    finally:
        manager.disconnect(websocket)

# REST Endpoints for Teacher Review & Publish Workflow
@app.post("/api/classes/start")
async def start_class(class_id: str = Body(default="CS204A", embed=True)):
    print("[STT STARTED]", flush=True)
    db.update_class_status(class_id, "live")
    await manager.broadcast({"type": "class_status_change", "status": "live", "classId": class_id})
    return {"status": "ok", "classId": class_id, "classStatus": "live"}

@app.post("/api/classes/end")
async def end_class(class_id: str = Body(default="CS204A", embed=True)):
    print("[STT STOPPED]", flush=True)
    db.update_class_status(class_id, "ended")
    await manager.broadcast({"type": "class_ended", "classId": class_id})
    return {"status": "ok", "classId": class_id, "classStatus": "ended"}

@app.get("/api/classes/{class_id}/review")
async def get_class_review(class_id: str):
    transcripts = db.get_class_transcripts(class_id)
    raw_insights = db.get_class_raw_insights(class_id)
    draft_review = ai_extractor.generate_draft_review(class_id, transcripts, raw_insights)
    return {
        "status": "ok",
        "draft": draft_review,
        "transcripts": transcripts,
        "rawInsights": raw_insights
    }

@app.post("/api/classes/{class_id}/publish")
async def publish_verified_notes(class_id: str, notes: dict = Body(...)):
    db.save_verified_notes(class_id, notes)
    await manager.broadcast({
        "type": "notes_published",
        "classId": class_id,
        "notes": notes
    })
    return {"status": "ok", "classId": class_id, "message": "Teacher verified notes published successfully!"}

@app.get("/api/classes/{class_id}/verified-notes")
async def get_verified_notes_endpoint(class_id: str):
    notes = db.get_verified_notes(class_id)
    if not notes:
        return {"status": "none", "notes": None}
    return {"status": "ok", "notes": notes}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
