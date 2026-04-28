export interface User {
  id: string;
  nameDisplay: string;
  email: string;
  password?: string; // Dùng dấu ? để không lộ pass khi hiển thị thông tin
  phone: string;
  address: string;
  points: number;
  rank: UserRank; // Thêm Rank cho đúng chất RPG
  avatar?: string;
}

export type UserRank = "Tập Sự" | "Đồng" | "Bạc" | "Vàng" | "Kim Cương";
