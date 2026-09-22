/**
 * TeacherSync handles real-time cross-tab synchronization between
 * the Student Live Class view and the Teacher Companion view (/teacher).
 */
const CHANNEL_NAME = 'signclass_teacher_sync_v1';

export class TeacherSyncService {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
    this.listeners = [];

    if (this.channel) {
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    }

    // Fallback to storage event for cross-tab sync if BroadcastChannel is unsupported
    window.addEventListener('storage', (event) => {
      if (event.key === CHANNEL_NAME && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          this.notifyListeners(payload);
        } catch (e) {
          console.warn('Storage sync parse error:', e);
        }
      }
    });
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  sendQuestion(question) {
    const payload = { type: 'NEW_QUESTION', question, timestamp: Date.now() };
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    localStorage.setItem(CHANNEL_NAME, JSON.stringify(payload));
  }

  markQuestionSeen(questionId) {
    const payload = { type: 'QUESTION_SEEN', questionId, timestamp: Date.now() };
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    localStorage.setItem(CHANNEL_NAME, JSON.stringify(payload));
  }

  markQuestionAnswered(questionId, answerText) {
    const payload = { type: 'QUESTION_ANSWERED', questionId, answerText, timestamp: Date.now() };
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    localStorage.setItem(CHANNEL_NAME, JSON.stringify(payload));
  }
}

export const teacherSync = new TeacherSyncService();
