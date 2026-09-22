import React, { useState } from 'react';
import { X, Send, Shield, Sparkles, CheckCircle2, Eye, Clock } from 'lucide-react';
import { useSession } from '../../context/SessionContext.jsx';

export function AskBackComposer({ onClose }) {
  const { sendAskBackQuestion, questions } = useSession();
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const quickChips = [
    "Please repeat that",
    "Can you write that on the board?",
    "What page in textbook?",
    "Please slow down",
    "Can you face the class?"
  ];

  const handleSend = () => {
    if (!text.trim()) return;
    sendAskBackQuestion(text.trim(), isAnonymous);
    setText('');
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              ✋ Ask Back — Non-Verbal Question
            </h3>
            <span className="text-xs text-muted">Sent to teacher's lectern screen. Answer comes back as caption.</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body flex flex-col gap-4">
          {/* Quick Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> One-Tap Quick Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setText(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area Input */}
          <div className="flex flex-col gap-1">
            <textarea
              className="input-text"
              rows={4}
              maxLength={280}
              placeholder="Type your question for the teacher here… (Cmd/Ctrl + Enter to send)"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="flex items-center justify-between text-xs text-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                />
                <span className="flex items-center gap-1 text-secondary">
                  <Shield size={12} className="text-success" /> Ask Anonymously (Default)
                </span>
              </label>

              <span>{text.length} / 280</span>
            </div>
          </div>

          {/* My Questions Status Tracker */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase text-secondary">My Sent Questions</span>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {questions.map(q => (
                  <div key={q.id} className="p-3 card flex items-center justify-between text-xs">
                    <span className="font-medium text-primary line-clamp-1">{q.text}</span>
                    <div className="flex items-center gap-1 font-semibold">
                      {q.status === 'sent' && (
                        <span className="text-muted flex items-center gap-1">
                          <Clock size={12} /> Sent ✓
                        </span>
                      )}
                      {q.status === 'seen' && (
                        <span className="text-warning flex items-center gap-1">
                          <Eye size={12} /> Seen by Teacher
                        </span>
                      )}
                      {q.status === 'answered' && (
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle2 size={12} /> Answered!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!text.trim()}
          >
            <Send size={16} /> Send Question
          </button>
        </div>
      </div>
    </div>
  );
}
