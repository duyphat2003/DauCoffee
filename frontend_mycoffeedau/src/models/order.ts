import type { OrderDetail } from "./orderdetail";

export interface Order {
  id: string;
  id_user: string;
  date: string;
  total: number;
  status: string;
  // Chi tiết vật phẩm trong đơn hàng
  items: OrderDetail[];
}