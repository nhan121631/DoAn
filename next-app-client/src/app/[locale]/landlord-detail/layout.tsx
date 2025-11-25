import HeaderUserDashboard from "@/app/user-dashboard/components/HeaderUserDashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderUserDashboard />
      {children}
    </>
  );
}