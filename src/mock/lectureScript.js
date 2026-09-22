// Scripted demo lecture for Demo Mode (Data Structures - Binary Search Trees)
export const lectureScript = [
  {
    atMs: 0,
    speaker: 'teacher',
    text: "Alright everyone, settle down. Today we're starting Data Structures Chapter 6: Binary Search Trees."
  },
  {
    atMs: 5000,
    speaker: 'teacher',
    text: "A Binary Search Tree, or BST, is a node-based binary tree data structure."
  },
  {
    atMs: 11000,
    speaker: 'teacher',
    text: "In a BST, every node's left subtree holds values smaller than the root, and the right subtree holds values greater."
  },
  {
    atMs: 18000,
    speaker: 'teacher',
    text: "Now pay attention — tree rotations and balancing operations will definitely be on the midterm exam. Note that down.",
    checkpoint: 'exam_note_1'
  },
  {
    atMs: 27000,
    speaker: 'student',
    text: "Sir, why does the binary search tree become unbalanced if inputs arrive in sorted order?",
    checkpoint: 'question_1'
  },
  {
    atMs: 34000,
    speaker: 'teacher',
    text: "Good question! If you insert sorted values sequentially, every single node goes to the right side, degrading the search time to linear O(n).",
    checkpoint: 'answer_1'
  },
  {
    atMs: 44000,
    speaker: 'teacher',
    text: "For homework this week, solve problems 4 through 9 from Chapter 6 in the textbook and submit handwritten solutions by Friday.",
    checkpoint: 'assignment_1'
  },
  {
    atMs: 55000,
    speaker: 'teacher',
    text: "Also remember, the Data Structures lab report submission deadline is Thursday at 5 PM sharp. No extensions will be given.",
    checkpoint: 'deadline_1'
  },
  {
    atMs: 66000,
    speaker: 'teacher',
    text: "Let's move on to our next main topic: Tree Rotations and AVL Balancing algorithms.",
    checkpoint: 'topic_change_1'
  },
  {
    atMs: 76000,
    speaker: 'teacher',
    text: "Left-rotation preserves the BST invariant while reducing height on the right branch."
  },
  {
    atMs: 86000,
    speaker: 'teacher',
    text: "Remember to bring your lab notebooks for tomorrow's practical session in Room 204."
  }
];
