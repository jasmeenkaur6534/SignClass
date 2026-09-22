import React, { useState } from 'react';
import { Award, RefreshCw, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { islEntries } from '../../mock/islEntries.js';

export function FlashcardPractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentSign = islEntries[currentIndex % islEntries.length];

  // Generate 4 multiple-choice options (1 correct + 3 random distractors)
  const distractors = islEntries
    .filter(s => s.id !== currentSign.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = [currentSign, ...distractors].sort(() => 0.5 - Math.random());

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option.id);
    setIsAnswered(true);

    if (option.id === currentSign.id) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="quiz-box">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          🎯 ISL Flashcard Practice Quiz
        </h3>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="flex items-center gap-1 text-warning">
            <Flame size={16} /> Streak: {streak}
          </span>
          <span className="flex items-center gap-1 text-success">
            <Award size={16} /> Score: {score} / {currentIndex + (isAnswered ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Question Sign Prompt */}
      <div className="sign-media-box rounded-lg flex flex-col gap-2 p-6" style={{ height: 220 }}>
        <div style={{ fontSize: 48, animation: 'pulseDot 1.5s infinite ease-in-out' }}>
          🤟
        </div>
        <p className="text-sm font-semibold text-secondary text-center px-4">
          "{currentSign.description}"
        </p>
        <span className="text-xs text-muted">What does this Indian Sign Language gesture mean?</span>
      </div>

      {/* 4 Answer Choice Buttons */}
      <div className="quiz-options-grid">
        {options.map((opt) => {
          let btnClass = 'btn-secondary';
          if (isAnswered) {
            if (opt.id === currentSign.id) btnClass = 'btn-primary'; // correct
            else if (opt.id === selectedOption) btnClass = 'btn-danger'; // wrong pick
          }

          return (
            <button
              key={opt.id}
              className={`btn ${btnClass} p-4 flex flex-col items-center gap-1`}
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
            >
              <span className="font-bold text-base">{opt.term}</span>
              <span className="text-xs text-muted">{opt.termHindi}</span>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary" onClick={handleNext}>
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
