import { currentUser } from '@clerk/nextjs/server';
import { NotificationBell } from '@/components/ui/notification-bell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-[#4a4a4a]">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <header className="bg-[#4a4a4a] px-5 py-5 flex justify-between items-center">
          <h1 className="text-white text-[20px] font-bold">
            ระบบ E-ID
          </h1>
          <div className="relative">
            {/* Notification Bell with white icon styling for dark header */}
            <div className="[&_svg]:text-white [&_button]:hover:bg-gray-600">
              <NotificationBell />
            </div>
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