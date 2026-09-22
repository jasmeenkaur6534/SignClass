import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Mic, MicOff, CheckCircle2, Eye, MessageSquare, Clock, ShieldCheck, Edit2, Trash2, ArrowRight, Radio, Activity, Cpu, Database, Check } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import { teacherSync } from '../services/sync/teacherSync.js';
import { VITE_STT_WS_URL, VITE_STT_HEALTH_URL } from '../services/speech/sttConfig.js';

export function TeacherView() {
  const navigate = useNavigate();
  const {
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    segments,
    interimText,
    pipelineStatus,
    asrStatus,
    asrError,
    audioLevel
  } = useSession();

  const [classStatus, setClassStatus] = useState('upcoming'); // upcoming, live, paused, ended
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [extractedItems, setExtractedItems] = useState([]);
  const [questions, setQuestions] = useState([
    {
      id: 'demo_q_1',
      text: 'Why does the binary search tree become unbalanced if inputs arrive in sorted order?',
      anonymous: true,
      status: 'sent',
      askedAtMs: Date.now() - 30000,
      timestampLabel: '00:10'
    }
  ]);

  const apiBase = VITE_STT_HEALTH_URL.replace('/health', '');

  // Class Timer Effect
  useEffect(() => {
    let timer = null;
    if (classStatus === 'live') {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [classStatus]);

  // Listen for Ask Back student questions
  useEffect(() => {
    const unsubscribe = teacherSync.subscribe((data) => {
      if (data.type === 'NEW_QUESTION') {
        setQuestions(prev => [data.question, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  const handleStartClass = async () => {
    setClassStatus('live');
    startSession();

    try {
      await fetch(`${apiBase}/api/classes/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: 'CS204A' })
      });
    } catch (e) {}
  };

  const handlePauseClass = () => {
    if (classStatus === 'live') {
      setClassStatus('paused');
      pauseSession();
    } else {
      setClassStatus('live');
      resumeSession();
    }
  };

  const handleEndClass = async () => {
    setClassStatus('ended');
    stopSession();

    try {
      await fetch(`${apiBase}/api/classes/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: 'CS204A' })
      });
    } catch (e) {}

    // Navigate to Teacher Review & Verify portal
    navigate('/teacher/verify');
  };

  const formatClock = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleMarkQuestionAnswered = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'answered' } : q));
    teacherSync.markQuestionAnswered(id, 'Answered out loud in class');
  };

  const handleDeleteItem = (id) => {
    setExtractedItems(prev => prev.filter(i => i.id !== id));
  };

  // Status Indicators
  const isMicConnected = pipelineStatus.micConnected;
  const isBackendConnected = pipelineStatus.backendConnected;
  const isListening = classStatus === 'live' && (pipelineStatus.isListening || asrStatus === 'listening');
  const isProcessing = pipelineStatus.isProcessing || interimText.length > 0;
  const transcriptCount = segments.length;

  return (
    <div className="min-h-screen bg-base flex flex-col p-6" style={{ background: 'radial-gradient(circle at top center, #161B22 0%, #0D1117 100%)' }}>
      {/* Header Bar */}
      <header className="max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 20,
            color: '#FFF',
            boxShadow: '0 0 20px rgba(77, 163, 255, 0.4)'
          }}>
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                Lectern Control Dashboard
              </h1>
              <span className="text-xs text-muted font-mono">Prof. R. Menon</span>
            </div>
            <span className="text-xs text-secondary">Data Structures & Algorithms (CS204A) • Room 204</span>
          </div>
        </div>

        {/* Action Controls & Timer */}
        <div className="flex items-center gap-4">
          <div className="pill pill-live flex items-center gap-2 px-3 py-1.5 text-sm">
            <Clock size={16} />
            <span className="font-mono font-bold">{formatClock(sessionSeconds)}</span>
          </div>

          {classStatus === 'upcoming' && (
            <button className="btn btn-primary btn-lg flex items-center gap-2" onClick={handleStartClass}>
              <Play size={18} /> Start Live Class
            </button>
          )}

          {classStatus === 'live' && (
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary flex items-center gap-2" onClick={handlePauseClass}>
                <Pause size={16} /> Pause
              </button>
              <button className="btn btn-danger btn-lg flex items-center gap-2" onClick={handleEndClass}>
                <Square size={16} /> End Class & Verify Notes <ArrowRight size={16} />
              </button>
            </div>
          )}

          {classStatus === 'paused' && (
            <div className="flex items-center gap-2">
              <button className="btn btn-primary flex items-center gap-2" onClick={handlePauseClass}>
                <Play size={16} /> Resume Class
              </button>
              <button className="btn btn-danger btn-lg flex items-center gap-2" onClick={handleEndClass}>
                <Square size={16} /> End Class & Verify Notes <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 5 Visible Status Indicators Bar */}
      <div className="max-w-7xl w-full mx-auto py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded card" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          {/* 1. Mic Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isMicConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className="font-semibold text-secondary">Microphone:</span>
            <span className={`font-bold ${isMicConnected ? 'text-success' : 'text-muted'}`}>
              {isMicConnected ? '🟢 Connected' : 'Disconnected'}
            </span>
          </div>

          {/* 2. Backend Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
            <span className="font-semibold text-secondary">Backend:</span>
            <span className={`font-bold ${isBackendConnected ? 'text-success' : 'text-danger'}`}>
              {isBackendConnected ? '🟢 Connected' : 'Offline'}
            </span>
          </div>

          {/* 3. Listening */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-accent font-bold">🎙</span>
            <span className="font-semibold text-secondary">Status:</span>
            <span className={`font-bold ${isListening ? 'text-accent' : 'text-muted'}`}>
              {isListening ? 'Listening' : 'Standby'}
            </span>
          </div>

          {/* 4. Processing */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-warning font-bold">⚙</span>
            <span className="font-semibold text-secondary">STT Engine:</span>
            <span className={`font-bold ${isProcessing ? 'text-warning animate-pulse' : 'text-muted'}`}>
              {isProcessing ? 'Processing' : 'Idle'}
            </span>
          </div>

          {/* 5. Transcripts Received */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-success font-bold">✓</span>
            <span className="font-semibold text-secondary">Transcripts:</span>
            <span className="font-bold text-primary">{transcriptCount} Received</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Live Transcript Stream */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Live Audio Level Meter Bar */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic size={20} className={isListening ? 'text-success' : 'text-muted'} />
              <div>
                <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                  Microphone Audio Input Visualizer
                </span>
                <span className="text-xs text-secondary">
                  Real-time audio soundwave meter feeding into Python Whisper engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-end gap-1 h-6 w-32 p-1 rounded" style={{ backgroundColor: 'var(--border)' }}>
                {[20, 40, 65, 85, 50, 30, 90, 75, 40, 60, 80, 45].map((threshold, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${audioLevel >= threshold ? Math.min(100, audioLevel + (i % 3) * 10) : 15}%`,
                      backgroundColor: audioLevel >= threshold ? 'var(--success)' : 'var(--text-muted)',
                      borderRadius: 1,
                      transition: 'height 0.1s ease'
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-success w-10 text-right">{audioLevel}%</span>
            </div>
          </div>

          {/* Live Spoken Transcript Stream Area */}
          <div className="card p-6 flex flex-col gap-4 flex-1" style={{ minHeight: 420 }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-base text-primary flex items-center gap-2">
                <Activity size={18} className="text-accent" /> Live Classroom Spoken Transcript Stream
              </h3>
              <span className="text-xs text-muted">Auto-scrolling • Synchronized to students</span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-96 pr-2 flex-1">
              {segments.length === 0 && !interimText && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted gap-2">
                  <div className="pill pill-upcoming mb-2">MIC READY</div>
                  <p className="font-semibold text-lg" style={{ color: 'var(--text-secondary)' }}>
                    No classroom speech captured yet.
                  </p>
                  <p className="text-sm max-w-md">
                    Click <strong>"Start Live Class"</strong> and speak into your laptop microphone. Your speech will be transcribed live and broadcast to all connected students.
                  </p>
                </div>
              )}

              {segments.map((seg, idx) => (
                <div key={seg.id || idx} className="p-3.5 rounded flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '4px solid var(--accent)' }}>
                  <div className="flex items-center justify-between text-xs text-muted font-mono">
                    <span className="font-bold text-accent">[{seg.timestampLabel}] Teacher</span>
                    <span className="text-success font-semibold">✓ Final Segment</span>
                  </div>
                  <p className="text-base text-primary font-medium leading-relaxed">{seg.text}</p>
                </div>
              ))}

              {interimText && (
                <div className="p-3.5 rounded flex flex-col gap-1.5 italic" style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '4px solid var(--warning)' }}>
                  <div className="flex items-center justify-between text-xs text-warning font-mono">
                    <span className="font-bold">👨‍🏫 Teacher Speaking…</span>
                    <span className="animate-pulse">Live Interim</span>
                  </div>
                  <p className="text-base text-secondary font-medium">{interimText} <span style={{ opacity: 0.6 }}>▓</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time AI Extracted Insights & Student Questions */}
        <div className="flex flex-col gap-6">
          {/* AI Extracted Information Live Panel */}
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-warning flex items-center gap-2">
                <Cpu size={16} /> Real-Time AI Extracted Info ({extractedItems.length})
              </h3>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {extractedItems.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">
                  AI will automatically extract homework, deadlines, and exam notes in real time as you speak.
                </p>
              ) : (
                extractedItems.map(item => (
                  <div key={item.id} className="p-3 rounded flex items-center justify-between gap-2" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-accent">{item.type}</span>
                      <span className="text-xs text-primary font-medium">{item.title}</span>
                      {item.dueLabel && <span className="text-xs text-muted">Due: {item.dueLabel}</span>}
                    </div>
                    <button className="btn btn-ghost btn-sm text-danger p-1" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Ask Back Questions Queue */}
          <div className="card p-5 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-accent flex items-center gap-2">
                <MessageSquare size={16} /> Student Questions Queue ({questions.filter(q => q.status !== 'answered').length})
              </h3>
            </div>

            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
              {questions.map(q => (
                <div key={q.id} className="p-3 rounded flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '4px solid var(--accent)' }}>
                  <div className="flex items-center justify-between text-xs text-muted font-mono">
                    <span className="font-bold">{q.anonymous ? '🛡️ Anonymous Student' : 'Student'}</span>
                    <span>[{q.timestampLabel}]</span>
                  </div>
                  <p className="text-sm font-bold text-primary">"{q.text}"</p>

                  <div className="flex justify-end gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    {q.status !== 'answered' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handleMarkQuestionAnswered(q.id)}>
                        <CheckCircle2 size={14} /> Answer Out Loud
                      </button>
                    ) : (
                      <span className="text-xs text-success font-bold flex items-center gap-1">
                        <Check size={14} /> Answered Aloud ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
