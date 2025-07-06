import { Link, useLocation } from "react-router-dom";

// Capitalize tất cả từ trong slug: t-shirts => T Shirts
const capitalize = (str) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav
      style={{ "--bs-breadcrumb-divider": "'>'" }}
      aria-label="breadcrumb"
      className="my-3"
    >
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/" className="text-decoration-none text-dark">
            Home
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <li
              className="breadcrumb-item active"
              key={index}
              aria-current="page"
            >
              {capitalize(name)}
            </li>
          ) : (
            <li className="breadcrumb-item" key={index}>
              <Link to={routeTo} className="text-decoration-none text-dark">
                {capitalize(name)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
