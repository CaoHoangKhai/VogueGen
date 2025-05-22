import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import diachiData from '../../assets/data/vietnam_administrative_data.json';

const UserLocation = () => {
    const userId = '682eca37fbebecabe93b033a'; // có thể lấy từ localStorage hoặc context nếu cần

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
        // Load danh sách tỉnh/thành từ file JSON
        const cities = diachiData.map(city => ({
            code: city.Id,
            name: city.Name
        }));
        setCityList(cities);
    }, []);

    useEffect(() => {
        // Khi chọn thành phố, cập nhật quận/huyện tương ứng
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

    useEffect(() => {
        // Lấy danh sách địa chỉ của user từ API
        axios.get(`http://localhost:4000/user/location/list?userId=${userId}`)
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
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === "city" && { district: '' }) // Reset district nếu chọn lại city
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Chuẩn bị dữ liệu gửi lên server
        const payload = {
            userId,
            city: form.city,
            district: form.district,
            address: form.address
        };

        axios.post('http://localhost:4000/user/location/add', payload)
            .then(res => {
                alert('Thêm địa chỉ thành công');
                // Cập nhật lại danh sách địa chỉ sau khi thêm
                setAddressList(prev => [...prev, res.data]);
                // Reset form
                setForm({ city: '', district: '', address: '' });
            })
            .catch(err => {
                console.error('Lỗi thêm địa chỉ:', err);
                alert('Thêm địa chỉ thất bại');
            });
    };

    return (
        <div className="mt-4">
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
                        <li key={addr._id} className="list-group-item">
                            🏙 Thành phố: {getCityName(addr.thanhpho)},📍 Quận/Huyện: {getDistrictName(addr.thanhpho, addr.quan_huyen)}, 🏠 Địa chỉ: {addr.diachi}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default UserLocation;
