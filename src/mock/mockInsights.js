export const mockCheckpointInsights = {
  exam_note_1: {
    topic: {
      title: "Binary Search Trees",
      subpoints: ["Tree invariant (left < root < right)", "In-order traversal properties"],
      changed: false
    },
    items: [
      {
        id: "insight_exam_1",
        type: "exam_note",
        title: "Tree rotations & balancing will be tested on the midterm exam",
        detail: "Stated specifically during lecture introduction",
        confidence: "high",
        sourceTimestamp: "00:00:18",
        sourceQuote: "tree rotations and balancing operations will definitely be on the midterm exam"
      }
    ],
    keyTerms: ["Binary Search Tree", "Tree Invariant"]
  },
  assignment_1: {
    topic: {
      title: "Binary Search Trees",
      subpoints: ["Tree invariant", "Unbalanced BST complexity O(n)"],
      changed: false
    },
    items: [
      {
        id: "insight_asgn_1",
        type: "assignment",
        title: "Solve problems 4 to 9 from Chapter 6",
        detail: "Handwritten solutions to be submitted in class",
        dueDate: "2026-09-25",
        dueLabel: "Friday",
        confidence: "high",
        sourceTimestamp: "00:00:44",
        sourceQuote: "solve problems four through nine from chapter six, and submit handwritten solutions by Friday"
      }
    ],
    keyTerms: ["Chapter 6", "Homework"]
  },
  deadline_1: {
    topic: {
      title: "Binary Search Trees",
      subpoints: ["Tree invariant", "Skewed tree O(n)"],
      changed: false
    },
    items: [
      {
        id: "insight_dead_1",
        type: "deadline",
        title: "Data Structures Lab Report 4 Submission",
        detail: "Strict deadline — no extensions granted",
        dueDate: "2026-09-24",
        dueLabel: "Thursday 5:00 PM",
        confidence: "high",
        sourceTimestamp: "00:00:55",
        sourceQuote: "lab report submission deadline is Thursday at 5 PM sharp"
      }
    ],
    keyTerms: ["Lab Report", "Deadline"]
  },
  topic_change_1: {
    topic: {
      title: "Tree Rotations & AVL Balancing",
      subpoints: ["Single Left Rotation", "Single Right Rotation", "Height preservation"],
      changed: true
    },
    items: [],
    keyTerms: ["AVL Tree", "Tree Rotation", "Balancing"]
  }
};
