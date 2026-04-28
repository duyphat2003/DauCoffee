// src/data/users.ts
import type { User } from "../models/user";

export const users: User[] = [
  {
    id: "U1",
    nameDisplay: "Phát",
    email: "phat@gmail.com",
    phone: "0123456789",
    address: "TP.HCM",
    points: 120,
    rank: "Bạc",
  },
  {
    id: "U2",
    nameDisplay: "Minh",
    email: "minh@gmail.com",
    phone: "0988888888",
    address: "Hà Nội",
    points: 300,
    rank: "Vàng",
  },
  {
    id: "U3",
    nameDisplay: "Lan",
    email: "lan@gmail.com",
    phone: "0999999999",
    address: "Đà Nẵng",
    points: 50,
    rank: "Đồng",
  },
];