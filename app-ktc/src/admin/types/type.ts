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

// Blog Enums as Union Types
export type BlogCategory = 'ANNOUNCEMENT' | 'GUIDE' | 'NEWS';
export type BlogStatus = 'DRAFT' | 'PUBLISHED';

// Blog Types
export interface BlogResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: BlogCategory;
  thumbnailUrl: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  status: BlogStatus;
}

export interface BlogCreateRequest {
  title: string;
  slug: string;
  content: string;
  category: BlogCategory;
}

export interface BlogUpdateRequest {
  title?: string;
  slug?: string;
  content?: string;
  category?: BlogCategory;
  status?: BlogStatus;
}

export interface BlogPageResponse {
  content: BlogResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Cloudinary Types
export interface CloudinaryUploadResponse {
  url: string;
  publicId?: string;
}

export interface TinyMCEUploadResponse {
  location: string;
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

// Statistics Types
export interface ProvinceStatistic {
  provinceName: string;
  roomCount: number;
  averagePrice: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface MonthlyTransactionStats {
  month: string;
  transactionType: number;
  description: string;
  totalAmount: number;
}

export interface MonthlyUserRegistration {
  month: string;
  userCount: number;
}

export interface TopLandlord {
  id: string;
  landlordName: string;
  email: string;
  roomCount: number;
  totalRevenue: number;
}

export interface RecentActivity {
  activityType: string;
  description: string;
  timestamp: string;
  userEmail: string;
}

export interface StatisticAdminResponseDto {
  // Overall statistics
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalRooms: number;
  totalActiveRooms: number;
  totalInactiveRooms: number;
  totalBookings: number;
  totalContracts: number;
  totalRevenue: number;

  // Monthly growth statistics
  newUsersThisMonth: number;
  newRoomsThisMonth: number;
  newBookingsThisMonth: number;
  revenueThisMonth: number;

  // Room statistics by status
  roomsByStatus: Record<string, number>;

  // Room statistics by post type
  roomsByPostType: Record<string, number>;

  // Room statistics by province
  roomsByProvince: ProvinceStatistic[];

  // Revenue statistics by month (last 12 months)
  monthlyRevenues: MonthlyRevenue[];

  // User registration statistics by month (last 12 months)
  monthlyUserRegistrations: MonthlyUserRegistration[];

  // Top landlords by room count
  topLandlords: TopLandlord[];

  // Recent activities
  recentActivities: RecentActivity[];
}
