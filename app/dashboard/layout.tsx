import { Bell } from "lucide-react";
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const notificationCount = 3; // This will be dynamic later

  return (
    <div className="min-h-screen bg-[#4a4a4a]">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <header className="bg-[#4a4a4a] px-5 py-5 flex justify-between items-center">
          <h1 className="text-white text-[20px] font-bold">
            ระบบ E-ID
          </h1>
          <div className="relative">
            <Bell className="w-6 h-6 text-white" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ff4444] text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}