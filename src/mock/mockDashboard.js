export const initialDashboardData = {
  classes: [
    {
      id: 'cs204a',
      code: 'CS204A',
      subject: 'Data Structures & Algorithms',
      teacher: 'Prof. R. Menon',
      room: 'Room 204',
      time: '09:00 – 10:00 AM',
      topic: 'Binary Search Trees',
      status: 'live' // live, upcoming, done
    },
    {
      id: 'ma201',
      code: 'MA201',
      subject: 'Discrete Mathematics',
      teacher: 'Dr. Sunita Sharma',
      room: 'Lecture Hall 3',
      time: '11:15 AM – 12:15 PM',
      topic: 'Graph Theory & Colorings',
      status: 'upcoming'
    },
    {
      id: 'ee102',
      code: 'EE102',
      subject: 'Digital Systems',
      teacher: 'Prof. A. Kulkarni',
      room: 'Lab 102',
      time: '02:00 – 04:00 PM',
      topic: 'Sequential Circuits & Flip-Flops',
      status: 'upcoming'
    }
  ],
  deadlines: [
    {
      id: 'dl_01',
      title: 'Lab Report 4 — Binary Trees Implementation',
      subject: 'Data Structures',
      dueDate: '2026-09-24',
      dueLabel: 'Thursday 5:00 PM',
      urgency: 'due-today', // due-today, soon, later
      sourceTimestamp: '00:10:08',
      sourceSession: 'cs204a'
    },
    {
      id: 'dl_02',
      title: 'Chapter 6 Textbook Problems 4 to 9',
      subject: 'Data Structures',
      dueDate: '2026-09-25',
      dueLabel: 'Friday',
      urgency: 'soon',
      sourceTimestamp: '00:08:15',
      sourceSession: 'cs204a'
    },
    {
      id: 'dl_03',
      title: 'Discrete Math Quiz 2 Preparation',
      subject: 'Discrete Mathematics',
      dueDate: '2026-09-28',
      dueLabel: 'Next Monday',
      urgency: 'later',
      sourceTimestamp: null
    }
  ],
  assignments: [
    {
      id: 'as_01',
      title: 'Solve problems 4–9 from Chapter 6',
      subject: 'Data Structures',
      capturedDate: 'Today (Live Class)',
      completed: false
    },
    {
      id: 'as_02',
      title: 'Read section 6.4 on AVL Rotations',
      subject: 'Data Structures',
      capturedDate: 'Yesterday',
      completed: true
    }
  ],
  announcements: [
    {
      id: 'an_01',
      title: 'Midterm Examination Schedule Released',
      content: 'Midterm exams begin next Monday. Check the portal for seating plan.',
      date: '2 hours ago',
      unread: true
    },
    {
      id: 'an_02',
      title: 'Room change for EE102 Digital Systems',
      content: 'Today’s afternoon lab will move to Lab 104.',
      date: 'Yesterday',
      unread: false
    }
  ]
};
