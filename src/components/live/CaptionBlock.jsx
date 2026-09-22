import React from 'react';

export function CaptionBlock({ segment, isHighlighted }) {
  const isStudent = segment.speaker === 'student';

  return (
    <div
      id={`caption-${segment.id}`}
      className={`caption-block ${isStudent ? 'caption-block-student' : ''}`}
      style={{
        animation: isHighlighted ? 'flashHighlight 2.5s ease-out' : undefined,
        borderLeftWidth: isHighlighted ? 6 : 4
      }}
    >
      <div className="caption-meta">
        <span className={isStudent ? 'caption-speaker-student' : 'caption-speaker-teacher'}>
          {isStudent ? '✋ Student Question' : '👨‍🏫 Teacher'}
        </span>
        <span className="text-muted">[{segment.timestampLabel}]</span>
      </div>

      <p className="caption-text">
        {segment.text}
      </p>
    </div>
  );
}
