import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, ExternalLink, Clock } from 'lucide-react';

export function DeadlinePanel({ deadlines }) {
  const navigate = useNavigate();

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-sm uppercase tracking-wider text-warning flex items-center gap-2">
          <Calendar size={16} /> Deadlines
        </h3>
        <span className="badge-count" style={{ backgroundColor: 'var(--warning)' }}>
          {deadlines.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {deadlines.map(item => {
          const urgencyClass = item.urgency === 'due-today'
            ? 'urgency-due-today'
            : item.urgency === 'soon'
            ? 'urgency-soon'
            : 'urgency-later';

          return (
            <div key={item.id} className={`deadline-card ${urgencyClass}`}>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm text-primary">{item.title}</span>
                <span className="text-xs text-muted">{item.subject} • {item.dueLabel}</span>
              </div>

              {item.sourceTimestamp && (
                <button
                  className="insight-timestamp-link shrink-0"
                  onClick={() => navigate('/summary')}
                  title="Source captured from live class"
                >
                  <Clock size={10} /> {item.sourceTimestamp} <ExternalLink size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
