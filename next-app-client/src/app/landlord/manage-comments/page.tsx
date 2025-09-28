import React from "react";
import ManageCommentsInteractive from "../components/manage-comments/ManageCommentsInteractive";

export default function ManageCommentPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold dark:!text-white">
          Manage Comments
        </h2>
        <p className="text-gray-500 text-xl">Room Comments Management.</p>
      </div>
      <div className="flex-1">
        <ManageCommentsInteractive />
      </div>
    </div>
  );
}
