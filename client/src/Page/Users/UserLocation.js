import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import diachiData from '../../assets/data/vietnam_administrative_data.json';

const UserLocation = () => {
    // Lấy manguoidung từ localStorage
    const userData = localStorage.getItem('user');
    const manguoidung = userData ? JSON.parse(userData)._id : '';

    const [cityList, setCityList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [form, setForm] = useState({
        city: '',
        district: '',
        address: ''
    });
    const [addressList, setAddressList] = useState([]);

    const getCityName = (cityCode) => {
        const city = diachiData.find(c => c.Id === cityCode);
        return city ? city.Name : cityCode;
    };

    const getDistrictName = (cityCode, districtCode) => {
        const city = diachiData.find(c => c.Id === cityCode);
        if (!city) return districtCode;
        const district = city.Districts.find(d => d.Id === districtCode);
        return district ? district.Name : districtCode;
    };

    useEffect(() => {
        const cities = diachiData.map(city => ({
            code: city.Id,
            name: city.Name
        }));
        setCityList(cities);
    }, []);

    useEffect(() => {
        const selectedCity = diachiData.find(c => c.Id === form.city);
        if (selectedCity) {
            const districts = selectedCity.Districts.map(d => ({
                code: d.Id,
                name: d.Name
            }));
            setDistrictList(districts);
        } else {
            setDistrictList([]);
        }
    }, [form.city]);

    const fetchAddressList = () => {
        axios.get(`http://localhost:4000/user/location/list?userId=${manguoidung}`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setAddressList(res.data);
                } else {
                    setAddressList([]);
                }
            })
            .catch(err => {
                console.error('Lỗi lấy danh sách địa chỉ:', err);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === "city" && { district: '' })
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            manguoidung,
            thanhpho: form.city,
            quan_huyen: form.district,
            diachi: form.address
        };

        axios.post('http://localhost:4000/user/location', payload)
            .then(res => {
                alert(res.data?.message || 'Thêm địa chỉ thành công');
                fetchAddressList();
                setForm({ city: '', district: '', address: '' });
            })
            .catch(err => {
                alert(err.response?.data?.message || 'Thêm địa chỉ thất bại');
                console.error('Lỗi thêm địa chỉ:', err);
            });
    };

    const handleDeleteAddress = (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) return;

        axios.delete(`http://localhost:4000/user/location/${id}`)
            .then(res => {
                alert(res.data?.message || "Xóa thành công");
                fetchAddressList();
            })
            .catch(err => {
                alert(err.response?.data?.message || "Xóa thất bại");
                console.error("Lỗi xóa địa chỉ:", err);
            });
    };

    return (
        <div >
            <h5 className='text-center'>THÊM ĐỊA CHỈ</h5>
            <form className="card container p-4 mb-4" onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="city" className="form-label"><strong>Tỉnh/Thành phố*</strong></label>
                        <select
                            className="form-select"
                            name="city"
                            id="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn Tỉnh/Thành phố của bạn</option>
                            {cityList.map(city => (
                                <option key={city.code} value={city.code}>{city.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="district" className="form-label"><strong>Quận/Huyện*</strong></label>
                        <select
                            className="form-select"
                            name="district"
                            id="district"
                            value={form.district}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn Quận/Huyện của bạn</option>
                            {districtList.map(d => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="inputAddress" className="form-label"><strong>Địa chỉ*</strong></label>
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        id="inputAddress"
                        placeholder="Nhập địa chỉ của bạn VD: Số 20, ngõ 90"
                        value={form.address}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="text-center">
                    <button type="submit" className="btn btn-success me-2">Thêm địa chỉ</button>
                </div>
            </form>

            <div className='card container p-4'>
                <h5>📍 Danh sách địa chỉ của tôi</h5>
                {addressList.length === 0 && <p>Chưa có địa chỉ nào.</p>}
                <ul className="list-group">
                    {addressList.map(addr => (
                        <li
                            key={addr._id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                🏙 Thành phố: {getCityName(addr.thanhpho)}, 📍 Quận/Huyện: {getDistrictName(addr.thanhpho, addr.quan_huyen)}, 🏠 Địa chỉ: {addr.diachi}
                            </div>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteAddress(addr._id)}
                            >
                                Xóa
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserLocation;