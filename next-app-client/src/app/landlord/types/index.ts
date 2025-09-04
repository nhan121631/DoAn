export interface Image {
  id: number;
  url: string;
}

// export interface Convenient {
//   id: number;
// }

export type RoomData = {
  key: string;
  name: string;
  landlordName?: string;
  phoneNumber?: number;
  img?: Image[];
  description?: string;
  electricityRate?: number;
  waterRate?: number;
  address: string;
  area?: number;
  roomLength?: number;
  roomWidth?: number;
  elecPrice?: number;
  waterPrice?: number;
  maxPeople?: number;
  price: number;
  postStartDate: string;
  postEndDate: string;
  available: "Rented" | "Available";
  approval: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
  isRemove: 0 | 1; // 0 = hiện btn gỡ, 1 = đã gỡ (bị ẩn)
  hidden: 0 | 1; //0 = visible, 1 = hidden
};

export type LandLordInfo = {
  id: number;
  name: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  avatar?: string; // URL to the avatar image
  rooms?: RoomData[]; // Optional, if you want to include rooms managed by the landlord
};
export type RatingResponseDto = {
  id: string;
  userId: string;
  userName: string;
  landLordUserName: string; // Name of the landlord who replied
  avatar: string;
  landLordAvatar: string; // Avatar of the landlord who replied
  roomId: string;
  roomTitle: string;
  score: number;
  comment?: string;
  dateRated: string;
  reply?: string | null; // Reply from the landlord
};

export type RatingCreateDto = {
  userId: string;
  score: number;
  comment?: string;
};

export type RatingReplyDto = {
  reply: string;
};

export enum FeedbackAccess {
  CAN_RATE = "CAN_RATE",
  ALREADY_RATED = "ALREADY_RATED",
  NOT_USED = "NOT_USED",
}


export interface LandlordDetail {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  memberSince: string;
  totalListings: number;
}

//landlord 
export interface RoomListing {
  id: string;
  title: string;
  address: string;
  price: number;
  area: number;
  imageUrl?: string;
  favoriteCount?: number;
}