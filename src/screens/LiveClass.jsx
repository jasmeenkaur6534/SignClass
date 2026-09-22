import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageSquare, LogOut, Clock, Settings, Type } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { CaptionStream } from '../components/live/CaptionStream.jsx';
import { InsightsPanel } from '../components/live/InsightsPanel.jsx';
import { MissedMomentModal } from '../components/live/MissedMomentModal.jsx';
import { AskBackComposer } from '../components/live/AskBackComposer.jsx';
import { DemoPresenterBar } from '../components/live/DemoPresenterBar.jsx';
import { SettingsModal } from '../components/layout/SettingsModal.jsx';

export function LiveClass() {
  const navigate = useNavigate();
  const { captionSize, setCaptionSize } = useSettings();
  const {
    segments,
    interimText,
    asrStatus,
    asrError,
    currentTopic,
    earlierTopics,
    actionItems,
    keyTerms,
    questions,
    latestHighlightId,
    startSession,
    stopSession,
    retryConnection,
    updateInsightConfidence
  } = useSession();

  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
  const [isAskBackOpen, setIsAskBackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(14 * 60 + 32); // Start at 00:14:32

  // Start session on mount
  useEffect(() => {
    startSession();
    const clockInterval = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Keyboard shortcut listener: 'A' for Ask Back, 'M' for What did I miss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsAskBackOpen(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMissedModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatClock = (sec) => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleExitSession = () => {
    stopSession();
    navigate('/summary');
  };

  return (
    <div className="live-layout">
      {/* 64px Sticky Top Header */}
      <header className="live-header">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="font-bold text-base block leading-tight" style={{ color: 'var(--text-primary)' }}>
              Data Structures & Algorithms
            </span>
            <span className="text-xs text-muted">Prof. R. Menon • Room 204</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="pill pill-live">
            <span className="pill-live-dot" /> LIVE {formatClock(sessionSeconds)}
          </div>

          <div className="flex items-center gap-1 border-l pl-3" style={{ borderColor: 'var(--border)' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsSettingsOpen(true)}
              title="Caption Font Controls"
            >
              <Type size={16} /> Font
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          <button className="btn btn-danger btn-sm" onClick={handleExitSession}>
            <LogOut size={16} /> Exit Class
          </button>
        </div>
      </header>

      {/* Main Split Layout: 62% Captions / 38% Insights */}
      <div className="live-main">
        <CaptionStream
          segments={segments}
          interimText={interimText}
          questions={questions}
          currentTopic={currentTopic}
          latestHighlightId={latestHighlightId}
          asrStatus={asrStatus}
          asrError={asrError}
          onRetryConnection={retryConnection}
        />

        <InsightsPanel
          currentTopic={currentTopic}
          earlierTopics={earlierTopics}
          actionItems={actionItems}
          keyTerms={keyTerms}
          onJumpToTimestamp={(ts) => {
            const matchSeg = segments.find(s => s.timestampLabel === ts);
            if (matchSeg) {
              const el = document.getElementById(`caption-${matchSeg.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onConfidenceFeedback={updateInsightConfidence}
        />
      </div>

      {/* 72px Bottom Sticky Action Bar */}
      <footer className="live-action-bar">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => setIsMissedModalOpen(true)}
          >
            <HelpCircle size={18} className="text-accent" />
            <span>? What did I miss</span>
            <span className="text-xs text-muted hidden-mobile">(Key: M)</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsAskBackOpen(true)}
          >
            <MessageSquare size={18} />
            <span>✋ Ask Back</span>
            <span className="text-xs text-white opacity-80 hidden-mobile">(Key: A)</span>
          </button>
        </div>

        {/* Font Size Scaling Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Font Size:</span>
          {[
            { size: '18px', label: 'A−' },
            { size: '24px', label: 'A' },
            { size: '32px', label: 'A+' }
          ].map(item => (
            <button
              key={item.size}
              className={`btn btn-sm ${captionSize === item.size ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCaptionSize(item.size)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </footer>

      {/* Modals & Overlays */}
      {isMissedModalOpen && (
        <MissedMomentModal
          segments={segments}
          currentTopic={currentTopic}
          actionItems={actionItems}
          onClose={() => setIsMissedModalOpen(false)}
          onViewFullTranscript={() => {
            setIsMissedModalOpen(false);
            navigate('/recap');
          }}
        />
      )}

      {isAskBackOpen && (
        <AskBackComposer onClose={() => setIsAskBackOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Hackathon Presenter Controls */}
      <DemoPresenterBar />
    </div>
  );
}
