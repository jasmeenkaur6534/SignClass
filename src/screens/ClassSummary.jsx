import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { FileText, Download, Copy, Check, Edit2, Trash2, Star, Layers, Calendar, ArrowLeft } from 'lucide-react';

export function ClassSummary() {
  const navigate = useNavigate();
  const { segments, currentTopic, earlierTopics, actionItems, questions, editActionItem, deleteActionItem } = useSession();
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const wordCount = segments.reduce((sum, s) => sum + s.text.split(' ').length, 0);
  const assignments = actionItems.filter(i => i.type === 'assignment' || i.type === 'deadline');
  const examNotes = actionItems.filter(i => i.type === 'exam_note');

  const generateMarkdownReport = () => {
    let md = `# Class Summary — Data Structures & Algorithms (CS204A)\n`;
    md += `**Date:** ${new Date().toLocaleDateString()} | **Teacher:** Prof. R. Menon | **Duration:** 45 mins | **Word Count:** ${wordCount} words\n\n`;

    md += `## 📍 Topics Covered\n`;
    [...(earlierTopics || []), currentTopic?.title].filter(Boolean).forEach((t, i) => {
      md += `${i + 1}. ${t}\n`;
    });

    md += `\n## 📝 Action Items & Homework\n`;
    assignments.forEach(item => {
      md += `- [ ] **${item.title}** (Due: ${item.dueLabel || 'Soon'}) — *Captured at [${item.sourceTimestamp || '00:00'}]*\n`;
    });

    md += `\n## ⭐ Exam Notes & Hints\n`;
    examNotes.forEach(item => {
      md += `- ⭐ ${item.title}\n`;
    });

    md += `\n## ✋ Questions & Answers\n`;
    questions.forEach(q => {
      md += `- **Q:** ${q.text}\n  **A:** ${q.answerQuote || 'Answered aloud'}\n`;
    });

    md += `\n## 📜 Full Transcript\n`;
    segments.forEach(s => {
      md += `[${s.timestampLabel}] ${s.speaker.toUpperCase()}: ${s.text}\n`;
    });

    return md;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (ext) => {
    const content = generateMarkdownReport();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SignClass_Summary_CS204A.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = (id) => {
    if (editTitle.trim()) {
      editActionItem(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <TopHeader />

      <main className="max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleCopyText}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => handleDownloadFile('md')}>
              <Download size={14} /> Download .md
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadFile('txt')}>
              <Download size={14} /> Download .txt
            </button>
          </div>
        </div>

        {/* Session Header Card */}
        <div className="card p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                Data Structures & Algorithms (CS204A)
              </h1>
              <span className="text-sm text-secondary">Prof. R. Menon • Room 204</span>
            </div>
            <span className="pill pill-done">Completed</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
            <div>
              <span className="text-xs text-muted block uppercase">Date</span>
              <span className="font-bold text-primary">{new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-xs text-muted block uppercase">Duration</span>
              <span className="font-bold text-primary">45 Minutes</span>
            </div>
            <div>
              <span className="text-xs text-muted block uppercase">Transcript Words</span>
              <span className="font-bold text-accent">{wordCount} Words</span>
            </div>
          </div>
        </div>

        {/* Action Items List with Edit/Delete */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-base text-warning flex items-center gap-2">
              <Calendar size={18} /> Extracted Action Items & Homework ({assignments.length})
            </h3>
            <span className="text-xs text-muted">Student editable — AI claims verified</span>
          </div>

          <div className="flex flex-col gap-3">
            {assignments.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                {editingId === item.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      className="input-text py-1 text-sm"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(item.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-primary">
                        {item.title} {item.edited && <span className="text-xs text-accent">(Edited)</span>}
                      </span>
                      <span className="text-xs text-muted">
                        Due: {item.dueLabel || 'Soon'} • Source: [{item.sourceTimestamp || '00:00'}]
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost btn-sm p-1"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditTitle(item.title);
                        }}
                        title="Edit Item"
                      >
                        <Edit2 size={14} className="text-secondary" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm p-1"
                        onClick={() => deleteActionItem(item.id)}
                        title="Delete Item"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Starred Exam Notes */}
        {examNotes.length > 0 && (
          <div className="card p-6 flex flex-col gap-3">
            <h3 className="font-bold text-base text-exam flex items-center gap-2">
              <Star size={18} /> Starred Exam Notes ({examNotes.length})
            </h3>
            <ul className="flex flex-col gap-2 pl-4">
              {examNotes.map(e => (
                <li key={e.id} className="text-sm font-semibold text-primary">
                  ⭐ {e.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
