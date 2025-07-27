import UserLayoutClient from "./components/UserLayoutClient";

interface DetailLayoutProps {
  children: React.ReactNode;
}

export default function UserDashBoard({ children }: DetailLayoutProps) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
