import React from 'react';
import { Clock, Star, Calendar, FileText, Check, ThumbsUp, ThumbsDown, HelpCircle, ExternalLink } from 'lucide-react';

export function InsightCard({ item, onJumpToTimestamp, onConfidenceFeedback }) {
  const isLowConfidence = item.confidence === 'low';

  const getTypeIcon = () => {
    switch (item.type) {
      case 'assignment': return <FileText size={16} className="text-accent" />;
      case 'deadline': return <Calendar size={16} className="text-warning" />;
      case 'exam_note': return <Star size={16} className="text-exam" />;
      default: return <Clock size={16} className="text-secondary" />;
    }
  };

  return (
    <div className={`insight-card ${isLowConfidence ? 'insight-card-low-confidence' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {getTypeIcon()}
          <span>{item.title}</span>
        </div>

        {item.sourceTimestamp && (
          <button
            className="insight-timestamp-link"
            onClick={() => onJumpToTimestamp && onJumpToTimestamp(item.sourceTimestamp)}
            title="Jump to source in transcript"
          >
            <Clock size={10} /> {item.sourceTimestamp} <ExternalLink size={10} />
          </button>
        )}
      </div>

      {item.detail && (
        <p className="text-xs text-secondary">{item.detail}</p>
      )}

      {item.dueLabel && (
        <div className="flex items-center gap-1 text-xs font-semibold text-warning mt-1">
          <Calendar size={12} /> Due: {item.dueLabel}
        </div>
      )}

      {/* Low Confidence Feedback Affordance */}
      {isLowConfidence && !item.confidenceFeedback && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed text-xs text-warning" style={{ borderColor: 'var(--border)' }}>
          <span className="flex items-center gap-1">
            <HelpCircle size={12} /> Confirm this AI extraction?
          </span>
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-sm p-1"
              onClick={() => onConfidenceFeedback && onConfidenceFeedback(item.id, 'confirmed')}
              title="Confirm item"
            >
              <ThumbsUp size={12} className="text-success" />
            </button>
            <button
              className="btn btn-ghost btn-sm p-1"
              onClick={() => onConfidenceFeedback && onConfidenceFeedback(item.id, 'rejected')}
              title="Reject item"
            >
              <ThumbsDown size={12} className="text-danger" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
