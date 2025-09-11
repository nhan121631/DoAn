"use client";

import { ratingService } from "@/services/FeedbackService";
import { Button, Input, message, Modal, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { RatingReplyDto, RatingResponseDto } from "../../types/index";
import CommentFormModal from "./CommentFormModal";

const ManageCommentsInteractive: React.FC = () => {
  const { data: session } = useSession();
  const landlordId = session?.user?.id || "";
  const [data, setData] = useState<RatingResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedComment, setSelectedComment] =
    useState<RatingResponseDto | null>(null);

  useEffect(() => {
    if (!landlordId) return;
    setLoading(true);
    ratingService
      .getFeedbacksByLandlord(landlordId)
      .then((res) => setData(res))
      .catch(() => messageApi.error("Không tải được feedback"))
      .finally(() => setLoading(false));
  }, [landlordId]);

  const handleReplyComment = (record: RatingResponseDto) => {
    setSelectedComment(record);
    setIsFormModalOpen(true);
  };
  const handleSubmitReply = async (replyDto: RatingReplyDto) => {
    if (!selectedComment || !landlordId) return;
    try {
      const updated = await ratingService.replyFeedback(
        landlordId,
        selectedComment.id,
        replyDto
      );
      setData((prev) =>
        prev.map((item) => (item.id === selectedComment.id ? updated : item))
      );
      messageApi.success("Đã phản hồi thành công!");
      setIsFormModalOpen(false);
      setSelectedComment(null);
    } catch (error) {
      console.error("Error replying to comment:", error);
      messageApi.error("Trả lời không thành công");
    }
  };

  const handleViewDetails = (record: RatingResponseDto) => {
    setSelectedComment(record);
    setViewDetailsModalOpen(true);
  };

  const columns: ColumnsType<RatingResponseDto> = [
    {
      title: "Room",
      dataIndex: "roomTitle",
      key: "roomTitle",
      sorter: (a, b) => a.roomTitle.localeCompare(b.roomTitle),
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      align: "right" as const,
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (text: string, record) => (
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleViewDetails(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Date Rated",
      dataIndex: "dateRated",
      key: "dateRated",
      sorter: (a, b) =>
        new Date(a.dateRated).getTime() - new Date(b.dateRated).getTime(),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const hasReply = !!record.reply;
        return (
          <Tag color={hasReply ? "green" : "volcano"}>
            {hasReply ? "Responded" : "New"}
          </Tag>
        );
      },
      sorter: (a, b) => Number(!!a.reply) - Number(!!b.reply),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleReplyComment(record)}
          >
            Reply
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      {contextHolder}
      <div className="flex justify-between items-center mt-2 mb-2">
        <Input.Search placeholder="Search comments..." style={{ width: 250 }} />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 7 }}
        loading={loading}
        className="mt-8 mb-8"
      />

      {/* Modal nhập reply */}
      <CommentFormModal
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setSelectedComment(null);
        }}
        onSubmit={handleSubmitReply}
        originalComment={selectedComment}
      />

      {/* Modal chi tiết comment */}
      <Modal
        title="Comment Details"
        open={isViewDetailsModalOpen}
        onCancel={() => setViewDetailsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedComment && (
          <>
            <p>
              <b>Room:</b> {selectedComment.roomTitle}
            </p>
            <p>
              <b>User:</b> {selectedComment.userName}
            </p>
            <p>
              <b>Comment:</b> {selectedComment.comment}
            </p>
            {selectedComment.reply && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Reply:</h4>
                <p>{selectedComment.reply}</p>
              </div>
            )}
            <p>
              <b>Date:</b> {selectedComment.dateRated}
            </p>
            <p>
              <b>Status:</b>{" "}
              <Tag color={selectedComment.reply ? "green" : "volcano"}>
                {selectedComment.reply ? "Responded" : "New"}
              </Tag>
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageCommentsInteractive;
