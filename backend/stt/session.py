import time
import asyncio
import numpy as np
import logging
from . import config
from .engine import STTEngine

logger = logging.getLogger("signclass.stt.session")

class StreamingSession:
    def __init__(self):
        self.buffer = np.array([], dtype=np.float32)
        self.silence_ms = 0
        self.speech_ms = 0
        self.has_speech_in_buffer = False
        self.last_interim_time = 0
        self.start_time = time.time()
        self.lock = asyncio.Lock()
        self.received_frames = 0

    def process_pcm_frame(self, pcm_bytes: bytes):
        if not pcm_bytes or len(pcm_bytes) % 2 != 0:
            return

        # Convert 16-bit PCM Int16 LE to float32 [-1.0, 1.0]
        int16_arr = np.frombuffer(pcm_bytes, dtype=np.int16)
        float32_arr = int16_arr.astype(np.float32) / 32768.0

        if len(float32_arr) == 0:
            return

        # Compute RMS energy
        rms = float(np.sqrt(np.mean(float32_arr ** 2)))
        frame_duration_ms = int((len(float32_arr) / config.SAMPLE_RATE) * 1000)
        self.received_frames += 1

        # Consider frames with RMS >= 0.0005 as speech
        if rms >= 0.0005:
            self.silence_ms = 0
            self.speech_ms += frame_duration_ms
            self.has_speech_in_buffer = True
        else:
            self.silence_ms += frame_duration_ms

        now_ms = int(time.time() * 1000)
        if self.received_frames % 10 == 0:
            msg = f"[AUDIO RECEIVED] ts: {now_ms} | frame: #{self.received_frames} | bytes: {len(pcm_bytes)} | buffer: {len(self.buffer)/config.SAMPLE_RATE:.2f}s"
            logger.info(msg)
            print(msg, flush=True)

        self.buffer = np.concatenate([self.buffer, float32_arr])

    def should_interim(self) -> bool:
        buffer_duration_sec = len(self.buffer) / config.SAMPLE_RATE
        if buffer_duration_sec < 0.3:
            return False

        now = time.time()
        if (now - self.last_interim_time) * 1000 < config.INTERIM_INTERVAL_MS:
            return False

        return True

    def should_finalize(self) -> bool:
        buffer_duration_sec = len(self.buffer) / config.SAMPLE_RATE
        if buffer_duration_sec < 0.3:
            return False

        # Continuous audio cap (finalize every 3.0 seconds during continuous speech)
        if buffer_duration_sec >= config.MAX_UTTERANCE_SECONDS:
            return True

        # Silence-driven finalization (400ms silence after at least 0.5s buffer)
        if self.silence_ms >= config.SILENCE_FINALIZE_MS and buffer_duration_sec >= 0.5:
            return True

        return False

    async def get_interim_result(self):
        if self.lock.locked():
            return None

        async with self.lock:
            if len(self.buffer) == 0:
                return None

            # ROLLING AUDIO SNAPSHOT: Cap interim window to last 1.5 seconds max (24,000 samples @ 16kHz)
            # This prevents re-transcribing the full accumulated conversation audio buffer!
            max_rolling_samples = int(1.5 * config.SAMPLE_RATE)
            audio_snapshot = np.copy(self.buffer[-max_rolling_samples:])
            self.last_interim_time = time.time()

        try:
            buffer_ms = int((len(audio_snapshot) / config.SAMPLE_RATE) * 1000)
            t0 = time.time()
            t0_ms = int(t0 * 1000)
            
            print(f"[INTERIM START] ts: {t0_ms} | rolling_slice: {buffer_ms}ms", flush=True)

            text = await asyncio.to_thread(STTEngine.get_instance().transcribe, audio_snapshot)
            text = text.strip()

            t1 = time.time()
            t1_ms = int(t1 * 1000)
            stt_latency = int((t1 - t0) * 1000)

            print(f"[INTERIM END] ts: {t1_ms} | text: \"{text}\"", flush=True)
            print(f"[INTERIM LATENCY] {stt_latency} ms", flush=True)

            if not text:
                return None

            return {
                "type": "interim",
                "text": text,
                "buffer_ms": buffer_ms,
                "stt_latency_ms": stt_latency,
                "interim_start_ts": t0_ms,
                "interim_end_ts": t1_ms
            }
        except Exception as e:
            logger.error(f"Interim transcription error: {e}")
            return None

    async def get_final_result(self):
        async with self.lock:
            if len(self.buffer) == 0:
                self.reset()
                return None

            audio_snapshot = np.copy(self.buffer)
            duration_ms = int((len(audio_snapshot) / config.SAMPLE_RATE) * 1000)
            self.reset()

        try:
            t0 = time.time()
            t0_ms = int(t0 * 1000)
            
            print(f"[FINAL START] ts: {t0_ms} | duration: {duration_ms}ms", flush=True)

            text = await asyncio.to_thread(STTEngine.get_instance().transcribe, audio_snapshot)
            text = text.strip()

            t1 = time.time()
            t1_ms = int(t1 * 1000)
            stt_latency = int((t1 - t0) * 1000)

            print(f"[FINAL END] ts: {t1_ms} | text: \"{text}\"", flush=True)
            print(f"[FINAL LATENCY] {stt_latency} ms", flush=True)

            if not text or len(text) < 2:
                print(f"[FINAL RESULT DISCARDED] Noise fragment discarded.", flush=True)
                return None

            return {
                "type": "final",
                "text": text,
                "duration_ms": duration_ms,
                "stt_latency_ms": stt_latency,
                "final_start_ts": t0_ms,
                "final_end_ts": t1_ms,
                "language": config.LANGUAGE or "en"
            }
        except Exception as e:
            logger.error(f"Final transcription error: {e}")
            return None

    def reset(self):
        self.buffer = np.array([], dtype=np.float32)
        self.silence_ms = 0
        self.speech_ms = 0
        self.has_speech_in_buffer = False
        self.last_interim_time = 0
