import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, FileText, Calendar, Star, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { InsightCard } from './InsightCard.jsx';

export function InsightsPanel({
  currentTopic,
  earlierTopics,
  actionItems,
  keyTerms,
  onJumpToTimestamp,
  onConfidenceFeedback
}) {
  const navigate = useNavigate();
  const [showEarlierTopics, setShowEarlierTopics] = useState(false);

  const assignments = actionItems.filter(i => i.type === 'assignment');
  const deadlines = actionItems.filter(i => i.type === 'deadline');
  const examNotes = actionItems.filter(i => i.type === 'exam_note');

  return (
    <aside className="insights-zone" role="complementary" aria-label="AI Classroom Insights">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-bold text-sm uppercase tracking-wider text-accent flex items-center gap-2">
          ✨ AI Classroom Insights
        </h2>
        <span className="text-xs text-muted">Auto-updated live</span>
      </div>

      {/* 1. CURRENT TOPIC */}
      <section className="insights-section">
        <div className="insights-header">
          <span className="flex items-center gap-2">
            <Layers size={14} className="text-accent" /> CURRENT TOPIC
          </span>
        </div>

        <div className="card p-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <div className="font-bold text-base text-accent">
            {currentTopic?.title || 'Binary Search Trees'}
          </div>

          {currentTopic?.subpoints && currentTopic.subpoints.length > 0 && (
            <ul className="text-xs text-secondary flex flex-col gap-1 pl-4 style-disc">
              {currentTopic.subpoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          )}

          {earlierTopics && earlierTopics.length > 0 && (
            <div className="mt-2 pt-2 border-t text-xs text-muted" style={{ borderColor: 'var(--border)' }}>
              <button
                className="btn btn-ghost btn-sm p-0 flex items-center gap-1 text-xs"
                onClick={() => setShowEarlierTopics(!showEarlierTopics)}
              >
                {showEarlierTopics ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                Earlier Topics ({earlierTopics.length})
              </button>
              {showEarlierTopics && (
                <div className="flex flex-col gap-1 mt-1 pl-2">
                  {earlierTopics.map((t, idx) => (
                    <span key={idx} className="line-through text-muted">• {t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. ASSIGNMENTS */}
      <section className="insights-section">
        <div className="insights-header">
          <span className="flex items-center gap-2">
            <FileText size={14} className="text-accent" /> ASSIGNMENTS
          </span>
          <span className="badge-count">{assignments.length}</span>
        </div>

        {assignments.length === 0 ? (
          <p className="text-xs text-muted italic">No assignments mentioned yet.</p>
        ) : (
          assignments.map(item => (
            <InsightCard
              key={item.id}
              item={item}
              onJumpToTimestamp={onJumpToTimestamp}
              onConfidenceFeedback={onConfidenceFeedback}
            />
          ))
        )}
      </section>

      {/* 3. DEADLINES */}
      <section className="insights-section">
        <div className="insights-header">
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-warning" /> DEADLINES
          </span>
          <span className="badge-count" style={{ backgroundColor: 'var(--warning)' }}>
            {deadlines.length}
          </span>
        </div>

        {deadlines.length === 0 ? (
          <p className="text-xs text-muted italic">No deadlines mentioned yet.</p>
        ) : (
          deadlines.map(item => (
            <InsightCard
              key={item.id}
              item={item}
              onJumpToTimestamp={onJumpToTimestamp}
              onConfidenceFeedback={onConfidenceFeedback}
            />
          ))
        )}
      </section>

      {/* 4. EXAM NOTES */}
      <section className="insights-section">
        <div className="insights-header">
          <span className="flex items-center gap-2">
            <Star size={14} className="text-exam" /> EXAM NOTES
          </span>
          <span className="badge-count" style={{ backgroundColor: 'var(--exam)' }}>
            {examNotes.length}
          </span>
        </div>

        {examNotes.length === 0 ? (
          <p className="text-xs text-muted italic">No exam notes flagged yet.</p>
        ) : (
          examNotes.map(item => (
            <InsightCard
              key={item.id}
              item={item}
              onJumpToTimestamp={onJumpToTimestamp}
              onConfidenceFeedback={onConfidenceFeedback}
            />
          ))
        )}
      </section>

      {/* 5. KEY TERMS */}
      <section className="insights-section">
        <div className="insights-header">
          <span className="flex items-center gap-2">
            <BookOpen size={14} className="text-success" /> KEY TERMS
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {keyTerms.map((term, idx) => (
            <button
              key={idx}
              className="pill pill-upcoming flex items-center gap-1 cursor-pointer"
              onClick={() => navigate(`/isl?search=${encodeURIComponent(term)}`)}
              title="Look up in ISL Library"
            >
              <BookOpen size={10} className="text-success" /> {term}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
