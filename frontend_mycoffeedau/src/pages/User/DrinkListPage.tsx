import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import './DrinkListPage.css';
import { categories } from '../../data/categories';
import { Link, useLocation } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import type { Drink } from '../../models/drink';
import { DrinkService } from '../../constants/APIService';

const DrinkListPage = () => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  // Lấy keyword và category từ URL
  const keyword = queryParams.get("keyword")?.toLowerCase() || "";
  const categoryParam = queryParams.get("category") || "all";

  const [columns, setColumns] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name-asc');
  const { addToCart } = useCart();

  const [drinkList, setDrinkList] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho bộ lọc
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [filters, setFilters] = useState({
    isBestSeller: false,
    isFeatured: false,
    hasDiscount: false
  });

  const itemsPerPage = 8;

  // 1. Logic Lọc tổng hợp & Sắp xếp (Đã thêm keyword vào dependency)
  const processedItems = useMemo(() => {
    const result = drinkList.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchPrice = item.price >= priceRange.min && item.price <= priceRange.max;
      const matchBestSeller = !filters.isBestSeller || item.isBestSeller;
      const matchFeatured = !filters.isFeatured || item.isFeatured;
      const matchDiscount = !filters.hasDiscount || (item.isPromotion && item.promotionPercent > 0);
      const matchKeyword = 
        item.name.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword);
      
      return matchCategory && matchPrice && matchBestSeller && matchFeatured && matchDiscount && matchKeyword;
    });

    // Thực hiện Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

    return result;
  }, [drinkList, selectedCategory, priceRange, filters, sortBy, keyword]); // Keyword cực kỳ quan trọng ở đây

  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const currentItems = processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginationNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, totalPages]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
    setCurrentPage(1);
  };

  // 2. Gọi API và Đồng bộ URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await DrinkService.getAll();
        setDrinkList(data);
      } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Cập nhật Category từ URL khi người dùng nhấn từ Header
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
    
    // Reset các bộ lọc khác nếu cần thiết khi chuyển danh mục
    setPriceRange({ min: 0, max: 200000 });
    setFilters({ isBestSeller: false, isFeatured: false, hasDiscount: false });

  }, [location.search, categoryParam]); // Chạy lại khi URL thay đổi

  if (loading) return <div className="text-center p-5 gold-text">Đang triệu hồi danh sách...</div>;

  return (
    <div className="drink-list-page container-fluid py-5">
      <div className="row g-4">
        {/* SIDEBAR BỘ LỌC */}
        <aside className="col-lg-3">
          <div className="fantasy-panel">
            <h3 className="filter-title">Lọc Đồ Uống</h3>
            
            <div className="filter-section">
              <label className="section-label">Loại</label>
              <select 
                className="fantasy-select w-100" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả các loại</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label className="section-label">Ngân Sách (đ)</label>
              <div className="price-input-container">
                <input 
                  type="number" 
                  value={priceRange.min} 
                  onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})} 
                />
                <input 
                  type="number" 
                  value={priceRange.max} 
                  onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="filter-section">
              <label className="section-label">Đặc Tính</label>
              <ul className="custom-checkbox-list">
                <li>
                  <input type="checkbox" id="f-bestseller" name="isBestSeller" checked={filters.isBestSeller} onChange={handleFilterChange} />
                  <label htmlFor="f-bestseller"><span></span> Bán Chạy</label>
                </li>
                <li>
                  <input type="checkbox" id="f-featured" name="isFeatured" checked={filters.isFeatured} onChange={handleFilterChange} />
                  <label htmlFor="f-featured"><span></span> Nổi Bật</label>
                </li>
                <li>
                  <input type="checkbox" id="f-discount" name="hasDiscount" checked={filters.hasDiscount} onChange={handleFilterChange} />
                  <label htmlFor="f-discount"><span></span> Đang Khuyến Mãi</label>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="col-lg-9">
          <div className="list-toolbar d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div className="display-options d-none d-md-flex align-items-center">
              <span className="label-gold me-2">Lưới:</span>
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  className={`btn-grid-toggle ${columns === num ? 'active' : ''}`}
                  onClick={() => setColumns(num)}
                >
                  <div className={`grid-icon grid-${num}`}>
                    {Array.from({ length: num * 2 }).map((_, i) => <span key={i}></span>)}
                  </div>
                </button>
              ))}
            </div>
            
            <select className="fantasy-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name-asc">Tên: A - Z</option>
              <option value="name-desc">Tên: Z - A</option>
              <option value="price-asc">Giá: Thấp - Cao</option>
              <option value="price-desc">Giá: Cao - Thấp</option>
            </select>
          </div>
          
          <div className={`row row-cols-2 row-cols-md-${columns} g-3`}>
            {currentItems.length > 0 ? (
              currentItems.map(item => {
                const hasPromo = item.isPromotion && item.promotionPercent > 0;
                const originalPrice = hasPromo 
                  ? Math.round(item.price / (1 - item.promotionPercent / 100)) 
                  : item.price;

                return (
                  <div className="col" key={item.id}>
                    <div className="drink-card-mini">
                      <div className="card-img-container">
                        <Link to={`/drinkdetail/${item.id}`}>
                          {/* Sửa đường dẫn ảnh tại đây nếu cần */}
                          <img src={item.image.startsWith('/') ? item.image : `/${item.image}`} alt={item.name} />
                        </Link>
                        <div className="hanging-tags-left">
                          {item.isBestSeller && <div className="tag gold">Best</div>}
                          {item.isFeatured && <div className="tag blue">Hot</div>}
                        </div>
                        {hasPromo && <div className="tag-sale">-{item.promotionPercent}%</div>}
                      </div>

                      <div className="card-body-fantasy">
                        <h5 className="item-name">{item.name}</h5>
                        <div className="price-container">
                          {hasPromo && <span className="price-old">{originalPrice.toLocaleString()}đ</span>}
                          <span className="price-new">{item.price.toLocaleString()}đ</span>
                        </div>
                        <button className="btn-action-fantasy" onClick={() => { addToCart(item); alert("Đã thêm!"); }}>
                          THÊM VÀO TÚI
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center p-5 gold-text">
                Không tìm thấy món nước nào phù hợp với yêu cầu của lữ khách...
              </div>
            )}
          </div>

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <ul className="pagination-fantasy mt-5">
              <li className={currentPage === 1 ? 'disabled' : ''} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <div className="arrow-left"></div>
              </li>
              {paginationNumbers.map(num => (
                <li key={num} className={currentPage === num ? 'active' : ''} onClick={() => setCurrentPage(num)}>{num}</li>
              ))}
              <li className={currentPage === totalPages ? 'disabled' : ''} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <div className="arrow-right"></div>
              </li>
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default DrinkListPage;