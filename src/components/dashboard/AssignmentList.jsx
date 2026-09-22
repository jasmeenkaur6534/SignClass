import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext.jsx';

export function AssignmentList({ assignments }) {
  const { toggleAssignment } = useDashboard();

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-sm uppercase tracking-wider text-accent flex items-center gap-2">
          <CheckSquare size={16} /> Assignments
        </h3>
        <span className="badge-count">
          {assignments.filter(a => !a.completed).length} open
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {assignments.map(item => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              opacity: item.completed ? 0.6 : 1
            }}
            onClick={() => toggleAssignment(item.id)}
          >
            <input
              type="checkbox"
              className="checkbox-custom mt-1"
              checked={item.completed}
              onChange={() => {}} // handled by div click
            />
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-semibold ${item.completed ? 'line-through text-muted' : 'text-primary'}`}>
                {item.title}
              </span>
              <span className="text-xs text-muted">
                {item.subject} • Captured {item.capturedDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
