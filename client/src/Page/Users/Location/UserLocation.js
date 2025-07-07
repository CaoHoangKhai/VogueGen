import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import diachiData from '../../../assets/data/vietnam_administrative_data.json';
import {
    getUserLocations,
    addUserLocation,
    deleteUserLocation
} from '../../../api/User/user.api';

const UserLocation = () => {
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

    // ===== Helper =====
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

    // ===== Load danh sách tỉnh thành =====
    useEffect(() => {
        const cities = diachiData.map(city => ({
            code: city.Id,
            name: city.Name
        }));
        setCityList(cities);
    }, []);

    // ===== Load danh sách quận huyện khi chọn tỉnh =====
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

    // ===== Lấy danh sách địa chỉ của người dùng =====
    useEffect(() => {
        const fetchData = async () => {
            if (!manguoidung) return;

            try {
                const res = await getUserLocations(manguoidung);
                setAddressList(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('❌ Lỗi lấy danh sách địa chỉ:', err);
            }
        };
        fetchData();
    }, [manguoidung]);

    // ===== Xử lý thay đổi input =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === "city" && { district: '' }) // reset district nếu đổi city
        }));
    };

    // ===== Thêm địa chỉ =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            manguoidung,
            thanhpho: form.city,
            quan_huyen: form.district,
            diachi: form.address
        };

        try {
            const res = await addUserLocation(payload);
            alert(res.data?.message || "✅ Thêm địa chỉ thành công");
            setForm({ city: '', district: '', address: '' });

            // Làm mới danh sách
            const refresh = await getUserLocations(manguoidung);
            setAddressList(Array.isArray(refresh.data) ? refresh.data : []);
        } catch (err) {
            alert(err.response?.data?.message || "❌ Lỗi thêm địa chỉ");
            console.error('Lỗi khi thêm địa chỉ:', err);
        }
    };

    // ===== Xóa địa chỉ =====
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) return;

        try {
            const res = await deleteUserLocation(id);
            alert(res.data?.message || "✅ Xóa thành công");

            // Làm mới danh sách
            const refresh = await getUserLocations(manguoidung);
            setAddressList(Array.isArray(refresh.data) ? refresh.data : []);
        } catch (err) {
            alert(err.response?.data?.message || "❌ Xóa thất bại");
            console.error('Lỗi khi xóa địa chỉ:', err);
        }
    };

    return (
        <div className="px-3 mt-2">
            <h3 className='text-center mb-4'>Địa chỉ của người dùng</h3>
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
                            <option value="">Chọn Tỉnh/Thành phố</option>
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
                            <option value="">Chọn Quận/Huyện</option>
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
                        placeholder="VD: Số 20, ngõ 90..."
                        value={form.address}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="text-center">
                    <button type="submit" className="btn btn-success">Thêm địa chỉ</button>
                </div>
            </form>

            <div className="card container p-4">
                <h5>📍 Danh sách địa chỉ của tôi</h5>
                {addressList.length === 0 ? (
                    <p className="text-center">Bạn chưa có địa chỉ nào.</p>
                ) : (
                    <ul className="list-group">
                        {addressList.map(addr => (
                            <li
                                key={addr._id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    🏙 {getCityName(addr.thanhpho)}, 📍 {getDistrictName(addr.thanhpho, addr.quan_huyen)}, 🏠 {addr.diachi}
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
                )}
            </div>
        </div>
    );
};

export default UserLocation;
