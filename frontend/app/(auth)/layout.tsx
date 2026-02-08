export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Visual Side (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="relative z-20 flex items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <span className="text-xl">T</span>
          </div>
          Taskify
        </div>

        {/* Abstract Background Effect */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;This platform has effectively managed to streamline our
              workflow and reduce clutter. Highly recommended.&quot;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full items-center justify-center lg:w-1/2 bg-slate-50">
        {children}
      </div>
    </div>
  );
}
