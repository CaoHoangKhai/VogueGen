import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Fuse from "fuse.js";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;

  // Lấy danh sách người dùng từ server
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/admin/user_list");
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      alert("Không lấy được danh sách người dùng");
    }
  };

  // Chạy 1 lần khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset currentPage về 1 khi searchTerm hoặc statusFilter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Tạo đối tượng Fuse để tìm kiếm mờ
  const fuse = new Fuse(users, {
    keys: ["hoten", "sodienthoai", "email"],
    threshold: 0.3,
  });

  // Lọc người dùng theo từ khóa tìm kiếm và trạng thái
  const filteredUsers = (searchTerm.trim() === ""
    ? users
    : fuse.search(searchTerm).map((result) => result.item)
  ).filter((user) => {
    return statusFilter === "" || String(user.TrangThai_id) === statusFilter;
  });

  // Tính toán phân trang
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrevPage = () => setCurrentPage((prev) => (prev === 1 ? prev : prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => (prev === totalPages ? prev : prev + 1));

  // Xuất dữ liệu ra file Excel
  const exportToExcel = () => {
    const exportData = filteredUsers.map((user) => ({
      "Họ tên": user.hoten,
      "Số điện thoại": user.sodienthoai,
      Email: user.email,
      "Trạng thái": user.TrangThai_id === 1 ? "Hoạt động" : "Bị khóa",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "DanhSachNguoiDung.xlsx");
  };

  // Chuyển trạng thái người dùng (khóa/mở)
  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.patch(`http://localhost:4000/admin/user/status/${userId}`);
      if (response.data.message === "Cập nhật trạng thái thành công.") {
        const refreshed = await axios.get("http://localhost:4000/admin/user_list");
        setUsers(refreshed.data);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <div className="container">
      <div className="card p-4 shadow-sm">
        <h4 className="text-center mt-2 mb-3">Quản lý Người Dùng</h4>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex flex-grow-1 gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              style={{ maxWidth: "150px", fontSize: "0.85rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Bị khóa</option>
            </select>
          </div>
          <button className="btn btn-success ms-3" onClick={exportToExcel}>
            Xuất Excel
          </button>
        </div>

        <table className="table table-bordered table-hover text-center">
          <thead className="table-light">
            <tr>
              <th>Họ Tên</th>
              <th>Số Điện Thoại</th>
              <th>Email</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5">Không có người dùng nào</td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.hoten}</td>
                  <td>{user.sodienthoai}</td>
                  <td>{user.email}</td>
                  <td>{user.TrangThai_id === 1 ? "Hoạt động" : "Bị khóa"}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.TrangThai_id === 1 ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleUserStatus(user._id)}
                    >
                      {user.TrangThai_id === 1 ? "Khóa" : "Mở"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredUsers.length > usersPerPage && (
          <nav>
            <ul className="pagination justify-content-end">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={handlePrevPage}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i + 1}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button onClick={() => paginate(i + 1)} className="page-link">
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={handleNextPage}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserList;
