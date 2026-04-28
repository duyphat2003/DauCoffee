// src/data/orders.ts
import type { Order } from "../models/order";

export const orders: Order[] = [
  {
    id: "ORD-01",
    id_user: "U1",
    date: "2026-04-10",
    total: 120000,
    status: "Đã giao",
    items: [
      { id_drink: "coffee-1", name: "Espresso", quantity: 2, priceAtPurchase: 30000 },
    ],
  },
  {
    id: "ORD-02",
    id_user: "U2",
    date: "2026-04-11",
    total: 250000,
    status: "Chờ xác nhận",
    items: [
      { id_drink: "tea-2", name: "Trà chanh", quantity: 5, priceAtPurchase: 30000 },
    ],
  },
  {
    id: "ORD-03",
    id_user: "U1",
    date: "2026-04-12",
    total: 180000,
    status: "Đang chế tác",
    items: [
      { id_drink: "coffee-5", name: "Cold Brew", quantity: 3, priceAtPurchase: 60000 },
    ],
  },
];