/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  return Response.json(session ?? {});
}