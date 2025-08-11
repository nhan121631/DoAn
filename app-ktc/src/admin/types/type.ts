// Type post
export interface IPostType {
  id: string;
  code: string;
  name: string;
  pricePerDay: number;
  description: string;
}

// Type address
export interface Address {
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
}

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatar: string | null;
  bankName: string | null;
  binCode: string | null;
  bankNumber: string | null;
  accoutHolderName: string | null;
  address: Address;
}

//-----------------------------------//
// User DTO
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: string;
  roles: string[];
}

export interface UserPageResponseDto {
  data: UserResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RoleUpdateRequestDto {
  roleNames: string[];
}

export interface UpdateUserStatusRequestDto {
  status: number;
}

//-----------------------------------//
// Room DTO
export interface RoomResponseDto {
  id: string;
  title: string;
  landlordFullName: string | null;
  landlordEmail: string | null;
  description: string;
  priceMonth: number;
  priceDeposit: number;
  available: number;
  approval: number;
  hidden: number;
  isRemoved: number;
  postStartDate: string;
  postEndDate: string;
  address: Address;
  typepost: string;
}

// Kiểu dữ liệu trả về khi phân trang phòng
export interface RoomPageResponseDto {
  rooms: RoomResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RoomDetail {
  id: string;
  title: string;
  description: string;
  priceMonth: number;
  priceDeposit: number;
  area: number;
  available: number;
  approval: number;
  hidden: number;
  isRemoved: number;
  postStartDate: string;
  postEndDate: string;
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
  images: { id: number; url: string }[];
  convenients: { id: number; name: string }[];
  typepost: string;
  userId: string;
}
