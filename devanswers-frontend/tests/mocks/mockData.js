// Mock data for testing the DevAnswers graded project

export const mockUsers = {
  user1: {
    userId: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    token: 'mock-jwt-token-alice',
  },
  user2: {
    userId: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    token: 'mock-jwt-token-bob',
  },
};

export const mockTags = [
  { _id: 'tag-1', name: 'javascript', questionCount: 12 },
  { _id: 'tag-2', name: 'react', questionCount: 8 },
  { _id: 'tag-3', name: 'css', questionCount: 5 },
];

export const mockAnswers = [
  {
    _id: 'answer-1',
    answerText: 'Use the useState hook to manage local component state.',
    author: { _id: 'user-2', name: 'Bob Smith' },
    voteCount: 4,
    upvotes: [],
    downvotes: [],
    createdAt: '2026-01-15T12:00:00.000Z',
  },
  {
    _id: 'answer-2',
    answerText: 'You can also lift the state up to a common parent component.',
    author: { _id: 'user-1', name: 'Alice Johnson' },
    voteCount: 2,
    upvotes: [],
    downvotes: [],
    createdAt: '2026-01-15T13:00:00.000Z',
  },
];

export const mockQuestions = [
  {
    _id: 'question-1',
    title: 'How do I manage state in React?',
    description: 'I want to understand the best way to manage component state.',
    voteCount: 10,
    upvotes: [],
    downvotes: [],
    tags: [mockTags[0], mockTags[1]],
    author: { _id: 'user-1', name: 'Alice Johnson' },
    answers: mockAnswers,
    answerCount: 2,
    createdAt: '2026-01-14T10:00:00.000Z',
  },
  {
    _id: 'question-2',
    title: 'What is the virtual DOM?',
    description: 'Can someone explain what the virtual DOM is and why it matters?',
    voteCount: 7,
    upvotes: [],
    downvotes: [],
    tags: [mockTags[1]],
    author: { _id: 'user-2', name: 'Bob Smith' },
    answers: [],
    answerCount: 0,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    _id: 'question-3',
    title: 'How do I center a div in CSS?',
    description: 'I have tried everything but I cannot center this div.',
    voteCount: 15,
    upvotes: [],
    downvotes: [],
    tags: [mockTags[2]],
    author: { _id: 'user-1', name: 'Alice Johnson' },
    answers: [],
    answerCount: 0,
    createdAt: '2026-01-16T08:00:00.000Z',
  },
];

export const mockAuthResponse = {
  login: {
    token: mockUsers.user1.token,
    userId: mockUsers.user1.userId,
    name: mockUsers.user1.name,
  },
  register: {
    token: 'mock-jwt-token-newuser',
    userId: 'user-99',
    name: 'New User',
  },
};
