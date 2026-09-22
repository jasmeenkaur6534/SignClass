import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Settings, Sun, Moon, Eye, PlayCircle, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { SettingsModal } from './SettingsModal.jsx';

export function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, demoMode } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      <header className="live-header">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#FFF'
            }}>
              SC
            </div>
            <div>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>SignClass</span>
              <span className="text-muted text-xs block" style={{ marginTop: -2 }}>Classroom Companion</span>
            </div>
          </div>

          {demoMode && (
            <span className="pill pill-live" style={{ fontSize: 11 }}>
              <PlayCircle size={12} /> DEMO MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted text-sm hidden-mobile">{todayFormatted}</span>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/isl')}
            title="ISL Vocabulary Library"
          >
            <BookOpen size={18} />
            <span>ISL Library</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsSettingsOpen(true)}
            title="Accessibility & Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
}
