import { LocationProvider } from "@/context/LocationContext";

export default function TestMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocationProvider>{children}</LocationProvider>;
}
