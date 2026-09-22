import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { Search, Layers, FileText, Star, MessageSquare, ArrowLeft } from 'lucide-react';

export function RecapScreen() {
  const navigate = useNavigate();
  const { segments, currentTopic, earlierTopics, actionItems, questions } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all'); // all, assignments, exam_notes, questions

  const filteredSegments = segments.filter(seg => {
    if (searchQuery && !seg.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <TopHeader />

      <main className="max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/live')}>
              <ArrowLeft size={18} /> Back to Live Class
            </button>
            <div>
              <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                Session Timeline & Full Recap
              </h1>
              <p className="text-sm text-secondary">
                Search transcript lines, inspect topic shifts, and review extracted insights.
              </p>
            </div>
          </div>
        </div>

        {/* Topic Markers Timeline Chips */}
        <div className="card p-4 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1">
            <Layers size={14} /> Topic Timeline Anchor Chips
          </span>
          <div className="flex flex-wrap gap-2">
            {[...(earlierTopics || []), currentTopic?.title].filter(Boolean).map((t, idx) => (
              <span key={idx} className="pill pill-upcoming flex items-center gap-1">
                <span className="font-bold text-accent">#{idx + 1}</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-3 text-muted" />
            <input
              type="text"
              className="input-text pl-9 py-2"
              placeholder="Search in full transcript..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Segments' },
              { id: 'assignments', label: 'Assignments' },
              { id: 'exam_notes', label: 'Exam Notes' },
              { id: 'questions', label: 'My Questions' }
            ].map(f => (
              <button
                key={f.id}
                className={`btn btn-sm ${filterTag === f.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterTag(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transcript Segments Feed */}
        <div className="flex flex-col gap-3">
          {filteredSegments.length === 0 ? (
            <div className="card p-8 text-center text-muted">
              No matching transcript segments found.
            </div>
          ) : (
            filteredSegments.map(seg => (
              <div key={seg.id} className="card p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase">
                  <span className={seg.speaker === 'student' ? 'text-success' : 'text-accent'}>
                    {seg.speaker === 'student' ? '✋ Student' : '👨‍🏫 Teacher'}
                  </span>
                  <span className="text-muted">[{seg.timestampLabel}]</span>
                </div>
                <p className="text-base text-primary">{seg.text}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
