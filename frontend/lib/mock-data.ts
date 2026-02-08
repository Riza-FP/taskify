import { BoardData, Task, Column } from './types';

export const MOCK_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', idx: 0 },
  { id: 'in-progress', title: 'In Progress', idx: 1 },
  { id: 'review', title: 'Review', idx: 2 },
  { id: 'done', title: 'Done', idx: 3 },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Research market trends',
    description: 'Analyze current market trends in the fintech sector',
    columnId: 'todo',
    tags: ['High', 'Strategy'],
    dueDate: '2024-10-24',
    assignee: 'https://github.com/shadcn.png',
    position: 0
  },
  {
    id: '2',
    title: 'Design system updates',
    description: 'Update color palette and typography',
    columnId: 'in-progress',
    tags: ['Medium', 'Design'],
    dueDate: '2024-10-25',
    assignee: 'https://github.com/shadcn.png',
    position: 0
  },
  {
    id: '3',
    title: 'Fix navigation bug',
    description: 'Menu not closing on mobile devices',
    columnId: 'done',
    tags: ['Urgent', 'Bug'],
    dueDate: '2024-10-20',
    assignee: 'https://github.com/shadcn.png',
    position: 0
  },
  {
    id: '4',
    title: 'Q3 Report',
    description: 'Draft the quarterly report for stakeholders',
    columnId: 'todo',
    tags: ['Low', 'Docs'],
    dueDate: '2024-11-01',
    assignee: 'https://github.com/shadcn.png',
    position: 1
  }
];

export const INITIAL_BOARD: BoardData = {
  columns: MOCK_COLUMNS,
  tasks: MOCK_TASKS,
};
