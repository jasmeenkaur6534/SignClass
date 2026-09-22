import { BaseSpeechProvider } from './SpeechProvider.js';
import { VITE_STT_WS_URL } from './sttConfig.js';

export class PythonSpeechProvider extends BaseSpeechProvider {
  static _activeInstance = null;

  constructor() {
    super();
    this.ws = null;
    this.micStream = null;
    this.audioCtx = null;
    this.analyser = null;
    this.workletNode = null;
    this.scriptProcessor = null;
    this.isRunning = false;
    this.isStopped = false;
    this.isPaused = false;
    this.startMs = 0;
    this.animFrameId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimer = null;
    this.pipelineCallbacks = [];

    this.pipelineState = {
      micConnected: false,
      backendConnected: false,
      isListening: false,
      isProcessing: false,
      transcriptCount: 0,
      audioLevel: 0
    };
  }

  onPipelineStatus(cb) {
    this.pipelineCallbacks.push(cb);
  }

  updatePipelineState(partial) {
    this.pipelineState = { ...this.pipelineState, ...partial };
    this.pipelineCallbacks.forEach(cb => cb(this.pipelineState));
  }

  async start() {
    if (this.isRunning || (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN))) {
      console.log('[SESSION ALREADY ACTIVE] Ignoring duplicate start');
      return;
    }

    if (PythonSpeechProvider._activeInstance && PythonSpeechProvider._activeInstance !== this) {
      console.log('[SESSION CLEANUP] Auto-stopping previous active PythonSpeechProvider instance');
      PythonSpeechProvider._activeInstance.stop();
    }
    PythonSpeechProvider._activeInstance = this;

    if (!window.isSecureContext) {
      this.emitError({
        code: 'INSECURE_CONTEXT',
        message: 'Microphone requires localhost or HTTPS.'
      });
      this.updatePipelineState({ micConnected: false, backendConnected: false, isListening: false });
      this.emitStatus('stopped');
      return;
    }

    console.log('[SESSION START] Initializing single PythonSpeechProvider session');
    this.isRunning = true;
    this.isStopped = false;
    this.startMs = Date.now();
    this.reconnectAttempts = 0;
    this.emitStatus('connecting');
    this.updatePipelineState({ isListening: false });

    this.connectWebSocket();
  }

  connectWebSocket() {
    try {
      const wsUrl = VITE_STT_WS_URL.includes('?') ? VITE_STT_WS_URL : `${VITE_STT_WS_URL}?class_id=CS204A`;
      console.log('[WS CONNECTING] Connecting to STT backend at', wsUrl);
      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';
    } catch (err) {
      console.error('[WS ERROR] Failed to instantiate WebSocket:', err);
      this.emitError({
        code: 'BACKEND_UNAVAILABLE',
        message: 'Speech engine not reachable at localhost:8000. Is the Python backend running?'
      });
      this.updatePipelineState({ backendConnected: false });
      this.emitStatus('stopped');
      this.isRunning = false;
      return;
    }

    let opened = false;

    this.ws.onopen = async () => {
      opened = true;
      if (!this.isRunning || this.isStopped) {
        console.log('[SESSION STOPPED] Aborting microphone setup because session was stopped');
        this.stop();
        return;
      }

      console.log('[WS OPEN] WebSocket connection established successfully.');
      this.reconnectAttempts = 0;
      this.updatePipelineState({ backendConnected: true });

      // Acquire microphone
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw { name: 'NotFoundError' };
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!this.isRunning || this.isStopped) {
          console.log('[SESSION STOPPED] Aborting audio hardware setup after getUserMedia');
          stream.getTracks().forEach(track => track.stop());
          this.stop();
          return;
        }

        this.micStream = stream;
        console.log('[MIC STARTED] Microphone stream acquired successfully via getUserMedia.');
        this.updatePipelineState({ micConnected: true, isListening: true });
        await this.setupAudioHardware(this.micStream);
        this.emitStatus('listening');
      } catch (err) {
        console.error('[MIC ERROR] Microphone acquisition failed:', err);
        let code = 'MIC_FAILED';
        let message = 'Microphone acquisition failed.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          code = 'MIC_DENIED';
          message = 'Microphone blocked. Allow access in the browser address bar, then Retry.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          code = 'NO_MIC';
          message = 'No microphone detected on this device.';
        }

        this.updatePipelineState({ micConnected: false, isListening: false });
        this.emitError({ code, message });
        this.emitStatus('stopped');
        this.stop();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'status') {
          this.emitStatus(msg.status);
          if (msg.status === 'listening') {
            this.updatePipelineState({ isListening: true, isProcessing: false });
          }
        } else if (msg.type === 'interim') {
          const text = msg.text || (msg.segment ? msg.segment.text : '');
          if (text) {
            const now = Date.now();
            const e2eMs = msg.sent_ts ? (now - msg.sent_ts) : null;
            console.log(`[INTERIM RENDERED] "${text}" | STT Latency: ${msg.stt_latency_ms || '?'}ms | E2E Latency: ${e2eMs !== null ? e2eMs + 'ms' : 'N/A'}`);
            this.emitInterim(text);
            this.updatePipelineState({ isProcessing: true });
          }
        } else if (msg.type === 'final') {
          const text = (msg.segment ? msg.segment.text : msg.text) || '';
          if (text.trim()) {
            const now = Date.now();
            const e2eMs = msg.sent_ts ? (now - msg.sent_ts) : null;
            console.log(`[FINAL RENDERED] "${text}" | STT Latency: ${msg.stt_latency_ms || '?'}ms | E2E Latency: ${e2eMs !== null ? e2eMs + 'ms' : 'N/A'}`);

            const elapsedSec = Math.floor((now - this.startMs) / 1000);
            const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
            const secs = String(elapsedSec % 60).padStart(2, '0');
            const isQuestion = text.trim().endsWith('?');

            const segment = msg.segment || {
              id: `seg_py_${now}_${Math.random().toString(36).slice(2, 6)}`,
              speaker: isQuestion ? 'student' : 'teacher',
              text: text.trim(),
              isFinal: true,
              startMs: elapsedSec * 1000,
              timestampLabel: `${mins}:${secs}`
            };

            this.emitFinal(segment);
            this.emitInterim('');
            this.updatePipelineState({
              isProcessing: false,
              transcriptCount: this.pipelineState.transcriptCount + 1
            });
          }
        } else if (msg.type === 'error') {
          if (msg.fatal) {
            this.emitError({
              code: msg.code || 'MODEL_LOAD_FAILED',
              message: msg.message || 'Speech model failed to load. Check backend terminal.'
            });
            this.emitStatus('stopped');
            this.stop();
          } else {
            console.warn('Non-fatal STT backend error:', msg.message);
          }
        }
      } catch (e) {
        console.warn('Error parsing STT message:', e);
      }
    };

    this.ws.onerror = (err) => {
      if (!opened) {
        this.updatePipelineState({ backendConnected: false });
        this.emitError({
          code: 'BACKEND_UNAVAILABLE',
          message: 'Speech engine not reachable at localhost:8000. Is the Python backend running?'
        });
        this.emitStatus('stopped');
      }
    };

    this.ws.onclose = () => {
      this.updatePipelineState({ backendConnected: false });
      if (this.isRunning) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.emitStatus('reconnecting');
          const delay = Math.pow(2, this.reconnectAttempts - 1) * 1000;
          this.reconnectTimer = setTimeout(() => {
            if (this.isRunning) {
              this.connectWebSocket();
            }
          }, delay);
        } else {
          this.emitError({
            code: 'BACKEND_UNAVAILABLE',
            message: 'Speech engine not reachable at localhost:8000. Is the Python backend running?'
          });
          this.emitStatus('stopped');
          this.stop();
        }
      }
    };
  }

  async setupAudioHardware(stream) {
    try {
      // Use native AudioContext without hardcoded sampleRate so Windows/macOS sound cards don't throw NotSupportedError
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const source = this.audioCtx.createMediaStreamSource(stream);

      // Silent gain node to route worklet/processor to destination without feedback
      const dummyGain = this.audioCtx.createGain();
      dummyGain.gain.value = 0;
      dummyGain.connect(this.audioCtx.destination);

      // AnalyserNode for audio level meter
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      let lastMeterUpdate = 0;

      const updateMeter = () => {
        if (!this.isRunning) return;
        const now = Date.now();
        if (now - lastMeterUpdate > 100) {
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const average = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((average / 128) * 100));
          this.emitAudioLevel(normalized);
          this.updatePipelineState({ audioLevel: normalized });
          lastMeterUpdate = now;
        }
        this.animFrameId = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      const sourceSampleRate = this.audioCtx.sampleRate;
      const targetSampleRate = 16000;

      // Resampling helper: downsamples Float32Array to 16000Hz Int16Array
      const resampleToInt16 = (inputData) => {
        if (sourceSampleRate === targetSampleRate) {
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16[i] = s < 0 ? s * 32768 : s * 32767;
          }
          return int16;
        }

        const ratio = sourceSampleRate / targetSampleRate;
        const newLength = Math.floor(inputData.length / ratio);
        const int16 = new Int16Array(newLength);

        for (let i = 0; i < newLength; i++) {
          const srcIdx = i * ratio;
          const idxLow = Math.floor(srcIdx);
          const idxHigh = Math.min(idxLow + 1, inputData.length - 1);
          const weight = srcIdx - idxLow;

          const val = (1 - weight) * inputData[idxLow] + weight * inputData[idxHigh];
          const clamped = Math.max(-1, Math.min(1, val));
          int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
        }
        return int16;
      };

      // AudioWorklet initialization with explicit logging
      let pcmPacketsSent = 0;
      try {
        await this.audioCtx.audioWorklet.addModule('/pcm-capture-processor.js');
        console.log('[AUDIOWORKLET LOADED] /pcm-capture-processor.js module added successfully');

        this.workletNode = new AudioWorkletNode(this.audioCtx, 'pcm-capture-processor');
        source.connect(this.workletNode);
        this.workletNode.connect(dummyGain); // REQUIRED for Chrome/Edge to execute process()
        console.log('[AUDIOWORKLET STARTED] PCMCaptureProcessor node connected and active');

        this.workletNode.port.onmessage = (event) => {
          if (this.isRunning && !this.isPaused && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const arrayBuffer = event.data;
            pcmPacketsSent++;

            if (pcmPacketsSent % 10 === 0) {
              console.log(`[PCM CHUNK] size: ${arrayBuffer.byteLength} bytes`);
              console.log(`[PCM SENT] frame: ${pcmPacketsSent}`);
            }

            this.ws.send(arrayBuffer);
          }
        };
      } catch (workletErr) {
        console.warn('AudioWorklet failed, using robust ScriptProcessor fallback:', workletErr);
        const bufferSize = 4096;
        this.scriptProcessor = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
        source.connect(this.scriptProcessor);
        this.scriptProcessor.connect(dummyGain); // REQUIRED to execute onaudioprocess without speaker echo

        this.scriptProcessor.onaudioprocess = (e) => {
          if (!this.isRunning || this.isPaused || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = resampleToInt16(inputData);
          this.ws.send(pcm16.buffer);
          pcmPacketsSent++;
          if (pcmPacketsSent % 10 === 0) {
            console.log(`[PCM CHUNK] size: ${pcm16.buffer.byteLength} bytes (fallback)`);
            console.log(`[PCM SENT] frame: ${pcmPacketsSent} (fallback)`);
          }
        };
      }
    } catch (e) {
      console.warn('AudioContext setup error:', e);
    }
  }

  pause() {
    this.isPaused = true;
    this.updatePipelineState({ isListening: false });
    this.emitStatus('paused');
  }

  resume() {
    this.isPaused = false;
    this.updatePipelineState({ isListening: true });
    this.emitStatus('listening');
  }

  stop() {
    console.log('[SESSION STOP] Stopping PythonSpeechProvider session');
    this.isRunning = false;
    this.isStopped = true;

    if (PythonSpeechProvider._activeInstance === this) {
      PythonSpeechProvider._activeInstance = null;
    }

    this.updatePipelineState({ micConnected: false, isListening: false, isProcessing: false });

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      const wsToClose = this.ws;
      this.ws = null;
      wsToClose.onopen = null;
      wsToClose.onmessage = null;
      wsToClose.onerror = null;
      wsToClose.onclose = null;
      try {
        if (wsToClose.readyState === WebSocket.OPEN) {
          wsToClose.send(JSON.stringify({ type: 'stop' }));
        }
      } catch (e) {}
      try {
        wsToClose.close(1000, 'session ended');
      } catch (e) {}
    }

    if (this.workletNode) {
      try {
        if (this.workletNode.port) {
          this.workletNode.port.onmessage = null;
          this.workletNode.port.close();
        }
        this.workletNode.disconnect();
      } catch (e) {}
      this.workletNode = null;
    }

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.onaudioprocess = null;
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.micStream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.emitStatus('stopped');
    this.emitAudioLevel(0);
    console.log('[SESSION CLEANUP] Cleanup completed successfully');
  }
}
