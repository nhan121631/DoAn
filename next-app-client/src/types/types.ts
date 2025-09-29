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
  totalRecords: number;
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
  postType: string;
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
  idRequirement?: string;
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
  roomTitle: string;  
  userName: string;      
  email: string; 
  description: string;
  status: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
  imageUrl?: string;
  createdDate: string;
};

export type RequirementDetail = {
  id: string;
  roomTitle: string;
  userName: string;
  email: string;
  description: string;
  status: 0 | 1 | 2;
  imageUrl?: string;
  createdDate: string;
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

// export type ContractData = {
//   key: string;
//   contractName: string;
//   roomName: string;
//   tenantName: string;
//   phoneNumber: string;
//   numberOfPeople: number;
//   price: number;
//   durationMonths: number;
//   startDate: string;
//   endDate: string;
//   status: 0 | 1; // 0 = Rented, 1 = Checked Out
//   contractImageUrl?: string;
// };

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

export type PaymentInfoDto = {
  bankName: string;
  bankNumber: string;
  binCode: string;
  accountHolderName: string;
  phoneNumber: string;
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




export type SearchParamsType = { [key: string]: string | string[] | undefined };

// types/index.ts
export interface BillData {
  id: string;
  month: string;
  electricityFee: number;
  waterFee: number;
  serviceFee: number;
  damageFee?: number;
  note?: string; // Note for damage fee description
  totalAmount: number;
  paid?: boolean; // For backward compatibility
  status: 'PENDING' | 'CONFIRMING' | 'PAID' | 'OVERDUE';
  // Usage and price information
  electricityUsage?: number;
  waterUsage?: number;
  electricityPrice?: number;
  waterPrice?: number;
  imageProof?: string;
}

export interface ResidentData {
  id: string;
  contractId: string;
  fullName: string;
  idNumber: string;
  relationship: string;
  startDate: string;
  endDate: string;
  note: string;
  status: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
}

export interface ContractData {
  id: string;
  contractName: string;
  roomId: string;
  roomTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  monthlyRent: number;
  status: number; // 0: active, 1: terminated, 2: expired, 3: pending
  contractImage?: string;
  bills: BillData[];
  residents?: ResidentData[];
  landlordPaymentInfo?: PaymentInfoDto;
}

// statistic maintaince 
export type MaintainStatisticDto = {
  cost: number; // Chi phí bảo trì trong ngày
  date: string; // Ngày ở định dạng 'YYYY-MM-DD'
}

// statistic fee post room
export type TransactionStatisticsDto = {
  cost: number; // Chi phí trong ngày
  date: string; // Ngày ở định dạng 'YYYY-MM-DD'
}

export type RevenueStatisticsDto = {
  revenue: number; // Doanh thu trong ngày
  date: string; // Ngày ở định dạng 'YYYY-MM-DD'
}
export interface LandlordTaskCreateDto {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate?: string;
  dueDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  landlordId?: string;
  contractId?: string;
  roomId?: string;
  assignedToId?: string;
}

export interface LandlordTaskUpdateDto {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  dueDate?: string;
  assignedToId?: string;
}

export interface LandlordTaskResponseDto {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  landlordId: string;
  contractId?: string;
  roomId?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  contract?: {
    id: string;
    contractName: string;
  };
  room?: {
    id: string;
    title: string;
  };
}

// Blog types
export enum BlogCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  GUIDE = 'GUIDE',
  NEWS = 'NEWS'
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface BlogResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  category: BlogCategory;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface BlogPageResponse {
  content: BlogResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
 