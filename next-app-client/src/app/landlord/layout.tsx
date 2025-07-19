import LandlordLayoutClient from "./components/LandLordClient";
import "antd/dist/reset.css";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandlordLayoutClient>{children}</LandlordLayoutClient>;
}
