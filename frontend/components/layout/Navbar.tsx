'use client';

import { Search, User, Menu } from 'lucide-react';
import { useSidebar } from '@/components/providers/SidebarProvider';
import { NotificationPopover } from './NotificationPopover';

export function Navbar() {
    const { toggle } = useSidebar();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggle}
                    className="mr-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
                >
                    <Menu size={24} />
                </button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="h-9 w-64 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationPopover />

                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 ring-2 ring-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
}
