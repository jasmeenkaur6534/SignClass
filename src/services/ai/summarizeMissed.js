export function generateMissedMomentSummary(segments, currentTopic, actionItems, minutesMissed = 12) {
  // If missed less than 3 minutes, return last 3 segments verbatim
  if (minutesMissed < 3 && segments.length > 0) {
    const recent = segments.slice(-3);
    return {
      isShortRecap: true,
      minutesMissed,
      recentSegments: recent
    };
  }

  // Generate structured 4-bullet scannable summary under 200 words
  const topicTitle = currentTopic?.title || 'Binary Search Trees — in-order traversal';

  const assignments = actionItems.filter(item => item.type === 'assignment' || item.type === 'deadline');
  const examNotes = actionItems.filter(item => item.type === 'exam_note');

  return {
    isShortRecap: false,
    minutesMissed,
    whereNow: topicTitle,
    coveredBullets: [
      'Definition of a BST and the ordering property (left < root < right)',
      'How sequential insertion degrades performance to linear O(n)',
      'Tree rotations concept for maintaining log(n) height balance'
    ],
    todoItems: assignments.length > 0
      ? assignments.map(a => `${a.title} — ${a.dueLabel || 'Soon'}`)
      : ['Problems 4–9, Chapter 6 — due Friday', 'Lab report 4 submission — due Thursday 5 PM'],
    importantItems: examNotes.length > 0
      ? examNotes.map(e => e.title)
      : ['Tree rotations and AVL balancing will be on the midterm exam']
  };
}
