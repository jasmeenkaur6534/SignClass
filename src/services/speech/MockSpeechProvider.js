import { BaseSpeechProvider } from './SpeechProvider.js';
import { lectureScript } from '../../mock/lectureScript.js';

export class MockSpeechProvider extends BaseSpeechProvider {
  constructor() {
    super();
    this.currentIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.charTimer = null;
    this.lineTimer = null;
    this.audioVisualizerInterval = null;
    this.startMs = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.startMs = Date.now();
    this.emitStatus('listening');
    this.startAudioVisualizerEmulation();
    this.processNextLine();
  }

  pause() {
    this.isPaused = true;
    this.emitStatus('paused');
    if (this.charTimer) clearTimeout(this.charTimer);
    if (this.lineTimer) clearTimeout(this.lineTimer);
  }

  resume() {
    if (!this.isRunning) return this.start();
    this.isPaused = false;
    this.emitStatus('listening');
    this.processNextLine();
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.charTimer) clearTimeout(this.charTimer);
    if (this.lineTimer) clearTimeout(this.lineTimer);
    if (this.audioVisualizerInterval) clearInterval(this.audioVisualizerInterval);
    this.emitStatus('stopped');
  }

  skipToNextCheckpoint() {
    if (!this.isRunning) this.start();
    // Find next script line with a checkpoint
    const nextCheckpointIndex = lectureScript.findIndex((line, i) => i > this.currentIndex && line.checkpoint);
    if (nextCheckpointIndex !== -1) {
      this.currentIndex = nextCheckpointIndex;
      if (this.charTimer) clearTimeout(this.charTimer);
      if (this.lineTimer) clearTimeout(this.lineTimer);
      this.processNextLine();
    }
  }

  startAudioVisualizerEmulation() {
    this.audioVisualizerInterval = setInterval(() => {
      if (this.isRunning && !this.isPaused) {
        // Generate simulated voice audio input level between 20% and 85%
        const level = Math.random() * 65 + 20;
        this.emitAudioLevel(level);
      } else {
        this.emitAudioLevel(0);
      }
    }, 150);
  }

  processNextLine() {
    if (!this.isRunning || this.isPaused) return;
    if (this.currentIndex >= lectureScript.length) {
      this.currentIndex = 0; // Loop demo script cleanly
    }

    const currentLine = lectureScript[this.currentIndex];
    let currentCharCount = 0;
    const fullText = currentLine.text;

    // Simulate character by character interim typing (~40-50ms per character)
    const typeChar = () => {
      if (!this.isRunning || this.isPaused) return;

      currentCharCount += 2; // type 2 chars at a time for smooth speed
      if (currentCharCount <= fullText.length) {
        this.emitInterim(fullText.substring(0, currentCharCount));
        this.charTimer = setTimeout(typeChar, 45);
      } else {
        // Line typing complete — finalize segment
        const elapsedSec = Math.floor((Date.now() - this.startMs) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        const timestampLabel = `${mins}:${secs}`;

        const segment = {
          id: `seg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          speaker: currentLine.speaker || 'teacher',
          text: fullText,
          isFinal: true,
          startMs: elapsedSec * 1000,
          timestampLabel,
          checkpoint: currentLine.checkpoint || null
        };

        this.emitFinal(segment);
        this.emitInterim('');

        this.currentIndex++;
        // Schedule next line after realistic speech pause (1.8s)
        this.lineTimer = setTimeout(() => {
          this.processNextLine();
        }, 1800);
      }
    };

    typeChar();
  }
}
