import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../../../api/Product/product.api';
import { getAllCategories } from '../../../api/Category/category.api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Format
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getAllProducts();
        const categoryData = await getAllCategories();

        if (Array.isArray(productData)) {
          setProducts(productData);
          setFilteredProducts(productData);
        }

        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        }
      } catch (error) {
        console.error('❌ Lỗi khi gọi API:', error);
      }
    };
    fetchData();
  }, []);

  // Xử lý lọc khi nhập hoặc chọn
  useEffect(() => {
    let result = products;

    if (searchName.trim()) {
      result = result.filter((p) =>
        p.tensanpham.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.theloai === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchName, selectedCategory, products]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white text-center">
          <h4>📦 Danh Sách Sản Phẩm</h4>
        </div>

        <div className="card-body">
          {/* Form tìm kiếm */}
          <div className="row mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm theo tên sản phẩm..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Tất cả thể loại --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.tendanhmuc}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchName('');
                  setSelectedCategory('');
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Bảng sản phẩm */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center">
              <thead className="table-light">
                <tr>
                  <th>Tên Sản Phẩm</th>
                  <th>Giá</th>
                  <th>Thể Loại</th>
                  <th>Ngày Thêm</th>
                  <th>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-muted">
                      Không có sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.tensanpham}</td>
                      <td>{formatCurrency(product.giasanpham)}</td>
                      <td>
                        {
                          categories.find((c) => c._id === product.theloai)?.tendanhmuc || 'Không rõ'
                        }
                      </td>

                      <td>{formatDate(product.ngaythem)}</td>
                      <td>
                        <Link
                          to={`/admin/products/detail/${product._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
