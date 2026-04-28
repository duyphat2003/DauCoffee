export type Drink = {
  id: string;
  name: string;
  description: string; // Ý nghĩa của nước uống
  ingredients: string; // Thành phần
  price: number;
  promotionPercent: number; // Ví dụ: 10 cho 10%
  categoryId: string; // Liên kết với ID của danh mục
  image: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  isPromotion: boolean;
};