import React from 'react';
import { CheckCircle2, MessageSquareQuote } from 'lucide-react';

export function AnswerCard({ question }) {
  return (
    <div
      className="card flex flex-col gap-2"
      style={{
        backgroundColor: 'rgba(63, 207, 142, 0.08)',
        borderColor: 'var(--success)',
        borderLeftWidth: 5
      }}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase text-success">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={14} /> ANSWERED — Your Question
        </span>
        <span className="text-muted">[{question.answerTimestamp || 'Just now'}]</span>
      </div>

      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Q: "{question.text}"
      </div>

      <div className="text-sm italic p-2 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
        <MessageSquareQuote size={14} className="inline mr-1 text-success" />
        A: {question.answerQuote}
      </div>
    </div>
  );
}
