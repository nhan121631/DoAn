import { RatingResponseDto, RatingCreateDto, RatingReplyDto, FeedbackAccess } from "../app/landlord/types/index";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API request failed");
  }
  return res.json();
};

export const ratingService = {
  getFeedbacksByRoom: async (roomId: string): Promise<RatingResponseDto[]> => {
    const res = await fetch(`/api/feedbacks/${roomId}`);
    return handleResponse(res);
  },

  createFeedback: async (
    roomId: string,
    dto: RatingCreateDto
  ): Promise<RatingResponseDto> => {
    const res = await fetch(`/api/feedbacks/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return handleResponse(res);
  },

  replyFeedback: async (
    landlordId: string,
    feedbackId: string,
    dto: RatingReplyDto
  ): Promise<RatingResponseDto> => {
    const res = await fetch(`/api/feedbacks/reply/${feedbackId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landlordId, ...dto }),
    });
    return handleResponse(res);
  },

  checkFeedbackAccess: async (
    roomId: string,
    userId: string
  ): Promise<FeedbackAccess> => {
    const res = await fetch(`/api/feedbacks/access/${roomId}?userId=${userId}`);
    return handleResponse(res);
  },

  getFeedbacksByLandlord: async (
    landlordId: string
  ): Promise<RatingResponseDto[]> => {
    const res = await fetch(`/api/feedbacks/landlord/${landlordId}`);
    return handleResponse(res);
  },

  deleteFeedback: async (
    feedbackId: string,
    userId: string
  ): Promise<string> => {
    const res = await fetch(`/api/feedbacks/delete/${feedbackId}?userId=${userId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};
