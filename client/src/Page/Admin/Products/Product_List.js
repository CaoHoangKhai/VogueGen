import { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Gọi API lấy danh sách sản phẩm
        axios.get('http://localhost:4000/admin/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error('Lỗi khi load sản phẩm:', err));
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
                                <th>Mô Tả</th>
                                <th>Ngày Thêm</th>
                                <th>Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6">Không có sản phẩm nào</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.tensanpham}</td>
                                        <td>{product.giasanpham} đ</td>
                                        <td>{product.theloai}</td> 
                                        <td>{product.mota}</td>
                                        <td>{new Date(product.ngaythem).toLocaleDateString()}</td>
                                        <td>
                                        
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
