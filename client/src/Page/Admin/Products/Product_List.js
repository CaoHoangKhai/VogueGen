import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../../../api/Admin/products.api';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllProducts();
                console.log('Dữ liệu sản phẩm:', res); // Debug
                if (res?.data && Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    console.error('Dữ liệu không hợp lệ:', res);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
                setProducts([]);
            }
        };
        fetchData();
    }, []);


    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-header text-dark text-center">
                    <h4>Danh Sách Sản Phẩm</h4>
                </div>

                <div className="card-body">
                    <table className="table table-bordered table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                <th>Tên Sản Phẩm</th>
                                <th>Giá</th>
                                <th>Thể Loại</th>
                                {/* <th>Mô Tả</th> */}
                                <th>Ngày Thêm</th>
                                <th>Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5">Không có sản phẩm nào</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.tensanpham}</td>
                                        <td>{formatCurrency(product.giasanpham)}</td>
                                        <td>{product.tentheloai}</td>
                                        {/* <td>{product.mota}</td> */}
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
    );
};

export default ProductList;
