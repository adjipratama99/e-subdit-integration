import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Providers from "@/components/Providers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <Providers session={session}>{children}</Providers>;
}