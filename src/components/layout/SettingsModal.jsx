import React from 'react';
import { X, Type, Moon, Sun, Eye, Radio } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

export function SettingsModal({ onClose }) {
  const { captionSize, setCaptionSize, theme, setTheme, demoMode, setDemoMode } = useSettings();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Type size={20} className="text-accent" /> Accessibility & Settings
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body flex flex-col gap-6">
          {/* Caption Font Size Control */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-secondary">Caption Font Size</label>
            <div className="flex gap-2">
              {[
                { size: '18px', label: 'A− (Small 18px)' },
                { size: '24px', label: 'A (Default 24px)' },
                { size: '32px', label: 'A+ (Large 32px)' }
              ].map(item => (
                <button
                  key={item.size}
                  className={`btn flex-1 ${captionSize === item.size ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCaptionSize(item.size)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-muted text-xs">Adjust text scaling for comfortable reading from classroom distance.</p>
          </div>

          {/* Theme Switcher */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-secondary">Visual Theme</label>
            <div className="flex gap-2">
              <button
                className={`btn flex-1 ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={16} /> Dark (Default)
              </button>
              <button
                className={`btn flex-1 ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={16} /> Light
              </button>
              <button
                className={`btn flex-1 ${theme === 'high-contrast' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme('high-contrast')}
              >
                <Eye size={16} /> High Contrast
              </button>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-4 card">
            <div>
              <span className="font-semibold text-sm block">Demo Mode (Scripted Presentation)</span>
              <span className="text-muted text-xs">ON: replays a scripted lecture. OFF: live microphone via local Python speech engine.</span>
            </div>
            <button
              className={`btn btn-sm ${demoMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDemoMode(!demoMode)}
            >
              <Radio size={14} /> {demoMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
