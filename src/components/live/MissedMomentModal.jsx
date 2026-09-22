import React from 'react';
import { X, MapPin, BookOpen, CheckSquare, Star, ArrowLeft } from 'lucide-react';
import { generateMissedMomentSummary } from '../../services/ai/summarizeMissed.js';

export function MissedMomentModal({ segments, currentTopic, actionItems, onClose, onViewFullTranscript }) {
  const summary = generateMissedMomentSummary(segments, currentTopic, actionItems, 12);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              ⚡ YOU MISSED 12 MINUTES
            </h3>
            <span className="text-xs text-muted">Instant AI catch-up recap for late arrivals</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body flex flex-col gap-5">
          {summary.isShortRecap ? (
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-sm text-secondary">Recent Lecture Activity (&lt; 3 mins):</span>
              {summary.recentSegments.map(seg => (
                <div key={seg.id} className="p-3 card text-sm">
                  <span className="text-xs text-muted block mb-1">[{seg.timestampLabel}] {seg.speaker}</span>
                  {seg.text}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 1. Where the class is now */}
              <div className="card p-3 flex flex-col gap-1" style={{ backgroundColor: 'var(--accent-muted)', borderColor: 'var(--accent)' }}>
                <span className="text-xs font-bold uppercase text-accent flex items-center gap-1">
                  <MapPin size={14} /> Where the class is now
                </span>
                <span className="font-bold text-base text-primary">{summary.whereNow}</span>
              </div>

              {/* 2. What was covered */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-secondary flex items-center gap-1">
                  <BookOpen size={14} /> What was covered
                </span>
                <ul className="flex flex-col gap-2 pl-2">
                  {summary.coveredBullets.map((bullet, idx) => (
                    <li key={idx} className="text-sm text-primary flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. You need to do */}
              {summary.todoItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-warning flex items-center gap-1">
                    <CheckSquare size={14} /> You need to do
                  </span>
                  <ul className="flex flex-col gap-2 pl-2">
                    {summary.todoItems.map((item, idx) => (
                      <li key={idx} className="text-sm font-semibold text-warning flex items-start gap-2">
                        <span>📝</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Marked important */}
              {summary.importantItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-exam flex items-center gap-1">
                    <Star size={14} /> Marked important
                  </span>
                  <ul className="flex flex-col gap-2 pl-2">
                    {summary.importantItems.map((note, idx) => (
                      <li key={idx} className="text-sm font-semibold text-exam flex items-start gap-2">
                        <span>⭐</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer justify-between">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              onClose();
              if (onViewFullTranscript) onViewFullTranscript();
            }}
          >
            Read Full Transcript
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Back to Live Lecture
          </button>
        </div>
      </div>
    </div>
  );
}
