/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import './AdminPage.css';
import type { Activity } from "../../models/activity";
import type { Branch } from "../../models/branch";
import type { Category } from "../../models/category";
import type { Drink } from "../../models/drink";
import type { Job } from "../../models/job";
import type { JobRequirements } from "../../models/jobrequirements";
import type { Order } from "../../models/order";
import type { OrderDetail } from "../../models/orderdetail";
import type { Review } from "../../models/review";
import type { User } from "../../models/user";
import { ActivityService, BranchService, CategoryService, DrinkService, JobService, OrderService, ReviewService, UserService, VoucherService } from "../../constants/APIService";
import type { Voucher } from "../../models/voucher";

// ============================================================
// HELPERS / CONSTANTS
// ============================================================
const fmt   = (n: number) => n.toLocaleString("vi-VN") + "đ";
const stars = (r: number) => "★".repeat(r) + "☆".repeat(5 - r);

// ── Normalizers: ASP.NET Core trả về camelCase (idUser, idDrink)
// nhưng TypeScript model dùng snake_case (id_user, id_drink).
// Các hàm này map field names về đúng như model TS kỳ vọng.
const normalizeOrder = (o: any): Order => ({
  id:      o.id      ?? o.Id      ?? "",
  id_user: o.idUser  ?? o.id_user ?? o.IdUser  ?? "",
  date:    (o.date   ?? o.Date    ?? "").split("T")[0],
  total:   o.total   ?? o.Total   ?? 0,
  status:  o.status  ?? o.Status  ?? "",
  items: (o.items ?? o.Items ?? []).map((i: any): import("../../models/orderdetail").OrderDetail => ({
    id:              String(i.id              ?? i.Id              ?? ""),
    id_order:        i.orderId      ?? i.id_order     ?? i.OrderId     ?? "",
    id_drink:        i.idDrink      ?? i.id_drink      ?? i.IdDrink      ?? "",
    name:            i.name         ?? i.Name          ?? "",
    quantity:        i.quantity     ?? i.Quantity      ?? 0,
    priceAtPurchase: i.priceAtPurchase ?? i.PriceAtPurchase ?? 0,
  })),
});

const normalizeUser = (u: any): User => ({
  id:          u.id          ?? u.Id          ?? "",
  nameDisplay: u.nameDisplay ?? u.NameDisplay ?? u.name ?? u.Name ?? "",
  email:       u.email       ?? u.Email       ?? "",
  phone:       u.phone       ?? u.Phone       ?? "",
  address:     u.address     ?? u.Address     ?? "",
  points:      u.points      ?? u.Points      ?? 0,
  rank:        u.rank        ?? u.Rank        ?? "Tập Sự",
  avatar:      u.avatar      ?? u.Avatar,
  password:    u.password    ?? u.Password,
});

const STATUS_COLOR: Record<string, string> = {
  "Đã giao": "#10b981", "Chờ xác nhận": "#f59e0b",
  "Đang chế tác": "#3b82f6", "Đã hủy": "#ef4444", "Đang giao": "#8b5cf6",
};
const RANK_COLOR: Record<string, string> = {
  "Tập Sự": "#94a3b8", "Vàng": "#f59e0b", "Bạc": "#94a3b8",
  "Đồng": "#cd7c2f", "Kim Cương": "#60a5fa",
};
const BADGE_COLOR: Record<string, string> = {
  "Hot": "#ef4444", "New": "#10b981", "Quest": "#8b5cf6", "Event": "#f59e0b",
  "Info": "#3b82f6", "Fix": "#6b7280", "Epic": "#ec4899", "Secret": "#1f2937",
};

type Section = "dashboard" | "drinks" | "categories" | "orders" | "users" | "reviews" | "activities" | "branches" | "jobs" | "vouchers";

const NAV_ITEMS: { key: Section; icon: string; label: string }[] = [
  { key: "dashboard",  icon: "◈",  label: "Tổng quan" },
  { key: "drinks",     icon: "☕", label: "Đồ uống" },
  { key: "categories", icon: "◉",  label: "Danh mục" },
  { key: "orders",     icon: "📋", label: "Đơn hàng" },
  { key: "users",      icon: "👤", label: "Khách hàng" },
  { key: "reviews",    icon: "⭐", label: "Đánh giá" },
  { key: "activities", icon: "🎪", label: "Hoạt động" },
  { key: "branches",   icon: "🏪", label: "Chi nhánh" },
  { key: "jobs",       icon: "💼", label: "Tuyển dụng" },
  { key: "vouchers",   icon: "🎟️", label: "Voucher" },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300";
const onImgErr = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = FALLBACK_IMG;
};



// ============================================================
// PAGINATION HOOK
// ============================================================
function usePagination<T>(items: T[], defaultPageSize = 6) {
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage   = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  const reset = () => setPage(1);
  const goTo   = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const prev   = () => goTo(safePage - 1);
  const next   = () => goTo(safePage + 1);
  const changeSize = (s: number) => { setPageSize(s); setPage(1); };

  return { paged, page: safePage, totalPages, pageSize, goTo, prev, next, changeSize, reset, total: items.length };
}

// ============================================================
// PAGINATION COMPONENT
// ============================================================
function Pagination({
  page, totalPages, pageSize, total, goTo, prev, next, changeSize,
}: {
  page: number; totalPages: number; pageSize: number; total: number;
  goTo: (p: number) => void; prev: () => void; next: () => void;
  changeSize: (s: number) => void;
}) {
  if (total === 0) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4)          pages.push("…");
    const start = Math.max(2,           page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
  }

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="pagination-wrap">
      <span className="pagination-info">
        Hiển thị <strong>{from}–{to}</strong> / <strong>{total}</strong> mục
        &nbsp;·&nbsp; Trang <strong>{page}</strong>/<strong>{totalPages}</strong>
      </span>
      <div className="pagination-pages">
        <button className="pg-btn pg-btn--nav" onClick={prev} disabled={page === 1} title="Trang trước">‹</button>
        {pages.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="pg-ellipsis">···</span>
            : (
              <button
                key={p}
                className={`pg-btn${page === p ? " pg-btn--active" : ""}`}
                onClick={() => goTo(p as number)}
              >
                {p}
              </button>
            )
        )}
        <button className="pg-btn pg-btn--nav" onClick={next} disabled={page === totalPages} title="Trang tiếp">›</button>
      </div>
      <div className="pagination-size">
        <span>Mỗi trang</span>
        <select value={pageSize} onChange={e => changeSize(+e.target.value)}>
          {[4, 6, 8, 12, 24].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>mục</span>
      </div>
    </div>
  );
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================
function Tag({ label, color }: { label: string; color?: string }) {
  const c = color || "#c9a84c";
  return (
    <span className="tag" style={{ color: c, borderColor: c + "55", background: c + "22" }}>
      {label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "danger" | "ghost" | "success"; small?: boolean;
}) {
  return (
    <button className={`btn btn--${variant}${small ? " btn--sm" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Confirm({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <Btn variant="ghost" onClick={onCancel}>Hủy</Btn>
          <Btn variant="danger" onClick={onConfirm}>Xóa</Btn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({ title, onAdd, searchValue, onSearch, placeholder }: {
  title: string; onAdd: () => void; searchValue: string;
  onSearch: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      <div className="section-header-right">
        <input
          className="search-bar"
          value={searchValue}
          onChange={e => onSearch(e.target.value)}
          placeholder={`🔍 ${placeholder}`}
        />
        <Btn onClick={onAdd}>+ Thêm mới</Btn>
      </div>
    </div>
  );
}

function FilterBar({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="filter-bar">
      {options.map(o => (
        <button
          key={o.key}
          className={`filter-pill${value === o.key ? " filter-pill--active" : ""}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ drinks, orders, users, reviews, activities, branches, jobs }: {
  drinks: Drink[]; orders: Order[]; users: User[]; reviews: Review[];
  activities: Activity[]; branches: Branch[]; jobs: Job[];
}) {
  const revenue   = orders.filter(o => o.status === "Đã giao").reduce((a, b) => a + b.total, 0);
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0";
  const pending   = orders.filter(o => o.status === "Chờ xác nhận");

  const stats = [
    { label: "Tổng đồ uống",  value: drinks.length,     icon: "☕", color: "#c9a84c" },
    { label: "Đơn hàng",      value: orders.length,     icon: "📋", color: "#3b82f6" },
    { label: "Khách hàng",    value: users.length,      icon: "👥", color: "#10b981" },
    { label: "Doanh thu",     value: fmt(revenue),      icon: "💰", color: "#f59e0b" },
    { label: "Đánh giá TB",   value: `${avgRating} ★`,  icon: "⭐", color: "#ec4899" },
    { label: "Chi nhánh",     value: branches.length,   icon: "🏪", color: "#8b5cf6" },
    { label: "Hoạt động",     value: activities.length, icon: "🎪", color: "#ef4444" },
    { label: "Tuyển dụng",    value: jobs.length,       icon: "💼", color: "#14b8a6" },
  ];

  return (
    <div>
      <h2 className="dashboard-title">📊 Tổng quan hệ thống</h2>
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ borderColor: s.color + "33" }}>
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__bg">{s.icon}</div>
          </div>
        ))}
      </div>
      {pending.length > 0 && (
        <div className="pending-panel">
          <h3 className="pending-title">⏳ Đơn hàng chờ xử lý ({pending.length})</h3>
          {pending.map(o => (
            <div key={o.id} className="pending-row">
              <span className="pending-row__id">{o.id}</span>
              <span className="pending-row__user">{o.id_user}</span>
              <span className="pending-row__total">{fmt(o.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DRINKS
// ============================================================
function DrinksSection({ drinks, setDrinks, categories }: { drinks: Drink[]; setDrinks: (d: Drink[]) => void; categories: Category[] }) {
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [modal,     setModal]     = useState<"add" | "edit" | null>(null);
  const [confirm,   setConfirm]   = useState<string | null>(null);
  const emptyDrink: Drink = { id: "", name: "", description: "", ingredients: "", price: 0, promotionPercent: 0, categoryId: "coffee", image: "", isBestSeller: false, isFeatured: false, isPromotion: false };
  const [form, setForm] = useState<Drink>(emptyDrink);
  const F = (k: keyof Drink, v: any) => setForm(f => ({ ...f, [k]: v }));

  const catOptions = [{ key: "all", label: "Tất cả" }, ...categories.map(c => ({ key: c.id, label: c.name }))];

  const filtered = useMemo(() => drinks.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "all" || d.categoryId === filterCat)
  ), [drinks, search, filterCat]);

  const pg = usePagination(filtered, 6);

  const save = async () => {
    if (!form.id || !form.name || !form.categoryId) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (modal === "add") {
      const isDuplicate = drinks.some(d => d.id.toLowerCase() === form.id.toLowerCase());
      if (isDuplicate) {
        alert(`ID "${form.id}" đã tồn tại. Vui lòng chọn ID khác!`);
        return;
      }
      try {
        await DrinkService.create(form);
        alert("Thêm món mới thành công!");
        setModal(null);
        const data = await DrinkService.getAll();
        setDrinks(data);
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 500) {
          alert("Lỗi: ID này đã tồn tại trong hệ thống!");
        } else {
          alert("Có lỗi xảy ra khi kết nối server.");
        }
      }
    } else {
      try {
        await DrinkService.update(form.id, form);
        setModal(null);
        setDrinks(drinks.map(d => d.id === form.id ? form : d));
      } catch {
        alert("Có lỗi xảy ra khi cập nhật.");
      }
    }
  };

  const del = async (id: string) => {
    try {
      await DrinkService.delete(id);
      setDrinks(drinks.filter(d => d.id !== id));
      setConfirm(null);
      alert("Đã xóa món này thành công!");
    } catch {
      alert("Không thể xóa món này. Có thể nó đang nằm trong một đơn hàng cũ!");
    }
  };

  const generateNextId = (categoryId: string, currentDrinks: Drink[]) => {
    const ids = currentDrinks
      .filter(d => d.categoryId === categoryId && d.id.startsWith(`${categoryId}-`))
      .map(d => parseInt(d.id.split('-')[1]))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    let nextNumber = 1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === nextNumber) nextNumber++;
      else if (ids[i] > nextNumber) break;
    }
    return `${categoryId}-${nextNumber}`;
  };

  return (
    <div>
      <SectionHeader title={`☕ Đồ uống (${filtered.length})`} onAdd={() => {
        const nextId = generateNextId(form.categoryId, drinks);
        setForm({ ...emptyDrink, categoryId: form.categoryId, id: nextId });
        setModal("add");
        pg.reset();
      }}
      searchValue={search} onSearch={v => { setSearch(v); pg.reset(); }} placeholder="Tìm tên, ID..." />
      <FilterBar options={catOptions} value={filterCat} onChange={v => { setFilterCat(v); pg.reset(); }} />

      <div className="card-grid card-grid--drink">
        {pg.paged.map(d => (
          <div key={d.id} className="card">
            <div className="card__img-wrap">
              <img className="card__img card__img--drink" src={d.image || FALLBACK_IMG} alt={d.name} onError={onImgErr} />
              <div className="card__badges">
                {d.isBestSeller && <Tag label="Best"     color="#f59e0b" />}
                {d.isFeatured   && <Tag label="Featured" color="#8b5cf6" />}
                {d.isPromotion  && <Tag label={`-${d.promotionPercent}%`} color="#ef4444" />}
              </div>
            </div>
            <div className="card__body">
              <div className="card__cat">{d.categoryId}</div>
              <div className="card__title">{d.name}</div>
              <div className="card__desc">{d.description}</div>
              <div className="card__sub">🌿 {d.ingredients}</div>
              <div className="card__foot">
                <span className="card__price">{fmt(d.price)}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small variant="ghost" onClick={() => { setForm(d); setModal("edit"); }}>✏️ Sửa</Btn>
                  <Btn small variant="danger" onClick={() => setConfirm(d.id)}>🗑</Btn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm đồ uống" : "Sửa đồ uống"} onClose={() => setModal(null)}>
          <div className="form-grid-2">
            <Field label="ID"><input className="input" value={form.id} onChange={e => F("id", e.target.value)} disabled={modal === "edit"} /></Field>
            <Field label="Tên"><input className="input" value={form.name} onChange={e => F("name", e.target.value)} /></Field>
            <Field label="Danh mục">
              <select className="input" value={form.categoryId} onChange={e => {
                const newCatId = e.target.value;
                F("categoryId", newCatId);
                if (modal === "add") {
                  const nextId = generateNextId(newCatId, drinks);
                  F("id", nextId);
                }
              }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Giá (VNĐ)"><input className="input" type="number" value={form.price} onChange={e => F("price", +e.target.value)} /></Field>
            <Field label="Giảm giá (%)"><input className="input" type="number" value={form.promotionPercent} onChange={e => F("promotionPercent", +e.target.value)} /></Field>
            <Field label="URL hình ảnh"><input className="input" value={form.image} onChange={e => F("image", e.target.value)} /></Field>
          </div>
          <Field label="Mô tả"><textarea className="input input--textarea" value={form.description} onChange={e => F("description", e.target.value)} /></Field>
          <Field label="Nguyên liệu"><input className="input" value={form.ingredients} onChange={e => F("ingredients", e.target.value)} /></Field>
          <div className="form-row">
            {(["isBestSeller", "isFeatured", "isPromotion"] as const).map(k => (
              <label key={k} className="form-checkbox">
                <input type="checkbox" checked={form[k] as boolean} onChange={e => F(k, e.target.checked)} />
                {k === "isBestSeller" ? "Best Seller" : k === "isFeatured" ? "Nổi bật" : "Khuyến mãi"}
              </label>
            ))}
          </div>
          {form.image && <img className="img-preview" src={form.image} alt="preview" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Xóa đồ uống "${drinks.find(d => d.id === confirm)?.name}"?`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ============================================================
// CATEGORIES
// ============================================================
function CategoriesSection({ categories, setCategories }: { categories: Category[]; setCategories: (c: Category[]) => void }) {
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [form,    setForm]    = useState<Category>({ id: "", name: "", image: "" });
  const [confirm, setConfirm] = useState<string | null>(null);
  const F = (k: keyof Category, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  ), [categories, search]);

  const pg = usePagination(filtered, 6);

  const save = async () => {
    if (!form.id || !form.name) return;
    try {
      if (modal === "add") {
        await CategoryService.create(form);
        const data = await CategoryService.getAll();
        setCategories(data);
      } else {
        // CategoryService.update nếu có, hoặc chỉ update local
        await CategoryService.update(form.id, form);
        setCategories(categories.map(c => c.id === form.id ? form : c));
      }
      setModal(null);
    } catch {
      alert("Có lỗi xảy ra khi lưu danh mục.");
    }
  };

  const del = async (id: string) => {
    try {
      await CategoryService.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa danh mục này.");
    }
  };

  return (
    <div>
      <SectionHeader title={`◉ Danh mục (${categories.length})`} onAdd={() => { setForm({ id: "", name: "", image: "" }); setModal("add"); }} searchValue={search} onSearch={v => { setSearch(v); pg.reset(); }} placeholder="Tìm danh mục..." />
      <div className="card-grid card-grid--category">
        {pg.paged.map(c => (
          <div key={c.id} className="card">
            <img className="card__img card__img--category" src={c.image} alt={c.name} onError={onImgErr} />
            <div className="card__body">
              <div className="card__sub" style={{ fontFamily: "monospace" }}>{c.id}</div>
              <div className="card__title">{c.name}</div>
              <div className="card__actions">
                <Btn small variant="ghost" onClick={() => { setForm(c); setModal("edit"); }}>✏️ Sửa</Btn>
                <Btn small variant="danger" onClick={() => setConfirm(c.id)}>🗑</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm danh mục" : "Sửa danh mục"} onClose={() => setModal(null)}>
          <Field label="ID"><input className="input" value={form.id} onChange={e => F("id", e.target.value)} disabled={modal === "edit"} /></Field>
          <Field label="Tên danh mục"><input className="input" value={form.name} onChange={e => F("name", e.target.value)} /></Field>
          <Field label="URL hình ảnh"><input className="input" value={form.image} onChange={e => F("image", e.target.value)} /></Field>
          {form.image && <img className="img-preview img-preview--sm" src={form.image} alt="" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Xóa danh mục "${categories.find(c => c.id === confirm)?.name}"?`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ============================================================
// ORDERS
// ============================================================
function OrdersSection({ orders, setOrders, users, drinks }: { orders: Order[]; setOrders: (o: Order[]) => void; users: User[]; drinks: Drink[] }) {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal,        setModal]        = useState<"add" | "edit" | "detail" | null>(null);
  const [selected,     setSelected]     = useState<Order | null>(null);
  // FIX: OrderDetail now has id and id_order fields
  const emptyOrder: Order = { id: "", id_user: "", date: new Date().toISOString().split("T")[0], total: 0, status: "Chờ xác nhận", items: [] };
  const [form,    setForm]    = useState<Order>(emptyOrder);
  const [confirm, setConfirm] = useState<string | null>(null);

  const statusList    = ["Chờ xác nhận", "Đang chế tác", "Đã giao", "Đã hủy"];
  const statusOptions = [{ key: "all", label: "Tất cả" }, ...statusList.map(s => ({ key: s, label: s }))];

  const filtered = useMemo(() => orders.filter(o =>
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.id_user.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "all" || o.status === filterStatus)
  ), [orders, search, filterStatus]);

  const pg = usePagination(filtered, 6);

const save = async () => {
  const total = form.items.reduce((a, i) => a + i.quantity * i.priceAtPurchase, 0);
  
  // FIX: KHONG gui "id" cua item -> tranh loi IDENTITY_INSERT
  // OrderDetail.Id la IDENTITY column, phai de SQL Server tu sinh
  const orderDataForBackend = {
    id:     form.id,
    idUser: form.id_user,
    date:   form.date,
    total:  total,
    status: form.status,
    items:  form.items.map(i => ({
      orderId:         i.id_order,
      idDrink:         i.id_drink,
      name:            i.name,
      quantity:        i.quantity,
      priceAtPurchase: i.priceAtPurchase,
    }))
  };

  try {
    if (modal === "add") {
      await OrderService.create(orderDataForBackend as any);
    } else {
      await OrderService.update(form.id, orderDataForBackend as any);
    }
    // Sau khi lưu thành công, nhớ tải lại danh sách
    const updatedOrders = await OrderService.getAll();
    setOrders(updatedOrders.map(normalizeOrder));
    setModal(null);
  } catch (err) {
     alert("Lỗi khi lưu: " + (err as any).response?.data || "Vui lòng kiểm tra lại dữ liệu");
  }
};

const del = async (id: string) => {
  try {
    await OrderService.delete(id);
    setOrders(orders.filter(o => o.id !== id));
    setConfirm(null);
  } catch (err) {
    console.log(err);
    alert("Lỗi khi xóa đơn hàng khỏi cơ sở dữ liệu.");
  }
};

  // FIX: initialize all OrderDetail fields correctly
  const addItem = () => setForm(f => ({
    ...f,
    items: [...f.items, { id: "", id_order: f.id, id_drink: "", name: "", quantity: 1, priceAtPurchase: 0 }]
  }));

  const updItem    = (i: number, k: keyof OrderDetail, v: any) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));


  const generateNextId = (list: any[], prefix: string) => {
  if (!list || list.length === 0) return `${prefix}-1`;
    
    // Trích xuất phần số từ chuỗi ID (ví dụ: "ORD005" -> 5)
    const nums = list.map(item => {
      const match = item.id?.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    });

    const maxNum = Math.max(...nums);
    return `${prefix}-${(maxNum + 1)}`;
  };

  return (
    <div>
      <SectionHeader title={`📋 Đơn hàng (${filtered.length})`} onAdd={() => {
        setForm(emptyOrder);
         emptyOrder.id = generateNextId(pg.paged, "ORD");
        setModal("add");
       
      }} searchValue={search} onSearch={v => { setSearch(v); pg.reset(); }} placeholder="Tìm mã đơn, user..." />
      <FilterBar options={statusOptions} value={filterStatus} onChange={v => { setFilterStatus(v); pg.reset(); }} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>{["Mã đơn", "Khách hàng", "Ngày đặt", "Số món", "Tổng tiền", "Trạng thái", ""].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {pg.paged.map(o => (
              <tr key={o.id}>
                <td className="td-id">{o.id}</td>
                <td className="td-main">{users.find(u => u.id === o.id_user)?.nameDisplay || o.id_user}</td>
                <td className="td-muted">{o.date}</td>
                <td className="td-main">{o.items.length} món</td>
                <td className="td-money">{fmt(o.total)}</td>
                <td><Tag label={o.status} color={STATUS_COLOR[o.status]} /></td>
                <td>
                  <div className="td-actions">
                    <Btn small variant="ghost" onClick={() => { setSelected(o); setModal("detail"); }}>👁</Btn>
                    <Btn small variant="ghost" onClick={() => { setForm(normalizeOrder(o)); setModal("edit"); }}>✏️</Btn>
                    <Btn small variant="danger" onClick={() => setConfirm(o.id)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination {...pg} />

      {modal === "detail" && selected && (
        <Modal title={`Chi tiết đơn hàng ${selected.id}`} onClose={() => setModal(null)}>
          <div className="detail-grid">
            <div><span className="detail-label">Khách hàng: </span>{users.find(u => u.id === selected.id_user)?.nameDisplay || selected.id_user}</div>
            <div><span className="detail-label">Ngày: </span>{selected.date}</div>
            <div><span className="detail-label">Trạng thái: </span><Tag label={selected.status} color={STATUS_COLOR[selected.status]} /></div>
            <div><span className="detail-label">Tổng: </span><strong style={{ color: "#f5d87a" }}>{fmt(selected.total)}</strong></div>
          </div>
          <div className="detail-table-wrap">
            <table className="detail-table">
              <thead><tr>{["ID sản phẩm", "Tên", "SL", "Đơn giá", "Thành tiền"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i}>
                    <td className="detail-td-id">{item.id_drink}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td className="td-muted">{fmt(item.priceAtPurchase)}</td>
                    <td className="detail-td-money">{fmt(item.quantity * item.priceAtPurchase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {(modal === "add" || modal === "edit") && (
        
        <Modal title={modal === "add" ? "Thêm đơn hàng" : "Sửa đơn hàng"} onClose={() => setModal(null)}>
          <div className="form-grid-2">
            <Field label="Mã đơn"><input className="input" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} disabled={modal === "edit"} /></Field>
              <Field label="Khách hàng">
                <select 
                  className="input" 
                  value={form.id_user} 
                  onChange={e => setForm({ ...form, id_user: e.target.value })}
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nameDisplay} ({u.id})</option>
                  ))}
                </select>
              </Field>
            <Field label="Ngày đặt"><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Trạng thái">
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {statusList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="order-items-header">
            <label className="field-label" style={{ margin: 0 }}>Danh sách món</label>
            <Btn small onClick={addItem}>+ Thêm món</Btn>
          </div>
          {form.items.map((item, i) => (
            <div key={i} className="order-item-row">
              {/* Dropdown tên — tự động điền ID và giá */}
              <select
                className="input"
                value={item.id_drink}
                onChange={e => {
                  const d = drinks.find(d => d.id === e.target.value);
                  setForm(f => ({
                    ...f,
                    items: f.items.map((it, idx) => idx === i ? {
                      ...it,
                      id_drink: d?.id ?? "",
                      name: d?.name ?? "",
                      priceAtPurchase: d?.price ?? 0,
                    } : it)
                  }));
                }}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {drinks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {/* ID tự điền readonly */}
              <input className="input" value={item.id_drink} readOnly placeholder="ID" style={{ background: "var(--color-background-secondary)", cursor: "not-allowed", maxWidth: 110 }} />
              <input className="input" type="number" placeholder="SL" value={item.quantity} onChange={e => updItem(i, "quantity", +e.target.value)} style={{ maxWidth: 70 }} />
              <input className="input" type="number" placeholder="Giá" value={item.priceAtPurchase} onChange={e => updItem(i, "priceAtPurchase", +e.target.value)} style={{ maxWidth: 110 }} />
              <button className="item-remove-btn" onClick={() => removeItem(i)}>✕</button>
            </div>
          ))}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Xóa đơn hàng "${confirm}"?`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ============================================================
// USERS
// ============================================================
function UsersSection({ users, setUsers }: { users: User[]; setUsers: (u: User[]) => void }) {
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [form,    setForm]    = useState<User>({ id: "", nameDisplay: "", email: "", phone: "", address: "", points: 0, rank: "Tập Sự" });
  const [confirm, setConfirm] = useState<string | null>(null);
  const F = (k: keyof User, v: any) => setForm(f => ({ ...f, [k]: v }));
  // FIX: added "Tập Sự" which was missing
  const ranks: User["rank"][] = ["Tập Sự", "Đồng", "Bạc", "Vàng", "Kim Cương"];

  const filtered = useMemo(() => users.filter(u =>
    [u.nameDisplay, u.email, u.id].some(s => s.toLowerCase().includes(search.toLowerCase()))
  ), [users, search]);

  const pg = usePagination(filtered, 6);

  const save = async () => {
    try {
      if (modal === "add") {
        await UserService.create(form);
        const data = await UserService.getAll();
        setUsers((data as any[]).map(normalizeUser));
      } else {
        await UserService.update(form.id, form);
        setUsers(users.map(u => u.id === form.id ? form : u));
      }
      setModal(null);
    } catch {
      alert("Có lỗi xảy ra khi lưu.");
    }
  };

  const del = async (id: string) => {
    try {
      await UserService.delete(id);
      setUsers(users.filter(u => u.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa người dùng này.");
    }
  };

  const generateNextId = (list: any[], prefix: string) => {
if (!list || list.length === 0) return `${prefix}1`;
  
  // Trích xuất phần số từ chuỗi ID (ví dụ: "ORD005" -> 5)
  const nums = list.map(item => {
    const match = item.id?.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  });

  const maxNum = Math.max(...nums);
  return `${prefix}${(maxNum + 1)}`;
};

  return (
    <div>
      <SectionHeader title={`👤 Khách hàng (${users.length})`} onAdd={() => {
        const nextId = generateNextId(users, "U"); 
        
        setForm({ 
          id: nextId, // Gán ID tự động ở đây
          nameDisplay: "", 
          email: "", 
          password: "Phat1234#",
          phone: "", 
          address: "",
          avatar: "https://i.pravatar.cc/100?img=1",
          points: 0, 
          rank: "Tập Sự" 
        });
        setModal("add");
      }} searchValue={search} onSearch={v => { setSearch(v); pg.reset(); }} placeholder="Tìm tên, email..." />
      <div className="card-grid card-grid--user">
        {pg.paged.map(u => (
          <div key={u.id} className="user-card">
            <div className="user-card__head">
              <div className="user-avatar" style={{ background: (RANK_COLOR[u.rank] || "#c9a84c") + "33", color: RANK_COLOR[u.rank] || "#c9a84c", borderColor: RANK_COLOR[u.rank] || "#c9a84c" }}>
                {u.nameDisplay[0]}
              </div>
              <div>
                <div className="user-card__name">{u.nameDisplay}</div>
                <Tag label={u.rank} color={RANK_COLOR[u.rank]} />
              </div>
            </div>
            <div className="user-card__info">
              <div>📧 {u.email}</div>
              <div>📞 {u.phone}</div>
              <div>📍 {u.address}</div>
              <div>✨ <span className="user-card__points">{u.points}</span> điểm</div>
            </div>
            <div className="user-card__actions">
              <Btn small variant="ghost" onClick={() => { setForm(u); setModal("edit"); }}>✏️ Sửa</Btn>
              <Btn small variant="danger" onClick={() => setConfirm(u.id)}>🗑</Btn>
            </div>
          </div>
        ))}
      </div>
      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm khách hàng" : "Sửa khách hàng"} onClose={() => setModal(null)}>
          <div className="form-grid-2">
            <Field label="ID"><input className="input" value={form.id} onChange={e => F("id", e.target.value)} disabled /></Field>
            <Field label="Tên hiển thị"><input className="input" value={form.nameDisplay} onChange={e => F("nameDisplay", e.target.value)} /></Field>
            <Field label="Email"><input className="input" type="email" value={form.email} onChange={e => F("email", e.target.value)} /></Field>
            <Field label="Số điện thoại"><input className="input" value={form.phone} onChange={e => F("phone", e.target.value)} /></Field>
            <Field label="Địa chỉ"><input className="input" value={form.address} onChange={e => F("address", e.target.value)} /></Field>
            <Field label="Điểm tích lũy"><input className="input" type="number" value={form.points} onChange={e => F("points", +e.target.value)} /></Field>
            <Field label="Hạng thành viên">
              <select className="input" value={form.rank} onChange={e => F("rank", e.target.value as User["rank"])}>
                {ranks.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Xóa khách hàng "${users.find(u => u.id === confirm)?.nameDisplay}"?`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ============================================================
// REVIEWS
// ============================================================
function ReviewsSection({ users, reviews, setReviews, drinks }: { users: User[]; reviews: Review[]; setReviews: (r: Review[]) => void; drinks: Drink[] }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | null>(null);

  // FIX: Khớp với Model C#: UserName, IdUser, IdDrink, DateReview
  const emptyReview: any = { 
    id: 0, 
    idUser: "", 
    idDrink: "", 
    avatar: "", 
    userName: "", 
    rating: 5, 
    comment: "", 
    dateReview: new Date().toISOString() 
  };

  const [form, setForm] = useState<any>(emptyReview);
  const [confirm, setConfirm] = useState<number | null>(null);
  
  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  // FIX: Tìm kiếm theo UserName và IdDrink
  const filtered = useMemo(() => reviews.filter(r =>
    (r as any).userName?.toLowerCase().includes(search.toLowerCase()) ||
    (r as any).idDrink?.toLowerCase().includes(search.toLowerCase())
  ), [reviews, search]);

  const pg = usePagination(filtered, 6);

  const save = async () => {
    try {
      // Trước khi gửi, đảm bảo IdDrink đã được chọn
      if(!form.idDrink) return alert("Vui lòng chọn đồ uống!");
      
      const created = await ReviewService.create(form);
      setReviews([...reviews, created]);
      setModal(null);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu đánh giá.");
    }
  };

  const del = async (id: number) => {
    try {
      await ReviewService.delete(id);
      setReviews(reviews.filter(r => r.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa đánh giá này.");
    }
  };

  const handleUserChange = (userId: string) => {
  const selectedUser = users.find(u => u.id === userId);
  if (selectedUser) {
    setForm((f: any) => ({
      ...f,
      idUser: selectedUser.id,
      userName: selectedUser.nameDisplay,
      avatar: selectedUser.avatar || "" // Lấy avatar từ user nếu có
    }));
  } else {
    // Nếu chọn "-- Chọn khách hàng --"
    setForm((f: any) => ({ ...f, idUser: "", userName: "", avatar: "" }));
  }
  };
  
  const getDrinkName = (id: string) => {
  const drink = drinks.find(d => d.id === id);
  return drink ? drink.name : id; // Nếu không tìm thấy thì hiện ID
};

  return (
    <div>
      <SectionHeader 
        title={`⭐ Đánh giá (${reviews.length})`} 
        onAdd={() => { setForm(emptyReview); setModal("add"); }} 
        searchValue={search} 
        onSearch={v => { setSearch(v); pg.reset(); }} 
        placeholder="Tìm tên khách, mã nước..." 
      />

      <div className="card-grid card-grid--review">
        {pg.paged.map((r: any) => (
          <div key={r.id} className="review-card">
            <div className="review-card__head">
              <img 
                className="review-avatar" 
                src={r.avatar || `https://ui-avatars.com/api/?name=${r.userName}`} 
                alt={r.userName} 
                onError={e => { (e.target as HTMLImageElement).src = "https://www.w3schools.com/howto/img_avatar.png"; }} 
              />
              <div>
                <div className="review-card__name">{r.userName}</div>
                <div className="review-stars">{stars(r.rating)}</div>
              </div>
            </div>
            <p className="review-comment">"{r.comment}"</p>
            <div className="review-drink">🍹 {getDrinkName(r.idDrink)}</div>
            <div className="review-date">📅 {new Date(r.dateReview).toLocaleDateString("vi-VN")}</div>
            <div className="review-card__actions">
              <Btn small variant="danger" onClick={() => setConfirm(r.id)}>🗑</Btn>
            </div>
          </div>
        ))}
      </div>

      <Pagination {...pg} />

      {modal === "add" && (
  <Modal title="Thêm đánh giá" onClose={() => setModal(null)}>
    <div className="form-grid-2">
      <Field label="Khách hàng đánh giá">
        <select 
          className="input" 
          value={form.idUser} 
          onChange={e => handleUserChange(e.target.value)}
        >
          <option value="">-- Chọn khách hàng --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.nameDisplay} ({u.id})
            </option>
          ))}
        </select>
      </Field>
      
      {/* Ô này sẽ tự hiển thị ID sau khi chọn ở trên, để disabled để user không sửa lung tung */}
      <Field label="ID người dùng">
        <input className="input" value={form.idUser} disabled placeholder="ID tự động..." />
      </Field>
    </div>

    <Field label="URL avatar">
      <input className="input" value={form.avatar} disabled placeholder="Link ảnh tự động..." />
    </Field>

    <Field label="Chọn đồ uống">
      <select className="input" value={form.idDrink} onChange={e => F("idDrink", e.target.value)}>
        <option value="">-- Chọn đồ uống --</option>
        {drinks.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
      </select>
    </Field>

    {/* ... Các phần Rating và Comment giữ nguyên ... */}
    
    <Field label={`Số sao: ${form.rating} ★`}>
      <input type="range" className="input--range" min={1} max={5} value={form.rating} onChange={e => F("rating", +e.target.value)} />
    </Field>
    <Field label="Nhận xét">
      <textarea className="input input--textarea" value={form.comment} onChange={e => F("comment", e.target.value)} />
    </Field>
    
    <div className="form-actions">
      <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
      <Btn onClick={save}>Lưu đánh giá</Btn>
    </div>
  </Modal>
)}

      {confirm !== null && (
        <Confirm 
          message="Xóa đánh giá này khỏi hệ thống?" 
          onConfirm={() => del(confirm!)} 
          onCancel={() => setConfirm(null)} 
        />
      )}
    </div>
  );
}

// ============================================================
// ACTIVITIES
// ============================================================
function ActivitiesSection({ activities, setActivities }: { activities: Activity[]; setActivities: (a: Activity[]) => void }) {
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [modal,     setModal]     = useState<"add" | "edit" | null>(null);
  // FIX: id should be string to match backend, not number
  const emptyActivity: Activity = { id: "", title: "", dateCreate: "", idCategory: "SỰ KIỆN", description: "", image: "", badge: "Hot" };
  const [form,    setForm]    = useState<Activity>(emptyActivity);
  const [confirm, setConfirm] = useState<string | null>(null);
  const F = (k: keyof Activity, v: any) => setForm(f => ({ ...f, [k]: v }));

  const cats       = ["SỰ KIỆN", "TIN TỨC", "NHIỆM VỤ"] as const;
  const badges     = ["Hot", "New", "Quest", "Event", "Info", "Fix", "Epic", "Secret"];
  const catOptions = [{ key: "all", label: "Tất cả" }, ...cats.map(c => ({ key: c, label: c }))];

  const filtered = useMemo(() => activities.filter(a =>
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "all" || a.idCategory === filterCat)
  ), [activities, search, filterCat]);

  const pg = usePagination(filtered, 4);

  const save = async () => {
    if (!form.id || !form.title) {
      alert("Vui lòng nhập ID và tiêu đề!");
      return;
    }
    try {
      if (modal === "add") {
        await ActivityService.create(form);
        const data = await ActivityService.getAll();
        setActivities(data);
      } else {
        await ActivityService.update(form.id, form);
        setActivities(activities.map(a => a.id === form.id ? form : a));
      }
      setModal(null);
    } catch {
      alert("Có lỗi xảy ra khi lưu hoạt động.");
    }
  };

  const del = async (id: string) => {
    try {
      await ActivityService.delete(id);
      setActivities(activities.filter(a => a.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa hoạt động này.");
    }
  };

 const generateNextId = (list: any[]) => {
  if (!list || list.length === 0) return "1";

  // 1. Trích xuất các số ID hiện có và chuyển thành mảng số nguyên
  const nums = list
    .map(item => {
      const match = item.id?.toString().match(/\d+$/);
      return match ? parseInt(match[0], 10) : null;
    })
    .filter((n): n is number => n !== null && n > 0); // Loại bỏ null và số <= 0

  // 2. Sắp xếp mảng số tăng dần
  nums.sort((a, b) => a - b);

  // 3. Tìm số còn thiếu nhỏ nhất (Smallest Missing Positive Integer)
  let nextId = 1;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === nextId) {
      nextId++; // Nếu số hiện tại bằng nextId, tăng nextId lên để kiểm tra số kế tiếp
    } else if (nums[i] > nextId) {
      break; // Nếu số hiện tại lớn hơn nextId, nghĩa là đã tìm thấy lỗ hổng
    }
  }

  return nextId.toString();
};

  return (
    <div>
      <SectionHeader title={`🎪 Hoạt động (${activities.length})`} onAdd={() => { // TỰ ĐỘNG TẠO ID MỚI KHI NHẤN ADD
          const nextId = generateNextId(activities);
          setForm({ 
            id: nextId, 
            title: "", 
            dateCreate: new Date().toISOString().split('T')[0], // Mặc định lấy ngày hôm nay (YYYY-MM-DD)
            idCategory: "SỰ KIỆN", 
            description: "", 
            image: "", 
            badge: "Hot" 
          }); 
          setModal("add"); 
          pg.reset();}} searchValue={search} onSearch={v => { setSearch(v); pg.reset(); }} placeholder="Tìm tiêu đề..." />
      <FilterBar options={catOptions} value={filterCat} onChange={v => { setFilterCat(v); pg.reset(); }} />
      <div className="card-grid card-grid--activity">
        {pg.paged.map(a => (
          <div key={a.id} className="card">
            <div className="card__img-wrap">
              <img className="card__img card__img--activity" src={a.image} alt={a.title} onError={onImgErr} />
              <div className="card__badges">
                <Tag label={a.badge} color={BADGE_COLOR[a.badge]} />
                <Tag label={a.idCategory} color="#3b82f6" />
              </div>
            </div>
            <div className="card__body">
              <div className="card__date">📅 {a.dateCreate}</div>
              <div className="card__title">{a.title}</div>
              <div className="card__desc">{a.description}</div>
              <div className="card__actions">
                <Btn small variant="ghost" onClick={() => { setForm(a); setModal("edit"); }}>✏️ Sửa</Btn>
                {/* FIX: confirm state is now string to match id type */}
                <Btn small variant="danger" onClick={() => setConfirm(a.id)}>🗑</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm hoạt động" : "Sửa hoạt động"} onClose={() => setModal(null)}>
          {/* FIX: add ID field since id is now a string managed manually */}
          <div className="form-grid-2">
            <Field label="ID">
              <input className="input" value={form.id} disabled />
            </Field>            <Field label="Tiêu đề"><input className="input" value={form.title} onChange={e => F("title", e.target.value)} /></Field>
          </div>
          <div className="form-grid-2">
            <Field label="Ngày"><input className="input" value={form.dateCreate} onChange={e => F("dateCreate", e.target.value)} /></Field>
            <Field label="Danh mục">
              <select className="input" value={form.idCategory} onChange={e => F("idCategory", e.target.value)}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Badge">
              <select className="input" value={form.badge} onChange={e => F("badge", e.target.value)}>
                {badges.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="URL hình ảnh"><input className="input" value={form.image} onChange={e => F("image", e.target.value)} /></Field>
          </div>
          <Field label="Mô tả"><textarea className="input input--textarea" value={form.description} onChange={e => F("description", e.target.value)} /></Field>
          {form.image && <img className="img-preview img-preview--sm" src={form.image} alt="" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {/* FIX: confirm is string now */}
      {confirm !== null && <Confirm message="Xóa hoạt động này?" onConfirm={() => del(confirm!)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ============================================================
// BRANCHES
// ============================================================
function BranchesSection({ branches, setBranches }: { branches: Branch[]; setBranches: (b: Branch[]) => void }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<Branch>({ id: 0, name: "", address: "", phone: "", hours: "", mapUrl: "", image: "" });
  const [confirm, setConfirm] = useState<number | null>(null);
  
  const F = (k: keyof Branch, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Hàm tìm ID còn thiếu nhỏ nhất (Kết quả trả về kiểu number)
  const generateNextIdNum = (list: any[]) => {
    if (!list || list.length === 0) return 1;
    const nums = list
      .map(item => {
        const match = item.id?.toString().match(/\d+$/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((n): n is number => n !== null && n > 0);
    
    nums.sort((a, b) => a - b);

    let nextId = 1;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === nextId) {
        nextId++;
      } else if (nums[i] > nextId) {
        break;
      }
    }
    return nextId;
  };

  const filtered = useMemo(() => branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase())
  ), [branches, search]);

  const pg = usePagination(filtered, 4);

  const save = async () => {
    try {
      if (modal === "add") {
        await BranchService.create(form);
        const data = await BranchService.getAll();
        setBranches(data);
      } else {
        await BranchService.update(form.id, form);
        setBranches(branches.map(b => b.id === form.id ? form : b));
      }
      setModal(null);
    } catch {
      alert("Có lỗi xảy ra khi lưu chi nhánh.");
    }
  };

  const del = async (id: number) => {
    try {
      await BranchService.delete(id);
      setBranches(branches.filter(b => b.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa chi nhánh này.");
    }
  };

  return (
    <div>
      <SectionHeader 
        title={`🏪 Chi nhánh (${branches.length})`} 
        onAdd={() => { 
          // Tự động lấy ID còn thiếu nhỏ nhất
          const nextId = generateNextIdNum(branches);
          setForm({ id: nextId, name: "", address: "", phone: "", hours: "", mapUrl: "", image: "" }); 
          setModal("add"); 
        }} 
        searchValue={search} 
        onSearch={v => { setSearch(v); pg.reset(); }} 
        placeholder="Tìm chi nhánh..." 
      />

      <div className="card-grid card-grid--branch">
        {pg.paged.map(b => (
          <div key={b.id} className="card">
            <img className="card__img card__img--branch" src={b.image} alt={b.name} onError={onImgErr} />
            <div className="card__body--lg">
              <div className="card__title--gold">
                <span style={{fontSize: '0.8em', opacity: 0.7}}>#{b.id}</span> {b.name}
              </div>
              <div className="card__info">
                <div>📍 {b.address}</div>
                <div>📞 {b.phone}</div>
                <div>🕐 {b.hours}</div>
              </div>
              <div className="card__actions">
                <Btn small variant="ghost" onClick={() => { setForm(b); setModal("edit"); }}>✏️ Sửa</Btn>
                <Btn small variant="danger" onClick={() => setConfirm(b.id)}>🗑</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm chi nhánh" : "Sửa chi nhánh"} onClose={() => setModal(null)}>
          {/* BỔ SUNG CỘT ID Ở ĐÂY */}
          <div className="form-grid-2">
            <Field label="Mã chi nhánh (ID)">
              <input className="input" value={form.id} disabled />
            </Field>
            <Field label="Tên chi nhánh">
              <input className="input" value={form.name} onChange={e => F("name", e.target.value)} />
            </Field>
          </div>

          <Field label="Địa chỉ">
            <input className="input" value={form.address} onChange={e => F("address", e.target.value)} />
          </Field>

          <div className="form-grid-2">
            <Field label="Số điện thoại">
              <input className="input" value={form.phone} onChange={e => F("phone", e.target.value)} />
            </Field>
            <Field label="Giờ mở cửa">
              <input className="input" value={form.hours} onChange={e => F("hours", e.target.value)} />
            </Field>
          </div>
          
          <Field label="URL hình ảnh">
            <input className="input" value={form.image} onChange={e => F("image", e.target.value)} />
          </Field>
          <Field label="URL Google Maps">
            <input className="input" value={form.mapUrl} onChange={e => F("mapUrl", e.target.value)} />
          </Field>

          {form.image && <img className="img-preview img-preview--sm" src={form.image} alt="" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}
      {confirm !== null && <Confirm message="Xóa chi nhánh này?" onConfirm={() => del(confirm!)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
// ============================================================
// JOBS
// ============================================================
function JobsSection({ jobs, setJobs }: { jobs: Job[]; setJobs: (j: Job[]) => void }) {
  // 1. States
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<Job>({
    id: "", position: "", location: "", salary: "", 
    type: "Full-time", deadline: "", description: "", requirements: [] 
  });
  const [reqInputs, setReqInputs] = useState<string[]>([""]);

  const F = (k: keyof Job, v: any) => setForm(f => ({ ...f, [k]: v }));

  // 2. Constants & Helpers
  const TYPE_COLOR: Record<string, string> = { "Full-time": "#10b981", "Part-time": "#3b82f6" };

  // Hàm tạo ID lấp đầy lỗ hổng dùng chung (JOB1, JOB2...)
  const generateNextId = (list: any[], prefix: string = "") => {
    if (!list || list.length === 0) return `${prefix}1`;
    const nums = list
      .map(item => {
        const match = item.id?.toString().match(/\d+$/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((n): n is number => n !== null && n > 0)
      .sort((a, b) => a - b);

    let nextNum = 1;
    for (const n of nums) {
      if (n === nextNum) nextNum++;
      else if (n > nextNum) break;
    }
    return `${prefix}${nextNum}`;
  };

  // 3. Sự kiện chính
  const openModal = (job?: Job) => {
    if (job) {
      setForm(job);
      setReqInputs(job.requirements.length > 0 ? job.requirements.map(r => r.requirement) : [""]);
      setModal("edit");
    } else {
      const nextId = generateNextId(jobs, "JOB");
      setForm({ 
        id: nextId, position: "", location: "", salary: "", 
        type: "Full-time", deadline: "", description: "", requirements: [] 
      });
      setReqInputs([""]);
      setModal("add");
    }
  };

  const save = async () => {
    if (!form.position.trim()) return alert("Vui lòng nhập vị trí tuyển dụng");

    // Map chuỗi từ UI sang Object Model JobRequirements
    const reqObjects: JobRequirements[] = reqInputs
      .filter(r => r.trim() !== "")
      .map((r, i) => ({ 
        id: 0,
        jobId: form.id, 
        requirement: r 
      }));
      
    const jobToSave = { ...form, requirements: reqObjects };

    try {
      if (modal === "add") {
        await JobService.create(jobToSave);
        // Refresh lại data từ server để lấy ID chính xác cho các Requirements
        const data = await JobService.getAll();
        setJobs(data);
      } else {
        await JobService.update(form.id, jobToSave);
        setJobs(jobs.map(j => j.id === form.id ? jobToSave : j));
      }
      setModal(null);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu tin tuyển dụng.");
    }
  };

  const del = async (id: string) => {
    try {
      // Backend của bạn xử lý xóa bản ghi con trước bản ghi cha (Job)
      await JobService.delete(id);
      setJobs(jobs.filter(j => j.id !== id));
      setConfirm(null);
    } catch (error) {
      console.error("Xóa thất bại:", error);
      alert("Không thể xóa tin tuyển dụng này.");
    }
  };

  // Quản lý input Requirement trong form
  const updReq = (i: number, v: string) => setReqInputs(prev => prev.map((r, idx) => idx === i ? v : r));
  const addReq = () => setReqInputs(prev => [...prev, ""]);
  const removeReq = (i: number) => setReqInputs(prev => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [""]));

  // 4. Filter & Phân trang
  const filtered = useMemo(() => jobs.filter(j =>
    (j.position.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === "all" || j.type === filterType)
  ), [jobs, search, filterType]);

  const pg = usePagination(filtered, 4);

  return (
    <div>
      <SectionHeader 
        title={`💼 Tuyển dụng (${jobs.length})`} 
        onAdd={() => openModal()} 
        searchValue={search} 
        onSearch={v => { setSearch(v); pg.reset(); }} 
        placeholder="Tìm vị trí, địa điểm..." 
      />
      
      <FilterBar 
        options={[{ key: "all", label: "Tất cả" }, { key: "Full-time", label: "Full-time" }, { key: "Part-time", label: "Part-time" }]} 
        value={filterType} 
        onChange={v => { setFilterType(v); pg.reset(); }} 
      />

      <div className="jobs-list">
        {pg.paged.map(j => (
          <div key={j.id} className="job-card">
            <div className="job-card__head">
              <div className="job-card__info">
                <div className="job-card__tags">
                  <Tag label={j.id} color="#7a4a22" />
                  <Tag label={j.type} color={TYPE_COLOR[j.type]} />
                </div>
                <div className="job-card__position">{j.position}</div>
                <div className="job-card__meta">
                  <span>📍 {j.location || "Chưa cập nhật"}</span>
                  <span>💰 {j.salary || "Thỏa thuận"}</span>
                  <span>⏰ Hạn: {j.deadline || "Không thời hạn"}</span>
                </div>
                <div className="job-card__desc">{j.description}</div>
                <div className="job-card__reqs">
                  {j.requirements?.map((r, idx) => (
                    <span key={`${j.id}-req-${idx}`} className="job-req">✓ {r.requirement}</span>
                  ))}
                </div>
              </div>
              <div className="job-card__actions">
                <Btn small variant="ghost" onClick={() => openModal(j)}>✏️ Sửa</Btn>
                <Btn small variant="danger" onClick={() => setConfirm(j.id)}>🗑</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm tin tuyển dụng" : "Sửa tin tuyển dụng"} onClose={() => setModal(null)}>
          <div className="form-grid-2">
            <Field label="Mã JOB">
              <input className="input" value={form.id} disabled />
            </Field>
            <Field label="Loại hình">
              <select className="input" value={form.type} onChange={e => F("type", e.target.value)}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </Field>
          </div>

          <Field label="Vị trí tuyển dụng">
            <input className="input" value={form.position} onChange={e => F("position", e.target.value)} placeholder="VD: Nhân viên phục vụ" />
          </Field>

          <div className="form-grid-2">
            <Field label="Địa điểm"><input className="input" value={form.location} onChange={e => F("location", e.target.value)} /></Field>
            <Field label="Mức lương"><input className="input" value={form.salary} onChange={e => F("salary", e.target.value)} /></Field>
            <Field label="Hạn nộp"><input className="input" value={form.deadline} onChange={e => F("deadline", e.target.value)} placeholder="dd/mm/yyyy" /></Field>
          </div>

          <Field label="Mô tả công việc"><textarea className="input input--textarea" value={form.description} onChange={e => F("description", e.target.value)} /></Field>
          
          <div className="req-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="field-label" style={{ margin: 0 }}>Yêu cầu công việc</label>
            <Btn small onClick={addReq}>+ Thêm dòng</Btn>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {reqInputs.map((r, i) => (
              <div key={`input-req-${i}`} className="req-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input className="input" value={r} onChange={e => updReq(i, e.target.value)} placeholder={`Yêu cầu ${i + 1}`} />
                <button className="req-remove-btn" type="button" onClick={() => removeReq(i)} style={{ color: '#ef4444' }}>✕</button>
              </div>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: 24 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu thông tin</Btn>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm 
          message={`Bạn có chắc chắn muốn xóa vị trí "${jobs.find(j => j.id === confirm)?.position}"?`} 
          onConfirm={() => del(confirm)} 
          onCancel={() => setConfirm(null)} 
        />
      )}
    </div>
  );
}

// ============================================================
// VOUCHERS
// ============================================================
function VouchersSection({ vouchers, setVouchers }: { vouchers: Voucher[]; setVouchers: (v: Voucher[]) => void }) {
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<"add" | "edit" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const emptyVoucher: Voucher = { id: "", content: "", pointRequirement: "", point: 0 };
  const [form, setForm] = useState<Voucher>(emptyVoucher);
  const F = (k: keyof Voucher, v: any) => setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() =>
    vouchers.filter(v =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.content.toLowerCase().includes(search.toLowerCase())
    ), [vouchers, search]);

  const pg = usePagination(filtered, 8);

  // Tạo ID tự động: VOU1, VOU2, ...
  const generateNextId = (list: Voucher[]) => {
    if (!list.length) return "VOU1";
    const nums = list
      .map(v => { const m = v.id.match(/\d+$/); return m ? parseInt(m[0]) : 0; })
      .filter(n => n > 0)
      .sort((a, b) => a - b);
    let next = 1;
    for (const n of nums) { if (n === next) next++; else if (n > next) break; }
    return `VOU${next}`;
  };

  const save = async () => {
    if (!form.id || !form.content) {
      alert("Vui lòng nhập đầy đủ ID và nội dung voucher!");
      return;
    }
    try {
      if (modal === "add") {
        const isDup = vouchers.some(v => v.id.toLowerCase() === form.id.toLowerCase());
        if (isDup) { alert(`ID "${form.id}" đã tồn tại!`); return; }
        await VoucherService.create(form);
        const data = await VoucherService.getAll();
        setVouchers(data);
      } else {
        await VoucherService.update(form.id, form);
        setVouchers(vouchers.map(v => v.id === form.id ? form : v));
      }
      setModal(null);
    } catch {
      alert("Có lỗi xảy ra khi lưu voucher.");
    }
  };

  const del = async (id: string) => {
    try {
      await VoucherService.delete(id);
      setVouchers(vouchers.filter(v => v.id !== id));
      setConfirm(null);
    } catch {
      alert("Không thể xóa voucher này.");
    }
  };

  return (
    <div>
      <SectionHeader
        title={`🎟️ Voucher (${vouchers.length})`}
        onAdd={() => { setForm({ ...emptyVoucher, id: generateNextId(vouchers) }); setModal("add"); pg.reset(); }}
        searchValue={search}
        onSearch={v => { setSearch(v); pg.reset(); }}
        placeholder="Tìm ID, nội dung..."
      />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {["Mã voucher", "Nội dung", "Yêu cầu hạng", "Điểm cần", ""].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {pg.paged.map(v => (
              <tr key={v.id}>
                <td className="td-id">
                  <Tag label={v.id} color="#c9a84c" />
                </td>
                <td className="td-main">{v.content}</td>
                <td>
                  <Tag
                    label={v.pointRequirement || "Tất cả"}
                    color={
                      v.pointRequirement === "Kim Cương" ? "#60a5fa"
                      : v.pointRequirement === "Vàng" ? "#f59e0b"
                      : v.pointRequirement === "Bạc" ? "#94a3b8"
                      : v.pointRequirement === "Đồng" ? "#cd7c2f"
                      : "#10b981"
                    }
                  />
                </td>
                <td className="td-money">
                  <span style={{ color: "#f5d87a", fontWeight: 700 }}>💎 {v.point.toLocaleString()}</span>
                </td>
                <td>
                  <div className="td-actions">
                    <Btn small variant="ghost" onClick={() => { setForm(v); setModal("edit"); }}>✏️ Sửa</Btn>
                    <Btn small variant="danger" onClick={() => setConfirm(v.id)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {pg.paged.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#666", padding: "2rem" }}>Chưa có voucher nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination {...pg} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Thêm voucher" : "Sửa voucher"} onClose={() => setModal(null)}>
          <div className="form-grid-2">
            <Field label="Mã voucher (ID)">
              <input
                className="input"
                value={form.id}
                onChange={e => F("id", e.target.value.toUpperCase())}
                disabled={modal === "edit"}
                placeholder="VD: VOU1"
              />
            </Field>
            <Field label="Điểm cần để đổi">
              <input
                className="input"
                type="number"
                min={0}
                value={form.point}
                onChange={e => F("point", +e.target.value)}
              />
            </Field>
          </div>
          <Field label="Nội dung voucher">
            <input
              className="input"
              value={form.content}
              onChange={e => F("content", e.target.value)}
              placeholder="VD: Giảm 20% đơn hàng tiếp theo"
            />
          </Field>
          <Field label="Yêu cầu hạng thành viên">
            <select className="input" value={form.pointRequirement} onChange={e => F("pointRequirement", e.target.value)}>
              <option value="">Tất cả thành viên</option>
              <option value="Tập Sự">Tập Sự</option>
              <option value="Đồng">Đồng</option>
              <option value="Bạc">Bạc</option>
              <option value="Vàng">Vàng</option>
              <option value="Kim Cương">Kim Cương</option>
            </select>
          </Field>
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Hủy</Btn>
            <Btn onClick={save}>Lưu</Btn>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          message={`Xóa voucher "${vouchers.find(v => v.id === confirm)?.content}"?`}
          onConfirm={() => del(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================
export default function AdminPage() {
  const [active,      setActive]      = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [drinkList,    setDrinks]     = useState<Drink[]>([]);
  const [activityList, setActivities] = useState<Activity[]>([]);
  const [branchList,   setBranches]   = useState<Branch[]>([]);
  const [categoryList, setCategories] = useState<Category[]>([]);
  const [jobList,      setJobs]       = useState<Job[]>([]);
  const [orderList,    setOrders]     = useState<Order[]>([]);
  const [reviewList,   setReviews]    = useState<Review[]>([]);
  const [userList,     setUsers]      = useState<User[]>([]);
  const [voucherList,  setVouchers]   = useState<Voucher[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drinkData, categoryData, orderData, userData, activityData, reviewData, branchData, jobData, voucherData] =
          await Promise.all([
            DrinkService.getAll(),
            CategoryService.getAll(),
            OrderService.getAll(),
            UserService.getAll(),
            ActivityService.getAll(),
            ReviewService.getAll(),
            BranchService.getAll(),
            JobService.getAll(),
            VoucherService.getAll(),
          ]);
        setDrinks(drinkData);
        setCategories(categoryData);
        setOrders((orderData as any[]).map(normalizeOrder));
        setUsers((userData as any[]).map(normalizeUser));
        setActivities(activityData);
        setReviews(reviewData);
        setBranches(branchData);
        setJobs(jobData);
        setVouchers(voucherData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []); // FIX: empty dependency array — fetch only once on mount

  const activeNav = NAV_ITEMS.find(n => n.key === active)!;

  return (
    <div className="admin-root">
      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : "admin-sidebar--closed"}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">☕</div>
          {sidebarOpen && (
            <div>
              <div className="sidebar-brand-name">Coffee Realm</div>
              <div className="sidebar-brand-sub">Admin Dashboard</div>
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-btn${active === item.key ? " nav-btn--active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="nav-btn__icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-btn__label">{item.label}</span>}
              {sidebarOpen && active === item.key && <span className="nav-btn__dot" />}
            </button>
          ))}
        </nav>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <span className="topbar-title">{activeNav.icon} {activeNav.label}</span>
          <div className="topbar-right">
            <span className="topbar-date">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
            <div className="topbar-avatar">👑</div>
          </div>
        </div>

        <div className="admin-content">
          {active === "dashboard"  && <Dashboard drinks={drinkList} orders={orderList} users={userList} reviews={reviewList} activities={activityList} branches={branchList} jobs={jobList} />}
          {active === "drinks"     && <DrinksSection     drinks={drinkList}         setDrinks={setDrinks}         categories={categoryList} />}
          {active === "categories" && <CategoriesSection categories={categoryList} setCategories={setCategories} />}
          {active === "orders"     && <OrdersSection     orders={orderList}         setOrders={setOrders}         users={userList}  drinks={drinkList} />}
          {active === "users"      && <UsersSection      users={userList}           setUsers={setUsers} />}
          {active === "reviews"    && <ReviewsSection    reviews={reviewList} setReviews={setReviews} drinks={drinkList} users={userList} />}
          {active === "activities" && <ActivitiesSection activities={activityList} setActivities={setActivities} />}
          {active === "branches"   && <BranchesSection   branches={branchList}     setBranches={setBranches} />}
          {active === "jobs"       && <JobsSection       jobs={jobList}             setJobs={setJobs} />}
          {active === "vouchers"   && <VouchersSection   vouchers={voucherList}     setVouchers={setVouchers} />}
        </div>
      </main>
    </div>
  );
}