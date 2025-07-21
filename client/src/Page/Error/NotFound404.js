// src/pages/NotFound404.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const NotFound404 = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1 text-warning">404</h1>
      <h2 className="mb-3">Trang không tồn tại</h2>
      <p className="lead">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Link to="/" className="btn btn-primary mt-3">Quay về trang chủ</Link>
    </div>
  );
};

export default NotFound404;
