import type { Branch } from "../models/branch";

export const branches: Branch[] = [
  {
    id: 1,
    name: "CHI NHÁNH QUẬN 1 (TRỤ SỞ CHÍNH)",
    address: "123 Công Xã Paris, Phường Bến Nghé, Quận 1, TP.HCM",
    phone: "028 3822 1234",
    hours: "07:00 - 22:30",
    mapUrl: "https://www.google.com/maps/embed?...", 
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500"
  },
  {
    id: 2,
    name: "CHI NHÁNH QUẬN 3",
    address: "456 Tú Xương, Phường Võ Thị Sáu, Quận 3, TP.HCM",
    phone: "028 3930 5678",
    hours: "08:00 - 22:00",
    mapUrl: "https://www.google.com/maps/embed?...",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500"
  },
  {
    id: 3,
    name: "CHI NHÁNH THỦ ĐỨC",
    address: "789 Kha Vạn Cân, Linh Chiểu, TP. Thủ Đức",
    phone: "028 3720 9999",
    hours: "07:00 - 21:30",
    mapUrl: "https://www.google.com/maps/embed?...",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=500"
  }
];