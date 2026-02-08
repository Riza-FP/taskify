export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
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
