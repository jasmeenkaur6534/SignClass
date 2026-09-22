import os
from dotenv import load_dotenv

load_dotenv()

MODEL_SIZE = os.getenv("MODEL_SIZE", "base")
DEVICE = os.getenv("DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "int8")
CPU_THREADS = int(os.getenv("CPU_THREADS", str(min(4, os.cpu_count() or 4))))
NUM_WORKERS = int(os.getenv("NUM_WORKERS", "1"))

raw_lang = os.getenv("LANGUAGE", "en").strip()
LANGUAGE = raw_lang if raw_lang else None

SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", "16000"))
FRAME_MS = int(os.getenv("FRAME_MS", "125"))
INTERIM_INTERVAL_MS = int(os.getenv("INTERIM_INTERVAL_MS", "250"))
SILENCE_FINALIZE_MS = int(os.getenv("SILENCE_FINALIZE_MS", "400"))
MIN_SPEECH_MS = int(os.getenv("MIN_SPEECH_MS", "250"))
MAX_UTTERANCE_SECONDS = int(os.getenv("MAX_UTTERANCE_SECONDS", "3"))
MAX_BUFFER_SECONDS = int(os.getenv("MAX_BUFFER_SECONDS", "10"))

# Lowered threshold to 0.002 to catch quiet speech on laptop microphones
VAD_RMS_THRESHOLD = float(os.getenv("VAD_RMS_THRESHOLD", "0.002"))

raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
