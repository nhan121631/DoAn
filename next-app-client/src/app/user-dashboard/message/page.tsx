import ManageChatPage from "@/app/components/chat/ManageChatPage";

export default function UserChatPage() {
  return (
    <div className="flex flex-col items-center justify-start h-[calc(100vh-120px)] bg-gray-100">
      <div className="w-250 h-[calc(100vh-120px)]">
        <ManageChatPage />
      </div>
    </div>
  );
}

