import { BoardData, Task, Column } from './types';

export const MOCK_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', idx: 0 },
  { id: 'in-progress', title: 'In Progress', idx: 1 },
  { id: 'review', title: 'Review', idx: 2 },
  { id: 'done', title: 'Done', idx: 3 },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Research Competitors',
    description: 'Analyze features of Trello, Asana, and Jira to identify gaps.',
    status: 'todo',
    priority: 'high',
    tags: ['High', 'Strategy', 'Research'],
    dueDate: '2023-10-25',
  },
  {
    id: 'task-2',
    title: 'Design System Draft',
    description: 'Create initial color palette and typography choices in Figma.',
    status: 'in-progress',
    priority: 'medium',
    tags: ['Medium', 'Design', 'UI'],
    dueDate: '2023-10-28',
  },
  {
    id: 'task-3',
    title: 'Setup Next.js Project',
    status: 'done',
    priority: 'high',
    tags: ['High', 'Dev', 'Setup'],
    dueDate: '2023-10-20',
  },
  {
    id: 'task-4',
    title: 'Authentication Flow',
    description: 'Implement login and register pages with Supabase Auth.',
    status: 'todo',
    priority: 'high',
    tags: ['Urgent', 'Dev', 'Auth'],
    dueDate: '',
  },
];

export const INITIAL_BOARD: BoardData = {
  columns: MOCK_COLUMNS,
  tasks: MOCK_TASKS,
};
