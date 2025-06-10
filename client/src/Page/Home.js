// Import các thư viện cần thiết
import { useState } from "react";
import { FaCheckCircle, FaUserFriends, FaRegMoneyBillAlt, FaBoxOpen, FaTags, FaStore, FaTruck } from "react-icons/fa";
import Button from "@mui/material/Button";
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from "react";

// Danh sách ảnh cho carousel sản phẩm nổi bật
const images = [
    { src: "http://localhost:4000/images/home/body_1.png" },
    { src: "http://localhost:4000/images/home/body_2.png" },
    { src: "http://localhost:4000/images/home/body_3.png" },
    { src: "http://localhost:4000/images/home/body_4.png" },
    { src: "http://localhost:4000/images/home/body_5.png" }
];

// Danh sách các bước "How it works" với ảnh, tiêu đề và mô tả
const howItWorksImages = [
    {
        step: "Connect Your Store",
        src: "http://localhost:4000/images/home/how_it_work_1.png",
        description: "Easy to connect your online store with our integration tools. Seamlessly link your shop and get started in minutes."
    },
    {
        step: "Design And Publish",
        src: "http://localhost:4000/images/home/how_it_work_2.png",
        description: "Create your own products using our simple design tools and add them to your store."
    },
    {
        step: "Sell Your Products",
        src: "http://localhost:4000/images/home/how_it_work_3.png",
        description: "Start selling your designs and let us handle the orders. Focus on your creativity while we manage the rest."
    },
    {
        step: "Fulfilled By Shopify",
        src: "http://localhost:4000/images/home/how_it_work_4.png",
        description: "We take care of the order fulfillment and shipping so you can concentrate on growing your business."
    }
];

// Hàm tạo các slide kiểu nối đuôi (mỗi slide 4 ảnh, trượt 1 ảnh mỗi lần)
const getSlides = (arr, size) => {
    const slides = [];
    for (let i = 0; i < arr.length; i++) {
        const group = [];
        for (let j = 0; j < size; j++) {
            group.push(arr[(i + j) % arr.length]);
        }
        slides.push(group);
    }
    return slides;
};

// Banner Section: Phần banner đầu trang với thông tin chào mừng và nút chuyển đến trang sản phẩm
function BannerSection() {
    return (
        <div className="container">
            <div className="row align-items-center" style={{ minHeight: "50vh" }}>
                {/* Bên trái: Nội dung */}
                <div className="col-md-6 mb-4 mb-md-0">
                    <h1 className="mt-2 mb-4" style={{ color: "#C2185B" }}>
                        <strong>Welcome to Shopify</strong>
                    </h1>
                    <h3 style={{ color: "#7B1FA2" }}>Your One-Stop Print-on-Demand</h3>
                    <h3 style={{ color: "#512DA8" }}>and Dropshipping Platform</h3>
                    <ul className="mt-4 list list-unstyled" style={{ fontSize: "1.1rem" }}>
                        {/* Các lợi ích nổi bật */}
                        <li><FaCheckCircle style={{ color: "#43A047" }} className="me-2" />No Minimum Order</li>
                        <li><FaUserFriends style={{ color: "#3949AB" }} className="me-2" />One-on-One Services</li>
                        <li><FaRegMoneyBillAlt style={{ color: "#FBC02D" }} className="me-2" />100% Free to use</li>
                        <li><FaBoxOpen style={{ color: "#00ACC1" }} className="me-2" />1000+ Products Available</li>
                        <li><FaTags style={{ color: "#E91E63" }} className="me-2" />Best Price Guarantee</li>
                    </ul>
                    {/* Nút chuyển đến trang sản phẩm */}
                    <Link to="/products" style={{ textDecoration: "none" }}>
                        <Button
                            variant="contained"
                            style={{
                                background: "linear-gradient(90deg, #C2185B 0%, #7B1FA2 100%)",
                                color: "#fff",
                                marginTop: 16,
                                fontWeight: 600,
                                letterSpacing: 1
                            }}
                            size="large"
                            fullWidth
                        >
                            Explore Products
                        </Button>
                    </Link>
                </div>
                {/* Bên phải: Hình ảnh minh họa */}
                <div className="col-md-6 d-flex justify-content-center">
                    <img
                        src="http://localhost:4000/images/home/download.png"
                        alt="Shopify"
                        style={{ maxWidth: "80%", height: "auto", borderRadius: 16, boxShadow: "0 4px 24px #e1bee7" }}
                    />
                </div>
            </div>
        </div>
    );
}

// Shipping Info Section: Thông tin số lượng đơn hàng đã giao
function ShippingInfoSection() {
    return (
        <div
            className="container card shadow-sm border-0 my-4"
            style={{
                background: "linear-gradient(90deg, #fff 0%, #7fdbff 100%)",
                color: "#00695c",
                borderRadius: 16,
                padding: "20px 0",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "1.2rem",
                letterSpacing: 1,
                border: "2px solid #222",
                boxShadow: "0 4px 24px #b2dfdb"
            }}
        >
            <p className="mb-0">
                🚚 Over <span style={{ color: "#0097a7", fontWeight: 700, fontSize: "1.5rem" }}>1.5 million</span> items shipped every month
            </p>
        </div>
    );
}

// Carousel Section: Carousel hiển thị các sản phẩm nổi bật
function CarouselSection({ images }) {
    const [index, setIndex] = useState(0);
    const slides = getSlides(images, 4);

    return (
        <div className="my-4">
            <div className="d-flex align-items-center mb-2">
                <div style={{ flex: 1, padding: "0 16px" }}>
                    <Carousel
                        activeIndex={index}
                        onSelect={selectedIndex => setIndex(selectedIndex)}
                        controls={false}
                        indicators={false}
                        interval={2500}
                        slide={true}
                    >
                        {slides.map((group, idx) => (
                            <Carousel.Item key={idx}>
                                <div className="row g-3">
                                    {group.map((img, i) => (
                                        <div className="col-12 col-sm-6 col-md-3" key={i}>
                                            <div
                                                className="card h-100 border-0 shadow"
                                                style={{
                                                    borderRadius: 20,
                                                    overflow: "hidden",
                                                    background: "#fff",
                                                    boxShadow: "0 4px 16px #e1bee7"
                                                }}
                                            >
                                                <img
                                                    src={img.src}
                                                    alt=""
                                                    className="card-img-top"
                                                    style={{
                                                        borderRadius: 20,
                                                        maxHeight: 220,
                                                        objectFit: "cover",
                                                        transition: "transform 0.3s",
                                                    }}
                                                    onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                                    onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </div>
        </div>
    );
}

// How it works Section (3 icon blocks): Hiển thị 3 bước chính với icon minh họa
function HowItWorksIconSection() {
    return (
        <div className="container my-5 text-center">
            <h1>
                <strong style={{ color: "#7B1FA2", fontSize: "5rem", lineHeight: 1.2 }}>
                    How it works
                </strong>
            </h1>
            <div className="row align-items-stretch justify-content-center">
                {/* Khối 1 */}
                <div className="col-12 col-md-4 mb-4 mb-md-0 d-flex">
                    <div className="d-flex flex-column align-items-center w-100 h-100">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #7B1FA2 0%, #C2185B 100%)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 70,
                                height: 70,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                                marginBottom: 12,
                                boxShadow: "0 2px 8px #e1bee7",
                                zIndex: 2
                            }}
                        >
                            <FaStore />
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: 3,
                                background: "linear-gradient(90deg, #C2185B 0%, #7B1FA2 100%)",
                                margin: "-36px 0 36px 0",
                                zIndex: 1
                            }}
                        />
                        <p style={{ color: "#444" }}>Khám phá kho sản phẩm đa dạng và chọn mặt hàng bạn muốn kinh doanh.</p>
                    </div>
                </div>
                {/* Khối 2 */}
                <div className="col-12 col-md-4 mb-4 mb-md-0 d-flex">
                    <div className="d-flex flex-column align-items-center w-100 h-100">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #3949AB 0%, #00ACC1 100%)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 70,
                                height: 70,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                                marginBottom: 12,
                                boxShadow: "0 2px 8px #b2dfdb",
                                zIndex: 2
                            }}
                        >
                            <FaTruck />
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: 3,
                                background: "linear-gradient(90deg, #00ACC1 0%, #3949AB 100%)",
                                margin: "-36px 0 36px 0",
                                zIndex: 1
                            }}
                        />
                        <p style={{ color: "#444" }}>Thiết kế theo ý tưởng riêng và đăng bán sản phẩm lên cửa hàng của bạn.</p>
                    </div>
                </div>
                {/* Khối 3 */}
                <div className="col-12 col-md-4 d-flex">
                    <div className="d-flex flex-column align-items-center w-100 h-100">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #43A047 0%, #FBC02D 100%)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 70,
                                height: 70,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                                marginBottom: 12,
                                boxShadow: "0 2px 8px #b2dfdb",
                                zIndex: 2
                            }}
                        >
                            <FaRegMoneyBillAlt />
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: 3,
                                background: "linear-gradient(90deg, #43A047 0%, #FBC02D 100%)",
                                margin: "-36px 0 36px 0",
                                zIndex: 1
                            }}
                        />
                        <p style={{ color: "#444" }}>Chúng tôi sản xuất, đóng gói và giao hàng tận nơi cho khách hàng của bạn.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// HowItWorksCarouselScrollspy: Phần scrollspy các bước với hình ảnh và mô tả, có border cho cả khung, ảnh và mô tả
function HowItWorksCarouselScrollspy() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleStepClick = idx => {
        setActiveIndex(idx);
    };

    return (
        <div className="container my-5 mb-4" style={{ overflowX: "hidden" }}>
            <div className="row g-0">
                {/* Scrollspy Steps: Danh sách các bước bên trái */}
                <div
                    className="col-12 col-md-4 d-flex flex-column justify-content-center align-items-stretch"
                    style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        minWidth: 0,
                        boxSizing: "border-box"
                    }}
                >
                    <nav
                        className="nav nav-pills flex-column h-100 justify-content-center"
                        style={{
                            height: "100%",
                            alignItems: "stretch"
                        }}
                    >
                        {howItWorksImages.map((img, idx) => (
                            <button
                                key={idx}
                                className={`nav-link text-center mb-2${activeIndex === idx ? " active" : ""}`}
                                style={{
                                    fontWeight: 600,
                                    fontSize: "1.1rem",
                                    borderRadius: 8,
                                    color: "#512DA8",
                                    background: activeIndex === idx ? "#d1c4e9" : "#f3e5f5",
                                    border: "none",
                                    marginBottom: 8,
                                    width: "100%",
                                    textAlign: "left"
                                }}
                                onClick={() => handleStepClick(idx)}
                            >
                                {howItWorksImages[idx].step}
                            </button>
                        ))}
                    </nav>
                </div>
                {/* Carousel: Hiển thị ảnh và mô tả từng bước bên phải */}
                <div className="col-12 col-md-8 d-flex justify-content-center align-items-center mb-4"
                    style={{
                        paddingLeft: 0,
                        minWidth: 0,
                        boxSizing: "border-box"
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            boxShadow: "0 4px 16px #e1bee7",
                            width: "80%",
                            padding: 24,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minWidth: 0,
                            boxSizing: "border-box"
                        }}
                    >
                        <Carousel
                            activeIndex={activeIndex}
                            onSelect={setActiveIndex}
                            indicators={true}
                            controls={true}
                            interval={null}
                            fade={false}
                            slide={true}
                            className="shadow w-100"
                        >
                            {howItWorksImages.map((img, idx) => (
                                <Carousel.Item key={idx}>
                                    {/* Khung ngoài có border */}
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            background: "#fff",
                                            borderRadius: 20,
                                            boxShadow: "0 4px 16px #e1bee7",
                                            border: "2px solid #7B1FA2", // border cho khung ngoài
                                            padding: 12
                                        }}
                                    >
                                        {/* Ảnh cũng có border riêng */}
                                        <img
                                            src={img.src}
                                            className="d-block"
                                            alt={`How it works ${idx + 1}`}
                                            style={{
                                                borderRadius: 16,
                                                width: "100%",
                                                maxWidth: 400,
                                                height: "auto",
                                                objectFit: "contain",
                                                margin: "0 auto",
                                                border: "2px solid #FBC02D" // border cho ảnh bên trong
                                            }}
                                        />
                                    </div>
                                    {/* Mô tả nằm ngoài hình, có border riêng */}
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: 12,
                                            border: "2px solid #7B1FA2",
                                            borderRadius: 12,
                                            padding: "10px 0",
                                            background: "#fff",
                                            boxShadow: "0 2px 8px #ede7f6"
                                        }}
                                    >
                                        <h5 style={{ color: "#7B1FA2", fontWeight: 700, textShadow: "0 2px 8px #ede7f6", margin: 0 }}>
                                            {howItWorksImages[idx].description}
                                        </h5>
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WhyChooseSection() {
    // Hàm render lục giác với icon ở giữa
    const HexagonIcon = ({ children, bg = "#fff", border = "#7B1FA2" }) => (
        <div
            style={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                background: bg,
                clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
                border: `3px solid ${border}`,
                boxShadow: "0 2px 8px #e1bee7"
            }}
        >
            {children}
        </div>
    );

    return (
        <div className="container my-4">
            <h1 className="text-center" style={{ color: "#7B1FA2", fontSize: "5rem", lineHeight: 1.2 }}>Why Choose SHOPIFY?</h1>
            <p className="text-center" style={{ color: "#555" }}>
                We provide the best services to help you grow your business.
            </p>
            {/* 6 khối: 3 trên, 3 dưới */}
            <div className="row g-4 mt-4">
                {/* Hàng trên */}
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#e8f5e9" border="#43A047">
                            <FaCheckCircle size={40} style={{ color: "#43A047" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>100% Free Platform</h5>
                        <p style={{ color: "#555" }}>
                            PrintDoors is 100% free to use with no hidden fees, monthly fees, or setup fees.
                        </p>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#fce4ec" border="#E91E63">
                            <FaTags size={40} style={{ color: "#E91E63" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>Intuitive Design Tool</h5>
                        <p style={{ color: "#555" }}>
                            The super simple design tool allows you to create a design with our built-in maker tool, whether you have design experience or not.
                        </p>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#e3f2fd" border="#00ACC1">
                            <FaBoxOpen size={40} style={{ color: "#00ACC1" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>Reliable Quality</h5>
                        <p style={{ color: "#555" }}>
                            Make a lasting impression with our industry-leading technology, quality inks, and premium materials.
                        </p>
                    </div>
                </div>
                {/* Hàng dưới */}
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#fffde7" border="#FBC02D">
                            <FaRegMoneyBillAlt size={40} style={{ color: "#FBC02D" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>No Minimum Order</h5>
                        <p style={{ color: "#555" }}>
                            Enjoy the freedom to experiment with your store concept and products without worrying about minimum order requirements.
                        </p>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#e3e6fd" border="#3949AB">
                            <FaTruck size={40} style={{ color: "#3949AB" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>Fast Fulfillment</h5>
                        <p style={{ color: "#555" }}>
                            Design your personalized printing anytime and anywhere, and get your products fast with our fast fulfillment.
                        </p>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="bg-light p-4 h-100 shadow rounded text-center">
                        <HexagonIcon bg="#f3e5f5" border="#C2185B">
                            <FaStore size={40} style={{ color: "#C2185B" }} />
                        </HexagonIcon>
                        <h5 className="mt-2" style={{ color: "#7B1FA2", fontWeight: 700 }}>More than 9 technologies</h5>
                        <p style={{ color: "#555" }}>
                            Offer more than 9 cutting-edge technologies for the most professional manufacturing and printing services for your customized products.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Design() {

    const designBlocks = [
        {
            img: "http://localhost:4000/images/designs/men_wear.png",
            label: "Men's Wear"
        },
        {
            img: "http://localhost:4000/images/designs/accessories.png",
            label: "Accesories"
        },
        {
            img: "http://localhost:4000/images/designs/cup.png",
            label: "Cup"
        },
        {
            img: "http://localhost:4000/images/designs/phone_case.png",
            label: "Phone Case"
        },
    ];

    return (
        <div className="container my-5 py-5 bg-light rounded shadow text-center">
            <h2 style={{ color: "#7B1FA2", fontWeight: 700, fontSize: "2.5rem" }}>Design Your Product</h2>
            <p style={{ color: "#555", fontSize: "1.5rem", marginTop: 16 }}>
                <strong>Unleash Your Inner Designer</strong> and <br />
                <span style={{ color: "#C2185B" }}>Turn Your Ideas into Profit with PrintDoors</span>
            </p>

            <div className="row g-4 mt-4">
                {designBlocks.map((block, idx) => (
                    <div className="col-12 col-md-3" key={idx}>
                        <div className="bg-white h-100 shadow rounded overflow-hidden d-flex flex-column">
                            {/* Hình ảnh full khối */}
                            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
                                <img
                                    src={block.img}
                                    alt={block.label}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                            </div>
                            {/* Tên phía dưới khối */}
                            <div style={{ fontWeight: 600, color: "#7B1FA2", fontSize: 16, padding: 16 }}>
                                {block.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Nút Show more */}
            <div className="mt-5">
                <a
                    href="/products"
                    className="btn btn-primary"
                    style={{
                        background: "linear-gradient(90deg, #C2185B 0%, #7B1FA2 100%)",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        padding: "10px 32px"
                    }}
                >
                    Show more
                </a>
            </div>
        </div>
    );
}

// Component Home: Kết hợp tất cả các section lại thành trang chủ
const Home = () => {
    return (
        <>
            <BannerSection />
            <ShippingInfoSection />
            <CarouselSection images={images} />
            <HowItWorksIconSection />
            <HowItWorksCarouselScrollspy />
            <Design />
            <WhyChooseSection />

        </>
    );
};

export default Home;