import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, FastForward, Home, Layers, BookOpen, CheckSquare, Sparkles } from 'lucide-react';
import { useSession } from '../../context/SessionContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export function DemoPresenterBar() {
  const navigate = useNavigate();
  const { demoMode } = useSettings();
  const { asrStatus, pauseSession, resumeSession, skipToNextCheckpoint } = useSession();

  const isPaused = asrStatus === 'paused';

  // Presenter Cheat Codes: Space = pause/resume, Right Arrow = next checkpoint, 1-6 = screen jumps
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPaused) resumeSession();
        else pauseSession();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipToNextCheckpoint();
      } else if (e.key === '1') navigate('/');
      else if (e.key === '2') navigate('/dashboard');
      else if (e.key === '3') navigate('/live');
      else if (e.key === '4') navigate('/recap');
      else if (e.key === '5') navigate('/summary');
      else if (e.key === '6') navigate('/isl');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, pauseSession, resumeSession, skipToNextCheckpoint, navigate]);

  if (!demoMode) return null;

  return (
    <div className="presenter-bar">
      <span className="text-xs font-bold text-accent uppercase flex items-center gap-1">
        <Sparkles size={12} /> Presenter Controls
      </span>

      <button
        className="btn btn-ghost btn-sm text-xs"
        onClick={() => isPaused ? resumeSession() : pauseSession()}
        title="Play / Pause Script (Space)"
      >
        {isPaused ? <Play size={14} className="text-success" /> : <Pause size={14} className="text-warning" />}
        <span>{isPaused ? 'Resume' : 'Pause'}</span>
      </button>

      <button
        className="btn btn-ghost btn-sm text-xs"
        onClick={skipToNextCheckpoint}
        title="Skip to Next Checkpoint (→)"
      >
        <FastForward size={14} className="text-accent" />
        <span>Next AI Checkpoint</span>
      </button>

      <div className="h-4 w-px bg-border my-auto" />

      {/* Screen Navigation Jump Shortcuts */}
      <div className="flex items-center gap-1">
        {[
          { key: '1', label: '1 Join', path: '/' },
          { key: '2', label: '2 Dash', path: '/dashboard' },
          { key: '3', label: '3 Live', path: '/live' },
          { key: '4', label: '4 Recap', path: '/recap' },
          { key: '5', label: '5 Summary', path: '/summary' },
          { key: '6', label: '6 ISL', path: '/isl' }
        ].map(item => (
          <button
            key={item.key}
            className="btn btn-ghost btn-sm text-xs py-1 px-2"
            onClick={() => navigate(item.path)}
            title={`Jump to Screen ${item.key}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
