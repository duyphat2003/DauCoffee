export type Review = {
  id: number;
  idUser: string;   // Đổi từ id_user thành idUser
  idDrink: string;  // Đổi từ id_drink thành idDrink
  avatar: string;
  userName: string; // Đổi từ username thành userName
  rating: number;
  comment: string;
  dateReview: string;
};