import React from 'react';
import { Layers } from 'lucide-react';

export function TopicDivider({ title }) {
  return (
    <div className="topic-divider">
      <div className="topic-divider-line" />
      <span className="flex items-center gap-2">
        <Layers size={14} /> New topic: {title}
      </span>
      <div className="topic-divider-line" style={{ transform: 'scaleX(-1)' }} />
    </div>
  );
}
