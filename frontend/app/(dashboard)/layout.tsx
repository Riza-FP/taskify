import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-transparent">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64 transition-all duration-300">
                <Navbar />
                <main className="flex-1 p-6 relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
                    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-500 relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
