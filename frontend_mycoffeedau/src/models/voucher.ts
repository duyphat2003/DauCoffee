export interface Voucher {
  id: string;
  content: string;         // Nội dung / mô tả voucher (VD: "Giảm 20% đơn hàng")
  pointRequirement: string; // Yêu cầu hạng thành viên (VD: "Tập Sự", "Vàng")
  point: number;           // Số điểm cần để đổi
}