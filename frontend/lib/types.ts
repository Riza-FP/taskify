export interface Label {
  id: string;
  name: string;
  color: string; // hex or tailwind class
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  labels: Label[];
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
