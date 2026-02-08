import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BoardData, Task } from '@/lib/types';
import { getBoardDetails } from '@/lib/api/board';
import { createTask as createTaskAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from '@/lib/api/task';
import { RootState } from '..';


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
    async ({ listId, position, title, description }: { listId: string; position: number; title: string, description?: string }) => {
        const newTask = await createTaskAPI(listId, position, title, description);
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
    async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
        // newStatus is the new column ID (which maps to list_id in backend)
        await updateTaskAPI(taskId, { list_id: Number(newStatus) });
        return { taskId, newStatus };
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
    async ({ taskId, position }: { taskId: string; position: number }) => {
        await updateTaskAPI(taskId, { position });
        return { taskId, position };
    }
);

export const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        moveTask: (state, action: PayloadAction<{ taskId: string; newStatus: string }>) => {
            const { taskId, newStatus } = action.payload;
            const task = state.data.tasks.find((t) => t.id === taskId);
            if (task) {
                task.columnId = newStatus;
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
                    columnId: apiTask.list_id.toString(), // Map list_id to columnId
                    title: apiTask.title,
                    description: apiTask.description,
                    tags: [], // Default
                    dueDate: apiTask.deadline ? new Date(apiTask.deadline).toISOString() : undefined,
                    position: apiTask.position || 0
                };

                state.data.tasks.push(newTask);
            })
            .addCase(moveTaskAsync.pending, (state, action) => {
                const { taskId, newStatus } = action.meta.arg;
                const task = state.data.tasks.find((t) => t.id === taskId);
                if (task) {
                    task.columnId = newStatus;
                }
            })
            .addCase(moveTaskAsync.rejected, (state, action) => {
                // Revert if failed. For now, we rely on a refetch or error toast.
                // Ideally we should track previous state to revert.
                console.error("Move task failed:", action.error);
            })
            .addCase(reorderTaskAsync.pending, (state, action) => {
                const { taskId, position } = action.meta.arg;
                const task = state.data.tasks.find((t) => t.id === taskId);
                if (task) {
                    task.position = position;
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
export const SelectAllTasksbyListId = (list_id: string) => (state: RootState) => {
    // TODO: delete later, temporary debugger
    console.log("TASKS BROO", state.board.data.tasks.filter((task) => task.columnId === list_id));
    return state.board.data.tasks.filter((task) => task.columnId === list_id);
}
