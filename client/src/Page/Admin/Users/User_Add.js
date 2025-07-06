import React, { useState } from 'react';
import {
  TextField, Button, IconButton, InputAdornment, Alert,
  Typography, Divider, Box, Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from 'xlsx';
import { signUp } from '../../../api/Auth/auth.api';

const UserAdd = () => {
  const [formData, setFormData] = useState({
    hoten: '',
    email: '',
    sodienthoai: '',
    matkhau: '',
  });

  const [message, setMessage] = useState({ type: '', content: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', content: '' });
  };

  const validateForm = () => {
    if (!formData.hoten || !formData.email || !formData.sodienthoai || !formData.matkhau) {
      setMessage({ type: 'error', content: 'Vui lòng điền đầy đủ thông tin.' });
      return false;
    }
    return true;
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signUp({
        ...formData,
        VaiTro_id: 0,
        TrangThai_id: 1
      });
      setMessage({ type: 'success', content: 'Thêm người dùng thành công' });
      setFormData({ hoten: '', email: '', sodienthoai: '', matkhau: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Đã có lỗi xảy ra.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessage({ type: '', content: '' });
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const dataRaw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        if (!dataRaw.length) {
          setMessage({ type: 'error', content: 'File Excel không có dữ liệu.' });
          setLoading(false);
          return;
        }

        const data = dataRaw.map(row => ({
          hoten: row["Họ và Tên"]?.toString().trim(),
          matkhau: row["Mật khẩu"]?.toString().trim(),
          sodienthoai: row["Số Điện Thoại"]?.toString().trim(),
          email: row["Email"]?.toString().trim(),
        }));

        const valid = data.every(row => row.hoten && row.email && row.sodienthoai && row.matkhau);
        if (!valid) {
          setMessage({ type: 'error', content: 'Một số dòng trong file thiếu thông tin.' });
          setLoading(false);
          return;
        }

        for (const user of data) {
          await signUp({
            ...user,
            VaiTro_id: 0,
            TrangThai_id: 1
          });
        }

        setMessage({ type: 'success', content: `Đã thêm thành công ${data.length} người dùng.` });
      } catch (err) {
        setMessage({ type: 'error', content: 'Lỗi khi xử lý file Excel.' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Box className="container">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Thêm Người Dùng
        </Typography>

        {message.content && (
          <Alert severity={message.type} sx={{ mb: 2 }}>{message.content}</Alert>
        )}

        <form onSubmit={handleManualSubmit}>
          <TextField fullWidth label="Họ và Tên" name="hoten" value={formData.hoten} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Số điện thoại" name="sodienthoai" value={formData.sodienthoai} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField
            fullWidth
            label="Mật khẩu"
            name="matkhau"
            type={showPassword ? 'text' : 'password'}
            value={formData.matkhau}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" type="submit" fullWidth disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Thêm Người Dùng'}
          </Button>
        </form>

        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="textSecondary">
            Hoặc nhập từ Excel
          </Typography>
        </Divider>

        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Typography variant="body1" gutterBottom>
            Nhập người dùng từ file Excel (.xlsx, .xls)
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={loading}
          >
            Chọn file Excel
            <input
              hidden
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
            />
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Chỉ hỗ trợ định dạng .xlsx, .xls.{' '}
            <a
              href="/sample_file/danh_sach_kh.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              Tải file mẫu
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserAdd;
