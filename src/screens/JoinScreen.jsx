import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Mic, MicOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export function JoinScreen() {
  const navigate = useNavigate();
  const { demoMode, setDemoMode } = useSettings();
  const [classCode, setClassCode] = useState('CS204A');
  const [micState, setMicState] = useState('idle'); // idle, granted, denied
  const [audioLevel, setAudioLevel] = useState(0);

  // Request mic permission on mount to show live level meter
  useEffect(() => {
    let stream = null;
    let animId = null;

    async function checkMic() {
      try {
        setMicState('requesting');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicState('granted');

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          setAudioLevel(Math.min(100, Math.round((sum / dataArray.length / 128) * 100)));
          animId = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (err) {
        setMicState('denied');
        // Non-blocking fallback: automatically switch to Demo Mode
        setDemoMode(true);
      }
    }

    checkMic();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animId) cancelAnimationFrame(animId);
    };
  }, [setDemoMode]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (classCode.length < 3) return;
    navigate('/live');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base" style={{ background: 'radial-gradient(circle at center, #161B22 0%, #0D1117 100%)' }}>
      <div className="card w-full max-w-md flex flex-col gap-6 p-8 shadow-lg">
        {/* Brand Wordmark & Tagline */}
        <div className="flex flex-col items-center text-center gap-2">
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 24,
            color: '#FFF',
            boxShadow: '0 0 20px rgba(77, 163, 255, 0.4)'
          }}>
            SC
          </div>
          <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>SignClass</h1>
          <p className="text-sm text-secondary font-medium">Never miss what's said in class.</p>
        </div>

        {/* Mic Denied Fallback Banner */}
        {micState === 'denied' && (
          <div className="p-3 rounded text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--warning-muted)', color: 'var(--warning)' }}>
            <MicOff size={16} className="shrink-0" />
            <span>Microphone unavailable. Running on sample lecture audio.</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary">Class Code</label>
            <input
              type="text"
              className="input-text text-center text-xl font-bold uppercase tracking-widest"
              maxLength={6}
              value={classCode}
              onChange={e => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS204A"
              required
            />
          </div>

          {/* Mic Level Meter */}
          <div className="flex items-center justify-between p-3 rounded text-xs" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <span className="flex items-center gap-2 font-semibold text-secondary">
              <Mic size={14} className={micState === 'granted' ? 'text-success' : 'text-muted'} />
              Room Audio Check
            </span>
            {micState === 'granted' ? (
              <div className="flex items-center gap-2">
                <div style={{ width: 60, height: 6, backgroundColor: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${audioLevel}%`, height: '100%', backgroundColor: 'var(--success)', transition: 'width 0.1s' }} />
                </div>
                <span className="text-success font-bold">Live</span>
              </div>
            ) : (
              <span className="text-muted">Demo Audio</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full">
            Join Live Class <ArrowRight size={18} />
          </button>
        </form>

        {/* Secondary Navigation Links */}
        <div className="flex items-center justify-between text-xs border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <button className="btn btn-ghost btn-sm text-secondary" onClick={() => navigate('/dashboard')}>
            Continue to Student Dashboard →
          </button>

          <button
            className="btn btn-ghost btn-sm text-muted"
            onClick={() => setDemoMode(!demoMode)}
            title="Toggle Demo Mode (Ctrl+Shift+D)"
          >
            {demoMode ? '⚡ Demo Mode: ON' : 'Live Mic'}
          </button>
        </div>

        <p className="text-xs text-muted text-center flex items-center justify-center gap-1">
          <ShieldCheck size={12} /> Audio processed live in-memory and never recorded.
        </p>
      </div>
    </div>
  );
}
