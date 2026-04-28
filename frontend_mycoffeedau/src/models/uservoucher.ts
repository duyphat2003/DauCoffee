export interface UserVoucher {
  id: number;
  idUser: string;
  idVoucher: string;
  redeemedDate: string; // ISO string
  isUsed: boolean;
  // Các field join từ backend (GetMyVouchers trả về object join)
  content?: string;
  pointRequirement?: string;
}