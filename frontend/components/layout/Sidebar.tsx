'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, PlusSquare, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
    { icon: LayoutDashboard, label: 'Board', href: '/dashboard' }
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Clear token
        localStorage.removeItem('token');
        // Optional: Clear Redux state if needed, but a full reload/redirect usually handles it.

        toast.success("Logged out successfully");
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="flex h-full flex-col justify-between px-3 py-4">
                <div>
                    <div className="mb-8 flex items-center px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/50">
                            <LayoutDashboard size={24} />
                        </div>
                        <span className="ml-3 text-xl font-bold tracking-tight text-slate-800">
                            Taskify
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                                        isActive
                                            ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                            : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        className={cn(
                                            'mr-3 transition-colors',
                                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8">
                        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Workspaces
                        </h3>
                        <div className="mt-2 space-y-1">
                            <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100/50 hover:text-gray-900">
                                <span className="mr-3 flex h-2 w-2 rounded-full bg-green-500"></span>
                                Marketing
                            </button>
                            <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100/50 hover:text-gray-900">
                                <span className="mr-3 flex h-2 w-2 rounded-full bg-blue-500"></span>
                                Engineering
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={20} className="mr-3 text-gray-400 transition-colors group-hover:text-red-500" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
