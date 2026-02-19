import { BoardData, Task, Column, Label } from './types';

export const MOCK_COLUMNS: Column[] = [
  { id: '1', title: 'To Do', idx: 0 },
  { id: '2', title: 'In Progress', idx: 1 },
  { id: '3', title: 'Review', idx: 2 },
  { id: '4', title: 'Done', idx: 3 },
];

const LABELS: Record<string, Label> = {
  high: { id: 'l1', name: 'High', color: 'bg-red-500 text-white' },
  medium: { id: 'l2', name: 'Medium', color: 'bg-amber-500 text-white' },
  low: { id: 'l3', name: 'Low', color: 'bg-emerald-500 text-white' },
  strategy: { id: 'l4', name: 'Strategy', color: 'bg-blue-500 text-white' },
  design: { id: 'l5', name: 'Design', color: 'bg-purple-500 text-white' },
  bug: { id: 'l6', name: 'Bug', color: 'bg-rose-500 text-white' },
  docs: { id: 'l7', name: 'Docs', color: 'bg-slate-500 text-white' },
  urgent: { id: 'l8', name: 'Urgent', color: 'bg-red-600 text-white' },
};

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Research market trends',
    description: 'Analyze current market trends in the fintech sector',
    columnId: 1,
    labels: [LABELS.high, LABELS.strategy],
    dueDate: '2024-10-24',
    assignee: 'https://github.com/shadcn.png',
    rank: '0|hzzzzz:',
  },
  {
    id: '2',
    title: 'Design system updates',
    description: 'Update color palette and typography',
    columnId: 2,
    labels: [LABELS.medium, LABELS.design],
    dueDate: '2024-10-25',
    assignee: 'https://github.com/shadcn.png',
    rank: '0|i00000:',
  },
  {
    id: '3',
    title: 'Fix navigation bug',
    description: 'Menu not closing on mobile devices',
    columnId: 4,
    labels: [LABELS.urgent, LABELS.bug],
    dueDate: '2024-10-20',
    assignee: 'https://github.com/shadcn.png',
    rank: '0|j00000:',
  },
  {
    id: '4',
    title: 'Q3 Report',
    description: 'Draft the quarterly report for stakeholders',
    columnId: 1,
    labels: [LABELS.low, LABELS.docs],
    dueDate: '2024-11-01',
    assignee: 'https://github.com/shadcn.png',
    rank: '0|k00000:',
  }
];

export const INITIAL_BOARD: BoardData = {
  columns: MOCK_COLUMNS,
  tasks: MOCK_TASKS,
};
