export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  dueDate?: string;
  assignee?: string; // URL to avatar or name
  rank: string; // use lexorank algo
  columnId: number; 
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
