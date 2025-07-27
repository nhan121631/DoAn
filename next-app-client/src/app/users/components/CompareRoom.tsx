"use client";

import { useCompareStore } from "@/app/stores/CompareStore";
import { Badge, Drawer, Button, List, Avatar, message } from "antd";
import { TableOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompareRoom() {
  const { items, clearItems, removeItem } = useCompareStore((state) => state);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      {/* Nút tròn nổi ở góc trái */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          zIndex: 1000,
        }}
      >
        <Badge count={items.length} size="small" offset={[-2, 2]}>
          <Button
            shape="circle"
            size="large"
            icon={<TableOutlined style={{ fontSize: 22 }} />}
            style={{
              background: "#fff",
              boxShadow: "0 2px 8px #0002",
              border: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setOpen(true)}
          />
        </Badge>
      </div>

      {/* Drawer hiển thị danh sách so sánh */}
      <Drawer
        title="Compare Rooms"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={340}
        footer={
          <Button
            type="primary"
            block
            onClick={() => {
              if (items.length < 2) {
                messageApi.warning("Please select 2 rooms to compare.", 1.5);
                return;
              }
              setOpen(false);
              router.push("/users/compare");
            }}
          >
            Compare
          </Button>
        }
      >
        <List
          dataSource={items.slice(0, 2)}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  size="small"
                  danger
                  onClick={() => removeItem(item.room.key)}
                  key="remove"
                >
                  Remove
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={item.room.img?.[0]?.url || "/placeholder.jpg"}
                    alt={item.room.name}
                  />
                }
                title={item.room.name}
                description={item.room.address}
              />
            </List.Item>
          )}
        />
        {items.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: 24 }}>
            No rooms selected for comparison.
          </div>
        )}
        {items.length > 0 && (
          <Button
            type="link"
            danger
            block
            style={{ marginTop: 8 }}
            onClick={clearItems}
          >
            Clear All
          </Button>
        )}
      </Drawer>
    </>
  );
}
