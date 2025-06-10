import { Link } from "react-router-dom";
import navbarItems from '../../config/navbar';

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="container-fluid py-3">
                <nav>
                    <ul className="ps-0 m-0 list-unstyled">
                        {navbarItems.map((item, index) => (
                            <div key={index} >
                                <hr className="mt-2" />
                                {item.label && (
                                    <li
                                        className="px-2 py-2 fw-bold"
                                        style={{ cursor: "default" }}
                                    >
                                        {item.label}
                                        {item.badge && (
                                            <span className="badge bg-secondary ms-2">{item.badge}</span>
                                        )}
                                    </li>
                                )}

                                {item.children && (
                                    <ul className="ps-3 list-unstyled">
                                        {item.children.map((subItem, subIndex) => (
                                            <li
                                                key={subIndex}
                                                className="d-flex justify-content-between align-items-center px-2 py-1"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {subItem.link ? (
                                                    <Link to={subItem.link} className="text-decoration-none text-dark w-100 d-flex justify-content-between align-items-center">
                                                        <span>{subItem.label}</span>
                                                        {subItem.badge && (
                                                            <span className="badge bg-secondary ms-2">
                                                                {subItem.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <span>{subItem.label}</span>
                                                        {subItem.badge && (
                                                            <span className="badge bg-secondary ms-2">
                                                                {subItem.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {!item.children && item.link && (
                                    <li className="px-2 py-2">
                                        <Link to={item.link} className="text-decoration-none text-dark fw-bold">
                                            {item.label}
                                            {item.badge && (
                                                <span className="badge bg-secondary ms-2">{item.badge}</span>
                                            )}
                                        </Link>
                                    </li>
                                )}
                            </div>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
