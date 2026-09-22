# SignClass — Python Speech-to-Text Backend

FastAPI + `faster-whisper` WebSocket server providing offline continuous Speech-to-Text for SignClass.

## Requirements
- Python 3.9+
- Microphone input (captured client-side via AudioWorklet)

## Setup & Running

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Run server
uvicorn main:app --reload --port 8000
```

## Environment Variables (.env)
- `MODEL_SIZE`: `tiny` | `base` | `small` (default: `small`)
- `DEVICE`: `cpu` | `cuda` (default: `cpu`)
- `COMPUTE_TYPE`: `int8` | `float16` (default: `int8`)
- `LANGUAGE`: `en` (default)
- `VAD_RMS_THRESHOLD`: `0.01` (speech energy sensitivity)

## Endpoints
- `GET http://localhost:8000/health`: Service & model status probe.
- `WS ws://localhost:8000/ws/stt`: Streaming 16kHz Int16 PCM audio input, JSON events output.
