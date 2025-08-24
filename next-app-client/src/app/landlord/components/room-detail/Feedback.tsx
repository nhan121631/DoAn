"use client";

import { ratingService } from "@/services/FeedbackService";
import { Button, Input, Rate, Spin } from "antd";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  FeedbackAccess,
  RatingCreateDto,
  RatingResponseDto,
} from "../../types/index";
import Image from "next/image";

interface FeedbackProps {
  roomId: string;
}

const Feedback: React.FC<FeedbackProps> = ({ roomId }) => {
  const { data: session } = useSession();
  const landlordId = session?.user?.id || "";
  const [feedbacks, setFeedbacks] = useState<RatingResponseDto[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newScore, setNewScore] = useState(5);
  const [access, setAccess] = useState<FeedbackAccess | null>(null);
  const [loading, setLoading] = useState(false);
  // const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    ratingService
      .getFeedbacksByRoom(roomId)
      .then((data) => setFeedbacks(data))
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!landlordId || !roomId) return;
    ratingService
      .checkFeedbackAccess(roomId, landlordId)
      .then((data) => setAccess(data))
      .catch(() => setAccess(null));
  }, [landlordId, roomId]);

  const handleAddFeedback = async () => {
    if (newComment.trim() === "" || !landlordId || !roomId) return;
    // setSubmitting(true);
    const dto: RatingCreateDto = {
      userId: landlordId,
      score: newScore,
      comment: newComment,
    };
    try {
      const newFeedback = await ratingService.createFeedback(roomId, dto);
      // const updatedFeedbacks = await ratingService.getFeedbacksByRoom(roomId);
      setFeedbacks([newFeedback, ...feedbacks]);
      setNewComment("");
      setNewScore(5);
      setAccess(FeedbackAccess.ALREADY_RATED);
    } catch (error) {
      // setSubmitting(false);
      console.error("Error creating feedback:", error);
    }
  };

  return (
    <div className="">
      <div className="w-full flex justify-center">
        <Button
          onClick={() => setShowFeedback(!showFeedback)}
          className="px-4 py-3 bg-yellow-500 text-white hover:bg-yellow-600 w-full text-center mb-4"
        >
          {showFeedback ? "Close Feedback" : "View Feedback"}
        </Button>
      </div>
      {showFeedback && (
        <div className="feedback-layout p-4 bg-gray-50 border-l-4 border-yellow-400 rounded-xl mb-6 mt-4">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Feedback</h2>
          <p className="text-sm text-gray-600 mt-4 mb-4">
            Please leave your feedback to improve our service!
          </p>
          {/* Form khách hàng comment và chọn rating */}
          {access === FeedbackAccess.CAN_RATE && (
            <div className="flex flex-col gap-2 mt-4 items-center">
              <div className="flex items-center gap-2 mb-2 w-full">
                <span>Rate for service: </span>
                <Rate value={newScore} onChange={setNewScore} />
              </div>
              <div className="flex items-center gap-2 mb-2 w-full">
                <Input.TextArea
                  className="w-full p-2 border rounded"
                  rows={1}
                  placeholder="Nhập góp ý của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  onClick={() => {
                    handleAddFeedback();
                  }}
                >
                  Gửi
                </Button>
              </div>
            </div>
          )}
          {access === FeedbackAccess.ALREADY_RATED && (
            <div className="text-green-600 mb-4">
              Bạn đã gửi feedback cho phòng này.
            </div>
          )}
          {access === FeedbackAccess.NOT_USED && (
            <div className="text-red-600 mb-4">
              Bạn cần thuê phòng này trước khi gửi feedback.
            </div>
          )}

          {/* Danh sách feedback: chỉ hiển thị feedback đã được landlord reply */}
          <div className="mt-6">
            {loading ? (
              <Spin />
            ) : feedbacks.length === 0 ? (
              <p className="text-gray-500">
                Chưa có feedback nào cho phòng này.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {feedbacks.map((item) => (
                  <div key={item.id} className="bg-white rounded shadow p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.avatar}
                        alt={item.userName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <span className="font-semibold text-blue-700 mr-2">
                          {item.userName}
                        </span>
                        <Rate
                          value={item.score}
                          disabled
                          className="text-sm ml-2"
                        />
                      </div>
                    </div>
                    <div className="text-gray-800 mt-1">{item.comment}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(item.dateRated).toLocaleString()}
                    </div>

                    {/* Hiển thị reply nếu landlord đã trả lời */}
                    {item.reply && (
                      <div className="mt-3 ml-4">
                        <div className="bg-yellow-50 border-l-2 border-yellow-400 p-2 rounded">
                          <div className="flex justify-start items-center gap-2">
                            <Image
                              src={item.landLordAvatar}
                              alt={item.landLordUserName}
                              className="w-10 h-10 rounded-full object-cover border"
                              width={40}
                              height={40}
                            />
                            <span className="font-semibold text-yellow-700">
                              {item.landLordUserName}
                            </span>
                          </div>
                          <div>{item.reply}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(item.dateRated).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
