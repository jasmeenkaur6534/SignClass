import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MockSpeechProvider } from '../services/speech/MockSpeechProvider.js';
import { WebSpeechProvider } from '../services/speech/WebSpeechProvider.js';
import { PythonSpeechProvider } from '../services/speech/PythonSpeechProvider.js';
import { ActionExtractor } from '../services/ai/extractInsights.js';
import { teacherSync } from '../services/sync/teacherSync.js';
import { matchQuestionAnswer } from '../services/ai/matchAnswer.js';
import { useSettings } from './SettingsContext.jsx';
import { useDashboard } from './DashboardContext.jsx';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const { demoMode } = useSettings();
  const { mergeSessionActionItems } = useDashboard();

  const [segments, setSegments] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [asrStatus, setAsrStatus] = useState('stopped'); // listening, reconnecting, paused, stopped, connecting
  const [asrError, setAsrError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const [pipelineStatus, setPipelineStatus] = useState({
    micConnected: false,
    backendConnected: false,
    isListening: false,
    isProcessing: false,
    transcriptCount: 0,
    audioLevel: 0
  });

  const [currentTopic, setCurrentTopic] = useState({
    title: 'Binary Search Trees',
    subpoints: ['Tree Invariant (left < root < right)', 'In-order traversal'],
    changed: false
  });
  const [earlierTopics, setEarlierTopics] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [keyTerms, setKeyTerms] = useState(['Binary Search Tree', 'Tree Invariant']);

  const [questions, setQuestions] = useState([]);
  const [latestHighlightId, setLatestHighlightId] = useState(null);

  const providerRef = useRef(null);
  const extractorRef = useRef(new ActionExtractor());

  // Handle Speech Provider initialization and events
  useEffect(() => {
    // Cleanup existing provider
    if (providerRef.current) {
      providerRef.current.stop();
    }

    setAsrError(null);
    const provider = demoMode ? new MockSpeechProvider() : new PythonSpeechProvider();
    providerRef.current = provider;

    provider.onInterim((text) => setInterimText(text));

    provider.onFinal((segment) => {
      setSegments(prev => [...prev, segment]);

      // Run AI Action Extractor
      const insight = extractorRef.current.processSegment(segment);
      if (insight) {
        if (insight.topic) {
          setCurrentTopic(insight.topic);
          if (insight.earlierTopics) setEarlierTopics(insight.earlierTopics);
        }
        if (insight.newItems && insight.newItems.length > 0) {
          setActionItems(extractorRef.current.getAllItems());
          // Flash highlight
          setLatestHighlightId(insight.newItems[0].id);
          setTimeout(() => setLatestHighlightId(null), 2500);
        }
        if (insight.keyTerms && insight.keyTerms.length > 0) {
          setKeyTerms(prev => [...new Set([...prev, ...insight.keyTerms])]);
        }
      }

      // Check if incoming segment answers any pending Ask Back questions
      setQuestions(prevQuestions => {
        return prevQuestions.map(q => {
          if (q.status !== 'answered') {
            const matchResult = matchQuestionAnswer(q, segment);
            if (matchResult.match) {
              return {
                ...q,
                status: 'answered',
                answerQuote: matchResult.answerQuote,
                answerTimestamp: matchResult.timestamp
              };
            }
          }
          return q;
        });
      });
    });

    provider.onError((err) => setAsrError(err));
    provider.onStatus((status) => {
      setAsrStatus(status);
      if (status === 'listening') {
        setAsrError(null);
      }
    });
    if (provider.onPipelineStatus) {
      provider.onPipelineStatus((st) => setPipelineStatus(st));
    }
    provider.onAudioLevel((level) => setAudioLevel(level));

    return () => {
      provider.stop();
    };
  }, [demoMode]);

  // Subscribe to TeacherSync cross-tab events
  useEffect(() => {
    const unsubscribe = teacherSync.subscribe((data) => {
      if (data.type === 'QUESTION_SEEN') {
        setQuestions(prev => prev.map(q => q.id === data.questionId ? { ...q, status: 'seen' } : q));
      } else if (data.type === 'QUESTION_ANSWERED') {
        setQuestions(prev => prev.map(q => q.id === data.questionId ? {
          ...q,
          status: 'answered',
          answerQuote: data.answerText || 'Teacher answered aloud in class',
          answerTimestamp: 'Just now'
        } : q));
      }
    });
    return unsubscribe;
  }, []);

  const startSession = () => {
    if (providerRef.current) {
      providerRef.current.start();
    }
  };

  const pauseSession = () => {
    if (providerRef.current && providerRef.current.pause) {
      providerRef.current.pause();
    }
  };

  const resumeSession = () => {
    if (providerRef.current && providerRef.current.resume) {
      providerRef.current.resume();
    }
  };

  const stopSession = () => {
    if (providerRef.current) {
      providerRef.current.stop();
    }
    // Save extracted action items to Dashboard store on exit
    mergeSessionActionItems(actionItems);
  };

  const skipToNextCheckpoint = () => {
    if (providerRef.current && providerRef.current.skipToNextCheckpoint) {
      providerRef.current.skipToNextCheckpoint();
    }
  };

  const sendAskBackQuestion = (text, anonymous = true) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      text,
      anonymous,
      status: 'sent', // sent, seen, answered
      askedAtMs: Date.now(),
      timestampLabel: segments.length > 0 ? segments[segments.length - 1].timestampLabel : '00:00'
    };
    setQuestions(prev => [newQuestion, ...prev]);
    teacherSync.sendQuestion(newQuestion);
  };

  const updateInsightConfidence = (id, feedback) => {
    setActionItems(prev => prev.map(item => item.id === id ? { ...item, confidenceFeedback: feedback } : item));
  };

  const retryConnection = () => {
    setAsrError(null);
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current.start();
    }
  };

  const editActionItem = (id, updatedFields) => {
    const updated = extractorRef.current.updateItem(id, updatedFields);
    if (updated) setActionItems(extractorRef.current.getAllItems());
  };

  const deleteActionItem = (id) => {
    extractorRef.current.deleteItem(id);
    setActionItems(extractorRef.current.getAllItems());
  };

  return (
    <SessionContext.Provider value={{
      segments,
      interimText,
      asrStatus,
      asrError,
      audioLevel,
      pipelineStatus,
      currentTopic,
      earlierTopics,
      actionItems,
      keyTerms,
      questions,
      latestHighlightId,
      startSession,
      pauseSession,
      resumeSession,
      stopSession,
      retryConnection,
      skipToNextCheckpoint,
      sendAskBackQuestion,
      updateInsightConfidence,
      editActionItem,
      deleteActionItem
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
