import AddFundsForm from "../components/payment/AddFundsForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl rounded-lg p-8 dark:!bg-[#171f2f]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800  dark:!text-white">
              Nạp tiền vào tài khoản
            </h1>
            <a
              href="/landlord/payment-history"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              📋 Lịch sử thanh toán
            </a>
          </div>
          <AddFundsForm />
        </div>
      </div>
    </main>
  );
}
