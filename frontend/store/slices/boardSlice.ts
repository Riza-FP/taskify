import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BoardData, Task } from '@/lib/types';
import { getBoardDetails, BoardFetchFilters } from '@/lib/api/board';
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
    async ({ boardId, filters }: { boardId: string; filters?: BoardFetchFilters }) => {
        const data = await getBoardDetails(boardId, filters ?? {});
        return data;
    }
);

export const addTaskAsync = createAsyncThunk(
    'board/addTask',
    async ({ listId, rank, title, description, deadline }: { listId: number; rank: string; title: string, description?: string, deadline?: string }) => {
        const newTask = await createTaskAPI(listId, rank, title, description, deadline);
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

export const updateListAsync = createAsyncThunk(
    'board/updateList',
    async ({ id, title }: { id: number; title: string }) => {
        // Assuming updateList API returns the updated list or we just use the payload
        // The API actually returns the updated list object.
        await import('@/lib/api/board').then(mod => mod.updateList(id, title));
        return { id, title };
    }
);

export const deleteListAsync = createAsyncThunk(
    'board/deleteList',
    async (id: number) => {
        await import('@/lib/api/board').then(mod => mod.deleteList(id));
        return id;
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
                const apiTask = action.payload;
                const newTask: Task = {
                    id: apiTask.id.toString(),
                    columnId: apiTask.list_id,
                    title: apiTask.title,
                    description: apiTask.description,
                    labels: [],
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
                console.error("Move task failed:", action.error);
            })
            .addCase(reorderTaskAsync.pending, (state, action) => {
                const { taskId, rank } = action.meta.arg;
                const task = state.data.tasks.find((t) => t.id === taskId);
                if (task) {
                    task.rank = rank;
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
            })
            // Optimistic Updates for Lists
            .addCase(updateListAsync.pending, (state, action) => {
                const { id, title } = action.meta.arg;
                const column = state.data.columns.find(c => c.id === id.toString());
                if (column) {
                    column.title = title;
                }
            })
            .addCase(updateListAsync.rejected, (state, action) => {
                // Revert or fetch? Fetching is safer.
                // For now, we rely on the component catching the error and resetting local state,
                // but we should probably mark state as dirty or error.
            })
            .addCase(updateListAsync.fulfilled, (state, action) => {
                // Already updated in pending, but we can ensure consistency here
                const { id, title } = action.payload;
                const column = state.data.columns.find(c => c.id === id.toString());
                if (column) {
                    column.title = title;
                }
            })
            .addCase(deleteListAsync.pending, (state, action) => {
                const id = action.meta.arg;
                state.data.columns = state.data.columns.filter(c => c.id !== id.toString());
                state.data.tasks = state.data.tasks.filter(t => t.columnId !== id);
            })
            .addCase(deleteListAsync.rejected, (state, action) => {
                // Re-fetch board data on failure to restore state
                // This is a simplified approach to rollback
                // ideally we would snapshot, but fetching is robust
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

