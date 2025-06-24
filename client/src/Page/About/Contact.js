import { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        message: "",
        attachment: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Customer Support</h1>

            <div className="row">
                {/* Thông tin liên hệ */}
                <div className="col-md-6 mb-4">
                    <div className="mb-3 p-4 bg-light border rounded shadow-sm">
                        <h5>Contact Info</h5>
                        <p className="mb-1">📧 support@example.com</p>
                        <p>📞 +84 123 456 789</p>
                    </div>

                    <div className="p-4 bg-light border rounded shadow-sm">
                        <h5>Working Hours</h5>
                        <p className="mb-1">🕘 Mon - Fri: 9AM - 5PM</p>
                        <p>🕘 Sat: 9AM - 12PM</p>
                    </div>
                </div>

                {/* Form liên hệ */}
                <div className="col-md-6">
                    <div className="bg-light border rounded p-4 shadow">
                        <h4 className="mb-4 text-center">Contact Us</h4>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="fullName" className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ tên"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập Email"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea
                                    className="form-control"
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nhập ghi chú"
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <h6 className="mb-3 text-dark">Tải ảnh lên</h6>
                                <label
                                    htmlFor="attachment"
                                    className="d-flex flex-column align-items-center justify-content-center text-center"
                                    style={{
                                        cursor: "pointer",
                                        minHeight: "120px",
                                        border: "2px dashed #6c757d",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        backgroundColor: "#2c2f38",
                                        color: "#adb5bd"
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.backgroundColor = "#3b404b";
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.backgroundColor = "#2c2f38";
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) handleChange({ target: { name: "attachment", files: [file] } });
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#0d6efd" className="mb-3">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13zM12 13v4m0 0l2-2m-2 2l-2-2" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>

                                    <span>
                                        <h5>Click để tải ảnh</h5>
                                        <p>PNG, JPG, JPEG</p>
                                    </span>
                                </label>
                                <input
                                    id="attachment"
                                    name="attachment"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="d-none"
                                />
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-100">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
