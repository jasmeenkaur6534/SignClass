import { BaseSpeechProvider } from './SpeechProvider.js';

export class WebSpeechProvider extends BaseSpeechProvider {
  constructor() {
    super();
    this.recognition = null;
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.isRunning = false;
    this.startMs = 0;
    this.animFrameId = null;
  }

  async start() {
    if (this.isRunning) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.emitError({ code: 'NOT_SUPPORTED', message: 'Web Speech API is not supported in this browser.' });
      return;
    }

    try {
      // Setup Web Audio API mic level meter
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupAudioMeter(this.micStream);

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Optimized for Indian English accents

      this.startMs = Date.now();
      this.isRunning = true;
      this.emitStatus('listening');

      this.recognition.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const elapsedSec = Math.floor((Date.now() - this.startMs) / 1000);
            const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
            const secs = String(elapsedSec % 60).padStart(2, '0');

            // Speaker heuristic: student if utterance ends with question mark or short pause
            const isQuestion = transcript.trim().endsWith('?');

            const segment = {
              id: `seg_live_${Date.now()}`,
              speaker: isQuestion ? 'student' : 'teacher',
              text: transcript.trim(),
              isFinal: true,
              startMs: elapsedSec * 1000,
              timestampLabel: `${mins}:${secs}`
            };
            this.emitFinal(segment);
          } else {
            interimText += transcript;
          }
        }
        if (interimText) {
          this.emitInterim(interimText);
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('WebSpeech Recognition error:', err);
        this.emitStatus('reconnecting');
      };

      // Auto-restart handler to prevent Chrome 60s continuous speech silence timeout
      this.recognition.onend = () => {
        if (this.isRunning) {
          setTimeout(() => {
            try {
              this.recognition.start();
              this.emitStatus('listening');
            } catch (e) {
              console.warn('Failed auto-restarting WebSpeech:', e);
            }
          }, 200);
        }
      };

      this.recognition.start();
    } catch (err) {
      this.emitError({ code: 'MIC_DENIED', message: 'Microphone permission denied or unavailable.' });
      this.emitStatus('stopped');
    }
  }

  setupAudioMeter(stream) {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!this.isRunning) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        this.emitAudioLevel(normalized);
        this.animFrameId = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      console.warn('AudioContext meter setup failed:', e);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.emitStatus('stopped');
    this.emitAudioLevel(0);
  }
}
