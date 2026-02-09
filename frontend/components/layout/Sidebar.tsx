'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
    { icon: LayoutDashboard, label: 'Board', href: '/dashboard' }
];

import { useSidebar } from '@/components/providers/SidebarProvider';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, close } = useSidebar();

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success("Logged out successfully");
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={close}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
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
                                    <div
                                        key={item.href}
                                        className={cn(
                                            'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                                : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => window.innerWidth < 768 && close()}
                                            className="flex flex-1 items-center"
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
                                    </div>
                                );
                            })}
                        </nav>


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
        </>
    );
}
