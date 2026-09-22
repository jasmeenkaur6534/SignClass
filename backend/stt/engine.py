import time
import threading
import logging
import speech_recognition as sr
import numpy as np
from . import config

logger = logging.getLogger("signclass.stt.engine")

class STTEngine:
    _instance = None
    _recognizer = None
    _is_loaded = False
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = STTEngine()
        return cls._instance

    def load(self):
        if self._is_loaded:
            return
        logger.info("Initializing SpeechRecognition Google STT engine...")
        print("[STT STARTED] SpeechRecognition Google STT Engine initialized.", flush=True)
        self._recognizer = sr.Recognizer()
        self._is_loaded = True

    @property
    def is_loaded(self):
        return self._is_loaded

    def transcribe(self, audio_np):
        """
        Transcribes float32 mono PCM numpy array @ 16kHz using Python SpeechRecognition recognize_google().
        Returns transcribed text string.
        """
        if not self._is_loaded or self._recognizer is None:
            self.load()

        if audio_np is None or len(audio_np) == 0:
            return ""

        # Convert float32 [-1.0, 1.0] array to 16-bit PCM LE bytes
        int16_arr = (np.clip(audio_np, -1.0, 1.0) * 32767.0).astype(np.int16)
        pcm_bytes = int16_arr.tobytes()

        audio_data = sr.AudioData(pcm_bytes, config.SAMPLE_RATE, 2)

        print("[STT LISTENING]", flush=True)

        try:
            with STTEngine._lock:
                text = self._recognizer.recognize_google(
                    audio_data,
                    language=config.LANGUAGE or "en-US"
                )
                text = text.strip()
                if text:
                    print(f"[STT TEXT] {text}", flush=True)
                return text
        except sr.UnknownValueError:
            # Silence or unintelligible speech chunk
            return ""
        except sr.RequestError as e:
            logger.error(f"Google Speech Recognition service error: {e}")
            print(f"[STT ERROR] Google API error: {e}", flush=True)
            return ""
        except Exception as e:
            logger.error(f"STT Transcription error: {e}")
            return ""
