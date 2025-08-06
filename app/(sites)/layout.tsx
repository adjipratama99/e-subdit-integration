import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Providers from "@/components/Providers";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <Providers session={session}>
      <div className="flex h-screen w-full overflow-y-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1">
              <Topbar />
              <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                  {children}
              </main>
          </div>
      </div>
    </Providers>
  );
}
