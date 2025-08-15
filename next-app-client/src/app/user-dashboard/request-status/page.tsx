import { authOptions } from "@/lib/auth";
import { getRequestsByUser } from "@/services/Requirements";
import { PaginatedResponse, RequirementDetail } from "@/types/types";
import { getServerSession } from "next-auth";
import React from "react";
import RequestStatusInteractive from "../components/request-status/RequestStatusInteractive";

const RequestStatusPage: React.FC = async () => {
  const session = await getServerSession(authOptions);
  const requests = (await getRequestsByUser(
    session
  )) as PaginatedResponse<RequirementDetail>;

  return <RequestStatusInteractive initialRequests={requests} />;
};

export default RequestStatusPage;
