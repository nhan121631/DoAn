import { redirect } from "next/navigation";
export default function Home() {
  redirect("/landlord");
  return null;
}
