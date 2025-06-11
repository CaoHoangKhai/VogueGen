import { Link, useLocation } from 'react-router-dom';
import { FaPalette, FaImage, FaFont } from "react-icons/fa";

const menu = [
    {
        label: "Color",
        path: "/design/color",
       
        icon: <FaPalette />
    },
    {
        label: "Img",
        path: "/design/img",
        icon: <FaImage />
    },
    {
        label: "Text",
        path: "/design/text",
        icon: <FaFont />
    }
];

const SidebarDesign = () => {
    const location = useLocation();

    return (
        <div
            style={{
                width: 100, // tăng chiều rộng
                background: "#23272f",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 32, // tăng padding top
                zIndex: 1000,
                boxShadow: "2px 0 12px rgba(0,0,0,0.12)" // đậm hơn chút
            }}
        >
            {menu.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 72, // tăng chiều rộng nút
                            height: 72, // tăng chiều cao nút
                            marginBottom: 20, // tăng khoảng cách giữa các nút
                            borderRadius: 14,
                            background: isActive ? "#383e4a" : "transparent",
                            color: isActive ? item.color : "#fff",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 15,
                            transition: "all 0.2s"
                        }}
                        title={item.label}
                    >
                        <span style={{
                            fontSize: 32, // tăng size icon
                            marginBottom: 8,
                            color: isActive ? item.color : "#fff",
                            transition: "color 0.2s"
                        }}>
                            {item.icon}
                        </span>
                        <span style={{ fontSize: 13 }}>{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
};

export default SidebarDesign;