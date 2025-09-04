// Adress
//Province
export type Province = {
  id: number;
  name: string;
};
//District
export type District = {
  id: number;
  name: string;
  provinceId: number;
};
//Ward
export type Ward = {
  id: number;
  name: string;
  districtId: number;
};
//--------------------------------------//
//Wallet
export type Wallet = {
  id: string;
  balance: number;
};
//--------------------------------------//
//TypePost
export type TypePost = {
  id: string;
  name: string;
  code: string;
  pricePerDay: number;
  description: string;
};
//--------------------------------------//
//Convenient
export type Convenient = {
  id: string;
  name: string;
};
//--------------------------------------//
//RoomDetail
export type RoomDetail = {
  id: string;
  title: string;
  description: string;
  address: {
    id: string;
    street: string;
    ward: {
      id: number;
      name: string;
      district: {
        id: number;
        name: string;
        province: {
          id: number;
          name: string;
        };
      };
    };
  };
  priceMonth: number;
  priceDeposit: number;
  roomLength: number;
  roomWidth: number;
  elecPrice: number;
  waterPrice: number;
  maxPeople: number;
  area: number;
  postStartDate: string;
  postEndDate: string;
  images: Image[];
  typepost: string;
  convenients: Convenient[];
};
//--------------------------------------//
export type Image = {
  id: number;
  url: string;
};
//--------------------------------------//
// export type Room = {
//   name: string;
//   address: string;
//   // approval?: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
// };

//Manage-Maintain
//---------------------------------------//
export enum RequestStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}
export type Room = {
  id: string; // UUID của phòng
  title: string;
};

export type Maintenance = {
  id: string;
  problem: string;
  cost: number;
  status: RequestStatus;
  requestDate: string;
  room: Room;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalRecords: number;
};
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type CreateMaintenanceFormValues = {
  roomId: string;
  problem: string;
  cost: number;
};

export type UpdateMaintenanceFormValues = {
  problem: string;
  cost: number;
  status: RequestStatus;
};

//--------------------------------------//

//Rooms in user
export type RoomInUser = {
  id: string;
  title: string;
  description: string;
  priceMonth: number;
  area: number;
  postStartDate: string;
  address: {
    id: string;
    street: string;
    ward: {
      id: number;
      name: string;
      district: {
        id: number;
        name: string;
        province: {
          id: number;
          name: string;
        };
      };
    };
  };
  conveniences: Convenient[];
  images: Image[];
  landlord: Landlord;
  isVip?: boolean;
  mainImage?: string;
  favoriteCount?: number
  viewCount?: number;
};
export type LandlordProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
};

export type RequirementRequestRoomDto = {
  userId: string;
  roomId: string;
  description: string;
};

export type UpdateRequestRoomDto = {
  id: string;
  description: string;
};

export type Landlord = {
  id: string;
  landlordProfile: LandlordProfile;
};

export type LandlordDetailByRoom = {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  amountPost: number;
  phone: string;
  createDate: string;
};

export type Requirement = {
  id: string;
  userId: string;
  roomId: string;
  description: string;
  status: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
};

export type RequirementDetail = {
  id: string;
  roomTitle: string;
  userName: string;
  email: string;
  description: string;
  status: 0 | 1 | 2;
};

export type Reply = {
  sender: "admin" | "user";
  message: string;
  timestamp: string;
};

export type CommentData = {
  key: string;
  roomId: string;
  roomName: string;
  userName: string;
  content: string;
  date: string;
  status: 0 | 1; // 0 = New, 1 = Responded
  isHidden: 0 | 1; //  0 | 1 (0 = visible, 1 = hidden)
  replies?: Reply[];
};

export type CommentFormValues = {
  newReplyContent: string;
};

//--------------------------------------//

export type ContractData = {
  key: string;
  contractName: string;
  roomName: string;
  tenantName: string;
  phoneNumber: string;
  numberOfPeople: number;
  price: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: 0 | 1; // 0 = Rented, 1 = Checked Out
  contractImageUrl?: string;
};

export type ContractFormValues = {
  contractName: string;
  roomName: string;
  tenantName: string;
  phoneNumber: string;
  numberOfPeople: number;
  price: number;
  durationMonths: number;
  startDate: string;
  status?: 0 | 1; // Trạng thái hợp đồng (khi chỉnh sửa)
  contractImageFile?: File;
  contractImageUrl?: string;
};

export type InvoiceFormValues = {
  invoiceName: string;
  installationCost?: number;
};

//--------------------------------------//
// Landlord Payment Info
export type LandlordPaymentInfo = {
  landlordId: string;
  landlordName: string;
  accountHolderName: string;
  bankNumber: string;
  bankName: string;
  binCode: string;
  depositAmount: number;
  phoneNumber: string;
  email: string;
};
export type Roomname = {
  name: string;
  address: string;
};

// User Search Preferences
export type UserSearchPreferences = {
  searchAddress: string;
  // desiredMinPrice?: number;
  // desiredMaxPrice?: number;
};


// export interface LandLordInfos {
//   id: string;
//   username: string;
//   email: string;
//   phoneNumber: string;
//   avatar: string;
//   // Thêm các fields tùy chọn cho frontend
//   name?: string; // Sử dụng username làm name
// }

export type SearchParamsType = { [key: string]: string | string[] | undefined };
