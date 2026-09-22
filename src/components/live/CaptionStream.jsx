import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Radio, Activity, Mic, Cpu } from 'lucide-react';
import { CaptionBlock } from './CaptionBlock.jsx';
import { TopicDivider } from './TopicDivider.jsx';
import { AnswerCard } from './AnswerCard.jsx';
import { useSession } from '../../context/SessionContext.jsx';

export function CaptionStream({
  segments,
  interimText,
  questions,
  currentTopic,
  latestHighlightId,
  asrStatus,
  asrError,
  onRetryConnection
}) {
  const { pipelineStatus } = useSession();
  const streamRef = useRef(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Handle scroll events
  const handleScroll = () => {
    if (!streamRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = streamRef.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 50;

    if (!isAtBottom) {
      setUserHasScrolledUp(true);
    } else {
      setUserHasScrolledUp(false);
    }
  };

  // Smart auto-scroll to bottom
  useEffect(() => {
    if (!userHasScrolledUp && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [segments, interimText, userHasScrolledUp]);

  const scrollToBottom = () => {
    setUserHasScrolledUp(false);
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  };

  const answeredQuestions = questions.filter(q => q.status === 'answered');

  const isListening = asrStatus === 'listening' || pipelineStatus.isListening;
  const isProcessing = pipelineStatus.isProcessing || interimText.length > 0;

  return (
    <div className="caption-zone flex flex-col gap-3">
      {/* Live Pipeline Status Bar for Student */}
      <div className="flex items-center justify-between p-3 rounded card text-xs" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className={isListening ? 'text-success' : 'text-muted'}>
              {isListening ? '🟢 LIVE CAPTIONING ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <span className="text-muted">|</span>

          <span className="flex items-center gap-1 font-semibold text-secondary">
            <Cpu size={14} className={isProcessing ? 'text-warning animate-pulse' : 'text-muted'} />
            STT: {isProcessing ? '⚙ Processing audio…' : 'Idle'}
          </span>
        </div>

        {pipelineStatus.audioLevel > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted font-mono text-xs">Teacher Mic:</span>
            <div style={{ width: 50, height: 6, backgroundColor: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pipelineStatus.audioLevel}%`, height: '100%', backgroundColor: 'var(--success)', transition: 'width 0.1s' }} />
            </div>
          </div>
        )}
      </div>

      {/* ASR Error Banner */}
      {asrError && (
        <div
          className="p-3 card flex items-center justify-between gap-3 text-warning"
          style={{ borderColor: 'var(--warning)', background: 'var(--bg-elevated)', borderLeft: '4px solid var(--warning)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase px-2 py-1 rounded" style={{ background: 'var(--warning)', color: '#000' }}>
              ASR Notice
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {asrError.message}
            </span>
          </div>
          {onRetryConnection && (
            <button className="btn btn-secondary btn-sm" onClick={onRetryConnection}>
              Retry Connection
            </button>
          )}
        </div>
      )}

      {/* Main Caption Scroll Stream */}
      <div
        ref={streamRef}
        className="caption-stream flex-1"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Live Caption Stream"
      >
        {segments.length === 0 && !interimText && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted gap-2 py-16">
            <div className="pill pill-live mb-2">
              <span className="pill-live-dot" /> {asrStatus.toUpperCase()}
            </div>
            <p className="font-semibold text-xl" style={{ color: 'var(--text-secondary)' }}>
              Listening to classroom audio…
            </p>
            <p className="text-sm max-w-ch">
              Captions will stream here live as the teacher speaks. Key concepts and assignments will update in the right panel.
            </p>
          </div>
        )}

        {segments.map((seg, idx) => {
          const isTopicBoundary = seg.checkpoint === 'topic_change_1';
          return (
            <React.Fragment key={seg.id || idx}>
              {isTopicBoundary && (
                <TopicDivider title={currentTopic?.title || 'Tree Rotations & Balancing'} />
              )}
              <CaptionBlock
                segment={seg}
                isHighlighted={latestHighlightId === seg.id}
              />
            </React.Fragment>
          );
        })}

        {/* Answered Questions Cards inside stream */}
        {answeredQuestions.map(q => (
          <AnswerCard key={q.id} question={q} />
        ))}

        {/* Interim (in-progress) transcript styling */}
        {interimText && (
          <div className="caption-block caption-interim">
            <div className="caption-meta">
              <span className="caption-speaker-teacher">👨‍🏫 Teacher (Speaking…)</span>
              <span className="text-muted">Live</span>
            </div>
            <p className="caption-text">
              {interimText}<span style={{ opacity: 0.6 }}> ▓</span>
            </p>
          </div>
        )}
      </div>

      {/* Floating Jump to Live Pill */}
      {userHasScrolledUp && (
        <button className="jump-live-pill" onClick={scrollToBottom}>
          <ArrowDown size={16} /> Jump to Live Captions
        </button>
      )}
    </div>
  );
}
