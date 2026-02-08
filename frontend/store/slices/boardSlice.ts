import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BoardData, Task } from '@/lib/types';
import { getBoardDetails } from '@/lib/api/board';
import { createTask as createTaskAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from '@/lib/api/task';
import { RootState } from '..';
import { compareLexorank } from '@/lib/lexorank';


interface BoardState {
    data: BoardData;
    loading: boolean;
    error: string | null;
}

const initialState: BoardState = {
    data: { columns: [], tasks: [] },
    loading: false,
    error: null,
};

export const fetchBoardData = createAsyncThunk(
    'board/fetchBoardData',
    async (boardId: string) => {
        const data = await getBoardDetails(boardId);
        return data;
    }
);

export const addTaskAsync = createAsyncThunk(
    'board/addTask',
    async ({ listId, rank, title, description }: { listId: number; rank: string; title: string, description?: string }) => {
        const newTask = await createTaskAPI(listId, rank, title, description);
        return newTask;
    }
);

export const updateTaskAsync = createAsyncThunk(
    'board/updateTask',
    async ({ id, changes }: { id: string; changes: Partial<Task> }) => {
        await updateTaskAPI(id, changes);
        return { id, changes };
    }
);

export const moveTaskAsync = createAsyncThunk(
  'board/moveTask',
  async ({ taskId, columnId, rank }: { taskId: string; columnId: number; rank: string }) => {
    await updateTaskAPI(taskId, { columnId, rank });
    return { taskId, columnId, rank };
  }
);


export const deleteTaskAsync = createAsyncThunk(
    'board/deleteTask',
    async (taskId: string) => {
        await deleteTaskAPI(taskId);
        return taskId;
    }
);

export const reorderTaskAsync = createAsyncThunk(
    'board/reorderTask',
    async ({ taskId, rank }: { taskId: string; rank: string }) => {
        await updateTaskAPI(taskId, { rank });
        return { taskId, rank };
    }
);

export const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        moveTask: (state, action: PayloadAction<{ taskId: string; newListId: number }>) => {
            const { taskId, newListId } = action.payload;
            const task = state.data.tasks.find((t) => t.id === taskId);
            if (task) {
                task.columnId = newListId;
            }
        },
        setBoardData: (state, action: PayloadAction<BoardData>) => {
            state.data = action.payload;
        },
        addTask: (state, action: PayloadAction<Task>) => {
            state.data.tasks.push(action.payload);
        },
        updateTask: (state, action: PayloadAction<{ id: string; changes: Partial<Task> }>) => {
            const { id, changes } = action.payload;
            const task = state.data.tasks.find(t => t.id === id);
            if (task) {
                Object.assign(task, changes);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBoardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBoardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch board data';
            })
            .addCase(addTaskAsync.fulfilled, (state, action) => {
                // The backend task needs to be mapped or ensured to match frontend Task type
                // Assuming api/task.ts returns the raw object, we might need mapping if keys differ.
                // But for now let's push it. We might need to map 'list_id' to 'status' if the API returns 'list_id'.
                // Let's assume the API returns the standardized shape or we map it here.

                // Constructing a frontend Task object from the payload (which is what the API returns)
                const apiTask = action.payload;
                const newTask: Task = {
                    id: apiTask.id.toString(),
                    columnId: apiTask.list_id, // Map list_id to columnId
                    title: apiTask.title,
                    description: apiTask.description,
                    tags: [], // Default
                    dueDate: apiTask.deadline ? new Date(apiTask.deadline).toISOString() : undefined,
                    rank: apiTask.rank
                };

                state.data.tasks.push(newTask);
            })
            .addCase(moveTaskAsync.pending, (state, action) => {
                const { taskId, columnId, rank } = action.meta.arg;
                const task = state.data.tasks.find(t => t.id === taskId);
                if (task) {
                    task.columnId = columnId;
                    task.rank = rank;
                }
            })
            .addCase(moveTaskAsync.rejected, (state, action) => {
                // Revert if failed. For now, we rely on a refetch or error toast.
                // Ideally we should track previous state to revert.
                console.error("Move task failed:", action.error);
            })
            .addCase(reorderTaskAsync.pending, (state, action) => {
                const { taskId, rank } = action.meta.arg;
                const task = state.data.tasks.find((t) => t.id === taskId);
                if (task) {
                    task.rank = rank;
                    // We might need to resort tasks here if the selector doesn't sort them, 
                    // but usually components handle sorting or selector does.
                }
            })
            .addCase(updateTaskAsync.pending, (state, action) => {
                const { id, changes } = action.meta.arg;
                const task = state.data.tasks.find(t => t.id === id);
                if (task) {
                    Object.assign(task, changes);
                }
            })
            .addCase(deleteTaskAsync.fulfilled, (state, action) => {
                const taskId = action.payload;
                state.data.tasks = state.data.tasks.filter((t) => t.id !== taskId);
            });
    },
});

export const { setBoardData, addTask, updateTask, moveTask } = boardSlice.actions;
export default boardSlice.reducer;
export const selectTasksByListId =
  (columnId: number) =>
  (state: RootState) =>
    state.board.data.tasks
      .filter(t => t.columnId === columnId)
      .slice() // IMPORTANT: avoid mutating original array
      .sort((a, b) => compareLexorank(a.rank, b.rank));

export const selectLastRankInList =
  (columnId: number) =>
  (state: RootState): string | null => {
    const tasks = selectTasksByListId(columnId)(state);
    return tasks.length ? tasks[tasks.length - 1].rank : null;
  };

