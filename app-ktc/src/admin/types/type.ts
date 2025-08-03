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