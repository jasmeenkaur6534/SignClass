import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Clock, ArrowRight, FileText } from 'lucide-react';

export function ClassCard({ item }) {
  const navigate = useNavigate();
  const isLive = item.status === 'live';
  const isDone = item.status === 'done';

  return (
    <div className={`class-card ${isLive ? 'class-card-live' : ''}`}>
      <div className="class-header-row">
        <span className={`pill ${isLive ? 'pill-live' : isDone ? 'pill-done' : 'pill-upcoming'}`}>
          {isLive && <span className="pill-live-dot" />}
          {item.status.toUpperCase()}
        </span>
        {isDone && (
          <span className="pill" style={{ background: 'var(--success-muted)', color: 'var(--success)', border: '1px solid var(--success)' }}>
            Teacher Verified Notes ✓
          </span>
        )}
        <span className="text-muted text-xs font-semibold flex items-center gap-1">
          <Clock size={12} /> {item.time}
        </span>
      </div>

      <div>
        <h3 className="class-title">{item.subject}</h3>
        <p className="class-details flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1"><User size={14} /> {item.teacher}</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {item.room}</span>
        </p>
      </div>

      {item.topic && (
        <div className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
          <strong>Topic:</strong> {item.topic}
        </div>
      )}

      <div className="flex justify-end mt-2">
        {isLive ? (
          <button className="btn btn-primary" onClick={() => navigate('/live')}>
            Join Live Class <ArrowRight size={16} />
          </button>
        ) : isDone ? (
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/summary')}>
            <FileText size={14} /> View Summary
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" disabled>
            Upcoming
          </button>
        )}
      </div>
    </div>
  );
}
