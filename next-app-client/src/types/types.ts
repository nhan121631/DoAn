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

export type Room = {
  name: string;
  address: string;
  // approval?: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
};

export type MaintainData = {
  key: string;
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  date: string;
  status: 0 | 1 | 2; // 0 = Pending, 1 = In Progress, 2 = Completed
};

export type FormValues = {
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  status?: 0 | 1 | 2; // 0 = Pending, 1 = In Progress, 2 = Completed
};

//--------------------------------------//

export type Reply = {
  sender: 'admin' | 'user';
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