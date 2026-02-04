'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/store/hooks';
import { fetchBoardData } from '@/store/slices/boardSlice';
import { createList } from '@/lib/api/board';
import { toast } from 'sonner';

interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    position: number;
}

export function CreateListModal({ isOpen, onClose, boardId, position }: CreateListModalProps) {
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            await createList(boardId, title, position);
            toast.success("List created successfully");
            setTitle('');
            onClose();
            // Refresh board data to show new list
            dispatch(fetchBoardData(boardId));
        } catch (error) {
            toast.error("Failed to create list");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Input
                            id="title"
                            placeholder="List title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating...' : 'Create List'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
