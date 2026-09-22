class PCMCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.targetSampleRate = 16000;
    // 100ms @ 16kHz = 1600 samples for small, ultra-fast PCM chunks
    this.targetFrameSamples = 1600;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelData = input[0]; // Float32Array of 128 samples at native sampleRate
    if (!channelData || channelData.length === 0) return true;

    // Resample on the fly to 16000Hz mono
    const sourceSampleRate = sampleRate; // global property in AudioWorkletGlobalScope
    const ratio = sourceSampleRate / this.targetSampleRate;

    if (Math.abs(ratio - 1.0) < 0.01) {
      for (let i = 0; i < channelData.length; i++) {
        this.buffer.push(channelData[i]);
      }
    } else {
      const outputLength = Math.round(channelData.length / ratio);
      for (let i = 0; i < outputLength; i++) {
        const srcIndex = i * ratio;
        const indexLow = Math.floor(srcIndex);
        const indexHigh = Math.min(indexLow + 1, channelData.length - 1);
        const weight = srcIndex - indexLow;

        const val = (1 - weight) * channelData[indexLow] + weight * channelData[indexHigh];
        this.buffer.push(val);
      }
    }

    // Accumulate small 100ms PCM frames (1600 samples = 3200 bytes) and post to main thread
    while (this.buffer.length >= this.targetFrameSamples) {
      const frameSamples = this.buffer.splice(0, this.targetFrameSamples);
      const int16Array = new Int16Array(frameSamples.length);

      for (let i = 0; i < frameSamples.length; i++) {
        const sample = Math.max(-1.0, Math.min(1.0, frameSamples[i]));
        int16Array[i] = sample < 0 ? sample * 32768 : sample * 32767;
      }

      // Transfer the underlying ArrayBuffer back to main thread
      this.port.postMessage(int16Array.buffer, [int16Array.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
