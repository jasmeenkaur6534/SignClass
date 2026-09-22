import React, { useState } from 'react';
import { Play, Pause, Heart, FlipHorizontal, FastForward, Info } from 'lucide-react';

export function SignCard({ sign }) {
  const [speed, setSpeed] = useState(1);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="sign-card">
      <div className="sign-media-box">
        {/* Animated Gesture Representation (Canvas / CSS illustration) */}
        <div
          style={{
            transform: isMirrored ? 'scaleX(-1)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'transform 0.3s ease'
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-muted)',
              border: '2px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              animation: isPlaying ? `pulseDot ${2 / speed}s infinite ease-in-out` : 'none'
            }}
          >
            🤟
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            {sign.gestureType || 'ISL Gesture'} ({speed}x)
          </span>
        </div>

        {/* Media Controls Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: 4,
            borderRadius: 6,
            backdropFilter: 'blur(4px)'
          }}
        >
          <button
            className="btn btn-ghost btn-sm p-1"
            onClick={() => setSpeed(speed === 1 ? 0.5 : 1)}
            title="Toggle Playback Speed (0.5x / 1x)"
          >
            <span className="text-xs font-bold">{speed}x</span>
          </button>
          <button
            className="btn btn-ghost btn-sm p-1"
            onClick={() => setIsMirrored(!isMirrored)}
            title="Mirror View (handedness)"
          >
            <FlipHorizontal size={14} className={isMirrored ? 'text-accent' : 'text-secondary'} />
          </button>
          <button
            className="btn btn-ghost btn-sm p-1"
            onClick={() => setIsSaved(!isSaved)}
            title="Save to Favorites"
          >
            <Heart size={14} className={isSaved ? 'text-danger fill-current' : 'text-secondary'} />
          </button>
        </div>
      </div>

      <div className="sign-card-body">
        <div className="flex items-center justify-between">
          <span className="sign-term-english">{sign.term}</span>
          <span className="sign-term-hindi">{sign.termHindi}</span>
        </div>

        <p className="sign-description">
          <strong>Movement:</strong> "{sign.description}"
        </p>

        <div className="flex flex-wrap gap-1 mt-1">
          {sign.tags && sign.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-muted">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
