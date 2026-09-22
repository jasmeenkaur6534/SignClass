import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader.jsx';
import { SignCard } from '../components/isl/SignCard.jsx';
import { FlashcardPractice } from '../components/isl/FlashcardPractice.jsx';
import { CameraPracticeShell } from '../components/isl/CameraPracticeShell.jsx';
import { islCategories, islEntries } from '../mock/islEntries.js';
import { Search, BookOpen, Target, Camera } from 'lucide-react';

export function ISLLearning() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('dictionary'); // dictionary, quiz, camera
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filteredSigns = useMemo(() => {
    return islEntries.filter(sign => {
      // Category filter
      if (selectedCategory !== 'all' && sign.category !== selectedCategory) {
        return false;
      }
      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEng = sign.term.toLowerCase().includes(q);
        const matchHindi = sign.termHindi.toLowerCase().includes(q);
        const matchTags = sign.tags && sign.tags.some(t => t.toLowerCase().includes(q));
        const matchDesc = sign.description.toLowerCase().includes(q);
        return matchEng || matchHindi || matchTags || matchDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="isl-container">
      <TopHeader />

      <main className="isl-main">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              Classroom ISL & Vocabulary Learning
            </h1>
            <p className="text-sm text-secondary">
              Indian Sign Language support layer for academic, exam, and classroom vocabulary.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className={`btn ${activeTab === 'dictionary' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dictionary')}
            >
              <BookOpen size={16} /> Dictionary ({islEntries.length})
            </button>
            <button
              className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('quiz')}
            >
              <Target size={16} /> Flashcard Practice
            </button>
            <button
              className={`btn ${activeTab === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('camera')}
            >
              <Camera size={16} /> Camera Practice
            </button>
          </div>
        </div>

        {/* Tab 1: Searchable ISL Dictionary */}
        {activeTab === 'dictionary' && (
          <div className="flex flex-col gap-6">
            {/* Search & Category Filter Section */}
            <div className="isl-search-section">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-muted" />
                <input
                  type="text"
                  className="input-text pl-11"
                  placeholder="Search signs in English, Hindi, tags, or gesture descriptions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-chips">
                {islCategories.map(cat => (
                  <button
                    key={cat.id}
                    className={`chip-filter ${selectedCategory === cat.id ? 'chip-filter-active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Signs Card Grid */}
            {filteredSigns.length === 0 ? (
              <div className="card p-12 text-center text-muted">
                No matching ISL signs found for "{searchQuery}".
              </div>
            ) : (
              <div className="isl-grid">
                {filteredSigns.map(sign => (
                  <SignCard key={sign.id} sign={sign} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Flashcard Quiz Practice */}
        {activeTab === 'quiz' && (
          <FlashcardPractice />
        )}

        {/* Tab 3: Camera Practice Shell */}
        {activeTab === 'camera' && (
          <CameraPracticeShell />
        )}
      </main>
    </div>
  );
}
