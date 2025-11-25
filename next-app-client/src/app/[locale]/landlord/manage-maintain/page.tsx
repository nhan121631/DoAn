import ClientWrapper from "../components/manage-maintain/ClientWrapper";
import React from "react";

export default function ManageMaintainPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold dark:!text-white">
          Manage Maintain
        </h2>
        <p className="text-lg text-gray-500">Room Maintenance Management.</p>
      </div>
      <ClientWrapper />
    </div>
  );
}
