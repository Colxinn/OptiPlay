import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    redirect("/");
  }
  return <>{children}</>;
}
