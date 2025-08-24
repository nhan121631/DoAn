"use client";

import { URL_IMAGE } from "@/services/Constant";
import { useCompareStore } from "@/stores/CompareStore";
import { CloseOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, List, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBalanceScale, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import styles from "./CompareRoom.module.css";

export default function CompareRoom() {
  const { items, clearItems, removeItem } = useCompareStore((state) => state);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}

      {/* Enhanced Floating Button */}
      <div className={`fixed bottom-8 left-8 z-[1000] ${styles.animateFloat}`}>
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 blur-sm animate-pulse"></div>

          {/* Main Button */}
          <Badge
            count={items.length}
            size="small"
            offset={[-8, 8]}
            className={styles.animateBounceSubtle}
          >
            <Button
              shape="circle"
              size="large"
              icon={<FaBalanceScale className="text-xl" />}
              className="relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 w-14 h-14 flex items-center justify-center"
              onClick={() => setOpen(true)}
            />
          </Badge>

          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Compare Rooms ({items.length}/2)
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaBalanceScale className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Compare Rooms
            </span>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={380}
        className="compare-drawer"
        styles={{
          header: {
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderBottom: "2px solid #e2e8f0",
          },
          body: {
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            padding: "24px",
          },
          footer: {
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderTop: "2px solid #e2e8f0",
            padding: "16px 24px",
          },
        }}
        footer={
          <div className="space-y-3">
            <Button
              type="primary"
              size="large"
              block
              icon={<FaEye />}
              className="h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() => {
                if (items.length < 2) {
                  messageApi.warning("Please select 2 rooms to compare.", 1.5);
                  return;
                }
                setOpen(false);
                router.push("/compare");
              }}
            >
              Compare Now
            </Button>

            {items.length > 0 && (
              <Button
                danger
                size="large"
                block
                icon={<FaTrash />}
                className="h-10 rounded-xl font-medium border-2 hover:bg-red-50 transition-all duration-300"
                onClick={clearItems}
              >
                Clear All
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Selected: {items.length}/2
              </span>
              <span className="text-xs text-gray-400">
                {items.length === 0
                  ? "Start comparing"
                  : items.length === 1
                  ? "Add 1 more"
                  : "Ready to compare!"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(items.length / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Room List */}
          {items.length > 0 ? (
            <List
              className="space-y-3"
              dataSource={items.slice(0, 2)}
              renderItem={(item, index) => (
                <div
                  className={`${styles.animateSlideInLeft} bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 my-4`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <List.Item className="p-4 border-0">
                    <div className="flex items-center gap-4 w-full">
                      {/* Avatar with overlay */}
                      <div className="relative">
                        <Avatar
                          size={64}
                          src={
                            URL_IMAGE +
                            (item.room.images?.[0]?.url || "/placeholder.jpg")
                          }
                          alt={item.room.title}
                          className="shadow-md"
                        />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-base mb-1 truncate">
                          {item.room.title}
                        </h4>
                        <p
                          className={`text-sm text-gray-600 ${styles.lineClamp2}`}
                        >
                          {item.room.description}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="small"
                        danger
                        shape="circle"
                        icon={<CloseOutlined />}
                        className="hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-110"
                        onClick={() => removeItem(item.room.id)}
                      />
                    </div>
                  </List.Item>
                </div>
              )}
            />
          ) : (
            /* Empty State */
            <div className={`text-center py-12 ${styles.animateFadeIn}`}>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Rooms Selected
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Browse rooms and add them to comparison to see differences side
                by side
              </p>
            </div>
          )}

          {/* Add More Placeholder (when only 1 item) */}
          {items.length === 1 && (
            <div
              className={`bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 text-center ${styles.animatePulseSubtle}`}
            >
              <FaPlus className="text-2xl text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Add one more room to compare
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
