export interface Activity {
  id: string;
  title: string;
  dateCreate: string;
  // Sử dụng Union Type để giới hạn 3 loại danh mục như bạn yêu cầu
  idCategory: "SỰ KIỆN" | "TIN TỨC" | "NHIỆM VỤ";
  description: string;
  image: string;
  badge: string;
}