const navbar = [

    // ⛔️ Kiểm tra nếu có thêm mục giống bên dưới thì xóa:
    { label: "Tất cả sản phẩm", children: [""] },

    {
        label: "Khuyến mãi",
        children: [
            { label: "Bán chạy", badge: "HOT", link: "/products/best-sellers" },
            { label: "Hàng mới về", badge: "NEW", link: "/products/new-arrivals" },
            { label: "Ưu đãi đặc biệt", badge: "SALE", link: "/products/special-offer" },
            { label: "Giao hàng nhanh", badge: "FAST", link: "/products/fast-fulfillment" },
            { label: "Sản xuất tại VN", badge: "VN", link: "/products/made-in-vn" }
        ]
    },

    {
        label: "Danh mục",
        children: [
            { label: "Quần Áo", link: "/products/quan-ao" },
            { label: "Giày Dép", link: "/products/giay-dep" },
            { label: "Phụ Kiện Thời Trang", link: "/products/phu-kien" },
            { label: "Túi Xách", link: "/products/tui-xach" },
            { label: "Đồ Lót & Đồ Ngủ", link: "/products/do-lot-do-ngu" },
            { label: "Trang Phục Thể Thao", link: "/products/trang-phuc-the-thao" }
        ]
    },

    {
        label: "Khác",
        children: [
            { label: "Cốc", link: "/products/cup" },
            { label: "Ốp điện thoại", link: "/products/phone-case" },
            { label: "Phụ kiện khác", link: "/products/accessories" }
        ]
    }
];

export default navbar;
