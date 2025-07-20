import React from 'react'
import ManageContractsInteractive from "../components/manage-contracts/ManageContractsInteractive";


export default function page() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="mb-4">
        <h2 className="text-4xl font-semibold dark:!text-white">Contract Management</h2>
        <p className="text-gray-500 text-xl">Manage rental contracts with tenants.</p>
      </div>
      <ManageContractsInteractive />
    </div>
  )
}

