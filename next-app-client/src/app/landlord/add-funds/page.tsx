import React from "react";

export default function AddFundsPage() {
  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-white text-gray-900 rounded-lg shadow-lg p-8 dark:!bg-[#001529] dark:!text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-4">Add Funds</h1>
      <p className="mb-8 text-lg text-gray-500 dark:!text-gray-300">
        Quickly recharge your account balance
      </p>
      <form className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="number"
          min={10000}
          step={10000}
          placeholder="Enter amount (VND)"
          className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:!bg-[#0a1929] dark:!border-[#334155] dark:!text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors duration-200 dark:!bg-blue-800 dark:hover:!bg-blue-900"
        >
          Recharge Now
        </button>
      </form>
    </div>
  );
}
