export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // correlates to Column id
  priority: Priority;
  tags: string[];
  dueDate?: string;
  assignee?: string; // URL to avatar or name
  position: number;
}

export interface Column {
  id: string;
  title: string;
  idx: number; // order
}

export interface BoardData {
  columns: Column[];
  tasks: Task[];
}
