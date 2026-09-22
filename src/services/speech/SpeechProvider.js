/**
 * SpeechProvider interface definition contract.
 * Standardizes ASR providers: WebSpeechProvider (real mic) & MockSpeechProvider (demo script).
 */
export class BaseSpeechProvider {
  constructor() {
    this.interimCallbacks = [];
    this.finalCallbacks = [];
    this.errorCallbacks = [];
    this.statusCallbacks = [];
    this.audioLevelCallbacks = [];
  }

  onInterim(cb) { this.interimCallbacks.push(cb); }
  onFinal(cb) { this.finalCallbacks.push(cb); }
  onError(cb) { this.errorCallbacks.push(cb); }
  onStatus(cb) { this.statusCallbacks.push(cb); }
  onAudioLevel(cb) { this.audioLevelCallbacks.push(cb); }

  emitInterim(text) {
    this.interimCallbacks.forEach(cb => cb(text));
  }

  emitFinal(segment) {
    this.finalCallbacks.forEach(cb => cb(segment));
  }

  emitError(err) {
    this.errorCallbacks.forEach(cb => cb(err));
  }

  emitStatus(status) {
    this.statusCallbacks.forEach(cb => cb(status));
  }

  emitAudioLevel(level) {
    this.audioLevelCallbacks.forEach(cb => cb(level));
  }

  start() {
    throw new Error('start() must be implemented by SpeechProvider subclass');
  }

  stop() {
    throw new Error('stop() must be implemented by SpeechProvider subclass');
  }
}
