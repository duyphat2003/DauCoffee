export type PaymentType = "Visa" | "MasterCard" | "Momo" | "ZaloPay" | "Tiền mặt";

export interface PaymentMethod {
  id: string;
  id_user: string;     // Liên kết với User
  namePayment: PaymentType;
  numberPayment: string; // Số thẻ hoặc số điện thoại ví
  expiry?: string;       // Ngày hết hạn (chỉ dành cho thẻ quốc tế)
  isDefault: boolean;    // Đánh dấu phương thức ưu tiên
}