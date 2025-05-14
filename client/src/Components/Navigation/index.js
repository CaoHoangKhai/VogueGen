// src/Components/Navigation.js
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const Navigation = ({ paths = [] }) => {
    if (!Array.isArray(paths) || paths.length === 0) return null;

    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {paths.map((path, index) => (
                    <li
                        key={index}
                        className={`breadcrumb-item ${index === paths.length - 1 ? 'active' : ''}`}
                        aria-current={index === paths.length - 1 ? 'page' : undefined}
                    >
                        {index === paths.length - 1 ? (
                            path.name
                        ) : (
                            <Link to={path.link}>{path.name}</Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Navigation;
