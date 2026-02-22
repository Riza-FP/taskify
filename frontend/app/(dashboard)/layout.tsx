import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { NotificationsListener } from '@/components/layout/NotificationsListener';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <SidebarProvider>
                <NotificationsListener />
                <div className="flex min-h-screen bg-slate-50/50">
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 opacity-80" />
                    </div>
                    <Sidebar />
                    <div className="flex flex-1 flex-col transition-all duration-300 md:pl-64 relative z-10">
                        <Navbar />
                        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                            <div className="h-full animate-in fade-in zoom-in duration-500">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </AuthGuard>
    );
}
