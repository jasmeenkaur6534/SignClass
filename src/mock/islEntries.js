export const islCategories = [
  { id: 'all', label: 'All Signs' },
  { id: 'instructions', label: 'Classroom Instructions' },
  { id: 'subjects', label: 'Academic Subjects' },
  { id: 'exams', label: 'Exams & Assessment' },
  { id: 'time', label: 'Time & Scheduling' },
  { id: 'social', label: 'Social & Needs' },
  { id: 'lecture', label: 'Lecture Vocabulary' }
];

export const islEntries = [
  {
    id: 'isl_submit',
    term: 'Submit',
    termHindi: 'जमा करना',
    category: 'exams',
    tags: ['assignment', 'homework', 'deadline', 'hand in'],
    description: 'Open flat hand held in front of chest moves forward and slightly down, as if handing a paper to the teacher.',
    gestureType: 'hand-forward-down'
  },
  {
    id: 'isl_deadline',
    term: 'Deadline',
    termHindi: 'अंतिम तिथि',
    category: 'time',
    tags: ['time', 'due', 'date', 'limit'],
    description: 'Index finger of dominant hand cuts sharply across the non-dominant palm, forming a firm stop line.',
    gestureType: 'palm-chop'
  },
  {
    id: 'isl_exam',
    term: 'Exam / Test',
    termHindi: 'परीक्षा',
    category: 'exams',
    tags: ['test', 'paper', 'marks', 'midterm'],
    description: 'Both hands with extended index fingers draw small question mark curves in front of eyes, then open into flat palms.',
    gestureType: 'question-flat'
  },
  {
    id: 'isl_homework',
    term: 'Homework / Assignment',
    termHindi: 'गृहकार्य',
    category: 'exams',
    tags: ['assignment', 'tasks', 'practice'],
    description: 'Touch fingertips to mouth (sign for HOME), then strike dominant fist twice onto non-dominant palm (sign for WORK).',
    gestureType: 'home-work'
  },
  {
    id: 'isl_repeat',
    term: 'Please Repeat',
    termHindi: 'पुनरावृत्ति करें',
    category: 'instructions',
    tags: ['again', 'repeat', 'slow down', 'ask'],
    description: 'Dominant right hand bent at right angle enters the non-dominant palm repeatedly in a curved arc.',
    gestureType: 'arc-palm'
  },
  {
    id: 'isl_understand',
    term: "I Understand / Got It",
    termHindi: 'समझ आ गया',
    category: 'social',
    tags: ['clear', 'got it', 'know'],
    description: 'Index finger touches forehead, then flicks upward into an open palm while nodding head.',
    gestureType: 'forehead-flick'
  },
  {
    id: 'isl_not_understand',
    term: "Don't Understand",
    termHindi: 'समझ नहीं आया',
    category: 'social',
    tags: ['confused', 'doubt', 'help'],
    description: 'Index finger touches forehead, then hand shakes side to side with a questioning facial expression.',
    gestureType: 'forehead-shake'
  },
  {
    id: 'isl_important',
    term: 'Important',
    termHindi: 'महत्वपूर्ण',
    category: 'instructions',
    tags: ['midterm', 'note', 'exam', 'vital'],
    description: 'Both index fingers and thumbs form "F" handshapes, touching at fingertips, then arc upward together in emphasis.',
    gestureType: 'f-arc'
  },
  {
    id: 'isl_binary_tree',
    term: 'Binary Tree',
    termHindi: 'बाइनरी ट्री',
    category: 'lecture',
    tags: ['computer', 'data structures', 'node', 'tree'],
    description: 'Right hand with 2 fingers extended splits downward from top, then splits again showing left and right subtrees.',
    gestureType: 'branch-split'
  },
  {
    id: 'isl_rotation',
    term: 'Tree Rotation / Balance',
    termHindi: 'संतुलन / घूर्णन',
    category: 'lecture',
    tags: ['avl', 'tree', 'algorithm', 'balance'],
    description: 'Both open hands face each other and rotate 180 degrees in a smooth clockwise circle.',
    gestureType: 'circle-rotate'
  },
  {
    id: 'isl_computer',
    term: 'Computer Science',
    termHindi: 'कंप्यूटर विज्ञान',
    category: 'subjects',
    tags: ['programming', 'software', 'tech'],
    description: 'Fingertips of both hands flutter rapidly as if typing on an imaginary keyboard in air.',
    gestureType: 'air-typing'
  },
  {
    id: 'isl_mathematics',
    term: 'Mathematics',
    termHindi: 'गणित',
    category: 'subjects',
    tags: ['math', 'numbers', 'calc'],
    description: 'Crossed index and middle fingers of both hands rub past each other horizontally twice.',
    gestureType: 'v-rub'
  },
  {
    id: 'isl_write_board',
    term: 'Write on Board',
    termHindi: 'बोर्ड पर लिखें',
    category: 'instructions',
    tags: ['board', 'notes', 'teacher'],
    description: 'Dominant hand pretends to hold chalk and sweeps left to right across an elevated flat surface.',
    gestureType: 'chalk-sweep'
  },
  {
    id: 'isl_quiet',
    term: 'Quiet Please',
    termHindi: 'शांत रहें',
    category: 'instructions',
    tags: ['silence', 'listen', 'focus'],
    description: 'Index finger placed vertically over lips, followed by open palms pressing downward gently.',
    gestureType: 'shh-press'
  },
  {
    id: 'isl_question',
    term: 'Ask Question',
    termHindi: 'प्रश्न पूछें',
    category: 'social',
    tags: ['doubt', 'ask', 'help'],
    description: 'Index finger trace a small question mark curve in air toward the teacher.',
    gestureType: 'air-q'
  },
  {
    id: 'isl_friday',
    term: 'Friday',
    termHindi: 'शुक्रवार',
    category: 'time',
    tags: ['day', 'due', 'deadline'],
    description: 'Form "F" handshape with thumb and index finger touching, make small circular movement in front of chest.',
    gestureType: 'f-circle'
  },
  {
    id: 'isl_thursday',
    term: 'Thursday',
    termHindi: 'गुरुवार',
    category: 'time',
    tags: ['day', 'lab', 'due'],
    description: 'Form "T" handshape, move downward vertically, then transition into "H" handshape.',
    gestureType: 'th-slide'
  },
  {
    id: 'isl_today',
    term: 'Today / Now',
    termHindi: 'आज / अभी',
    category: 'time',
    tags: ['present', 'now', 'time'],
    description: 'Both hands with bent fingers move downward simultaneously, palms facing upward.',
    gestureType: 'down-press'
  },
  {
    id: 'isl_help',
    term: 'Help Me',
    termHindi: 'सहायता',
    category: 'social',
    tags: ['support', 'assist', 'doubt'],
    description: 'Dominant fist rests on open non-dominant palm, both hands move upward together toward petitioner.',
    gestureType: 'fist-palm-up'
  },
  {
    id: 'isl_slow_down',
    term: 'Please Slow Down',
    termHindi: 'धीमे बोलें',
    category: 'instructions',
    tags: ['speed', 'pace', 'repeat'],
    description: 'Dominant palm slowly pats down the back of non-dominant hand moving from wrist to fingers.',
    gestureType: 'hand-pat-slow'
  }
];
