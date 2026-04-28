export interface OrderDetail {
  id: string;
  id_order: string;
  id_drink: string;
  name: string;
  quantity: number;
  priceAtPurchase: number; // Lưu giá tại thời điểm mua để đối chiếu
}