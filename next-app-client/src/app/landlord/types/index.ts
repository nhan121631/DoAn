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
  area: number;
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
  phone?: string;
  email?: string;
  address?: string;
  avatar?: string; // URL to the avatar image
  rooms?: RoomData[]; // Optional, if you want to include rooms managed by the landlord
};