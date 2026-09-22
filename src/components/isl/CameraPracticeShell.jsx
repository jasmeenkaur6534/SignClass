import React, { useState, useRef } from 'react';
import { Camera, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
import { islEntries } from '../../mock/islEntries.js';

export function CameraPracticeShell() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const sampleSign = islEntries[0]; // "Submit"

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (e) {
      alert('Camera access unavailable. Video preview simulation active.');
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <div className="card p-6 flex flex-col gap-6" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="font-bold text-lg text-primary flex items-center gap-2">
            📷 ISL Camera Side-by-Side Practice
          </h3>
          <span className="text-xs text-muted">
            Record and compare your hand movements directly with the reference ISL sign.
          </span>
        </div>
        {!isCameraActive ? (
          <button className="btn btn-primary btn-sm" onClick={startCamera}>
            <Camera size={16} /> Enable Camera
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={stopCamera}>
            Stop Camera
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Reference Sign Video Box */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-accent">Reference Sign: {sampleSign.term}</span>
          <div className="sign-media-box rounded-lg flex flex-col items-center justify-center p-4">
            <div style={{ fontSize: 40, animation: 'pulseDot 1.5s infinite ease-in-out' }}>
              🤟
            </div>
            <span className="text-xs text-secondary text-center mt-2 font-medium">
              "{sampleSign.description}"
            </span>
          </div>
        </div>

        {/* Right: Camera Feed Preview Box with Guide Overlay */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase text-success">Your Live Camera Feed</span>
          <div className="camera-preview-box">
            {isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4 text-muted flex flex-col items-center gap-2">
                <Video size={32} />
                <span className="text-xs font-semibold">Click "Enable Camera" to align handshape</span>
              </div>
            )}
            <div className="camera-overlay-guide">
              Align Hands in Guide Frame
            </div>
          </div>
        </div>
      </div>

      {/* Honest Recognition Note */}
      <div className="p-3 rounded text-xs flex items-start gap-2" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Computer Vision Sign Recognition Status:</strong> Full automatic AI sign recognition pipeline is in active research & development. Today you can record, compare, and verify your hand gesture execution side-by-side.
        </div>
      </div>
    </div>
  );
}
