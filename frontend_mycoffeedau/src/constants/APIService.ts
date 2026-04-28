/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import type { Drink } from '../models/drink';
import type { Order } from '../models/order';
import type { Job } from '../models/job';
import type { Branch } from '../models/branch';
import type { Review } from '../models/review';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import type { User } from '../models/user';

const BASE_URL = "https://localhost:7264/api"; 

// Helper để lấy dữ liệu nhanh hơn
const handleResponse = (response: any) => response.data;

export const DrinkService = {
  getAll: () => axios.get(`${BASE_URL}/Drink`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/Drink/${id}`).then(handleResponse),
  create: (drink: Drink) => axios.post(`${BASE_URL}/Drink`, drink).then(handleResponse),
  update: (id: string, drink: Drink) => axios.put(`${BASE_URL}/Drink/${id}`, drink),
  delete: (id: string) => axios.delete(`${BASE_URL}/Drink/${id}`),
};

export const OrderService = {
  getAll: () => axios.get(`${BASE_URL}/Order`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/Order/${id}`).then(handleResponse),
  getByUser: (userId: string) => axios.get(`${BASE_URL}/Order/user/${userId}`).then(handleResponse), // 👈 add this
  create: (order: Order) => axios.post(`${BASE_URL}/Order`, order).then(handleResponse),
  update: (id: string, order: Order) => axios.put(`${BASE_URL}/Order/${id}`, order).then(handleResponse),
  delete: (id: string) => axios.delete(`${BASE_URL}/Order/${id}`),
};

export const UserService = {
  getAll: () => axios.get(`${BASE_URL}/User`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/User/${id}`).then(handleResponse),
  getByEmail: (email: string) => axios.get(`${BASE_URL}/User/email/${email}`).then(handleResponse),
  create: (user: User) => axios.post(`${BASE_URL}/User`, user).then(handleResponse),
  update: (id: string, user: User) => axios.put(`${BASE_URL}/User/${id}`, user),
  delete: (id: string) => axios.delete(`${BASE_URL}/User/${id}`),
  login: (data: any) => axios.post(`${BASE_URL}/User/login`, data).then(handleResponse),
  register: (data: any) => axios.post(`${BASE_URL}/User/register`, data).then(handleResponse),
  forgotPassword: (email: string) => axios.post(`${BASE_URL}/User/forgot-password`, { email }).then(handleResponse),
};

export const CategoryService = {
  getAll: () => axios.get(`${BASE_URL}/Category`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/Category/${id}`).then(handleResponse),
  create: (category: Category) => axios.post(`${BASE_URL}/Category`, category).then(handleResponse),
  update: (id: string, category: Category) => axios.put(`${BASE_URL}/Category/${id}`, category),
  delete: (id: string) => axios.delete(`${BASE_URL}/Category/${id}`),
};

export const ActivityService = {
  getAll: () => axios.get(`${BASE_URL}/Activity`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/Activity/${id}`).then(handleResponse),
  create: (activity: Activity) => axios.post(`${BASE_URL}/Activity`, activity).then(handleResponse),
  update: (id: string, activity: Activity) => axios.put(`${BASE_URL}/Activity/${id}`, activity),
  delete: (id: string) => axios.delete(`${BASE_URL}/Activity/${id}`),
};

export const ReviewService = {
  getAll: () => axios.get(`${BASE_URL}/Review`).then(handleResponse),
  getById: (id: number) => axios.get(`${BASE_URL}/Review/${id}`).then(handleResponse),
  getByDrink: (drinkId: string) => axios.get(`${BASE_URL}/Review/drink/${drinkId}`).then(handleResponse),
  create: (review: Review) => axios.post(`${BASE_URL}/Review`, review).then(handleResponse),
  delete: (id: number) => axios.delete(`${BASE_URL}/Review/${id}`),
};

export const BranchService = {
  getAll: () => axios.get(`${BASE_URL}/Branch`).then(handleResponse),
  getById: (id: number) => axios.get(`${BASE_URL}/Branch/${id}`).then(handleResponse),
  create: (branch: Branch) => axios.post(`${BASE_URL}/Branch`, branch).then(handleResponse),
  update: (id: number, branch: Branch) => axios.put(`${BASE_URL}/Branch/${id}`, branch),
  delete: (id: number) => axios.delete(`${BASE_URL}/Branch/${id}`),
};

export const JobService = {
  getAll: () => axios.get(`${BASE_URL}/Job`).then(handleResponse),
  getById: (id: string) => axios.get(`${BASE_URL}/Job/${id}`).then(handleResponse),
  create: (job: Job) => axios.post(`${BASE_URL}/Job`, job).then(handleResponse),
  update: (id: string, job: Job) => axios.put(`${BASE_URL}/Job/${id}`, job),
  delete: (id: string) => axios.delete(`${BASE_URL}/Job/${id}`),
};

export const FavoriteService = {
  getByUser: (userId: string) => axios.get(`${BASE_URL}/FavoriteDrink/${userId}`).then(handleResponse),
  add: (userId: string, drinkId: string) => 
    axios.post(`${BASE_URL}/FavoriteDrink`, { idUser: userId, idDrink: drinkId }),
  remove: (userId: string, drinkId: string) => 
    axios.delete(`${BASE_URL}/FavoriteDrink/${userId}/${drinkId}`),
};

// ── VOUCHER: CRUD cho Admin (qua VoucherController) ──────────────────────────
export const VoucherService = {
  getAll: () => axios.get(`${BASE_URL}/Voucher`).then(handleResponse),
  create: (voucher: any) => axios.post(`${BASE_URL}/Voucher`, voucher).then(handleResponse),
  update: (id: string, voucher: any) => axios.put(`${BASE_URL}/Voucher/${id}`, voucher).then(handleResponse),
  delete: (id: string) => axios.delete(`${BASE_URL}/Voucher/${id}`),
};

// ── USER VOUCHER: Đổi điểm & xem kho voucher (qua UserVoucherController) ────
export const UserVoucherService = {
  // Danh sách voucher trong shop để user xem và đổi
  getShopList: () => axios.get(`${BASE_URL}/UserVoucher/shop/list`).then(handleResponse),
  // Voucher mà user đã đổi
  getMyVouchers: (userId: string) => axios.get(`${BASE_URL}/UserVoucher/my-vouchers/${userId}`).then(handleResponse),
  // Thực hiện đổi điểm
  redeem: (userId: string, voucherId: string) =>
    axios.post(`${BASE_URL}/UserVoucher/redeem`, null, { params: { userId, voucherId } }).then(handleResponse),
};