export function matchQuestionAnswer(question, segment) {
  // Demo checkpoint planted answer matching
  if (segment.checkpoint === 'answer_1' || segment.text.toLowerCase().includes('good question') || segment.text.toLowerCase().includes('degrades to a linked list') || segment.text.toLowerCase().includes('degrades search time')) {
    return {
      match: true,
      confidence: 0.95,
      answerQuote: segment.text,
      timestamp: segment.timestampLabel
    };
  }

  // General keyword overlap match between question and incoming teacher segment
  const qWords = question.text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const sWords = segment.text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);

  const overlap = qWords.filter(w => sWords.includes(w));
  if (overlap.length >= 2 && segment.speaker === 'teacher') {
    return {
      match: true,
      confidence: 0.8,
      answerQuote: segment.text,
      timestamp: segment.timestampLabel
    };
  }

  return { match: false };
}
