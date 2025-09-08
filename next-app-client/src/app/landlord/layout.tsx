import { authOptions } from "@/lib/auth";
import LandlordLayoutClient from "./components/LandLordClient";
import "antd/dist/reset.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.roles.includes("Landlords")) {
    // Redirect to login if not authenticated
    redirect("/accessdenied");
  }
  return (
      <LandlordLayoutClient>{children}</LandlordLayoutClient>
  );
}
