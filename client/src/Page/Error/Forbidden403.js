// src/pages/Forbidden403.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Forbidden403 = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1 text-danger">403</h1>
      <h2 className="mb-3">Access Denied</h2>
      <p className="lead">Bạn không có quyền truy cập vào trang này.</p>
      <Link to="/" className="btn btn-primary mt-3">Quay về trang chủ</Link>
    </div>
  );
};

export default Forbidden403;
