import { FaTshirt, FaTruck, FaTags, FaDollarSign, FaFacebook, FaInstagram, FaTwitter} from "react-icons/fa";

const Footer = () => {
    return (
        <div className="footer mt-5 py-4 bg-light">
            <div className="container">

                {/* Hàng 1 - 4 Cột */}
                <div className="row text-center justify-content-between mb-4">
                    <div className="col-md-3 col-sm-6 mb-3 d-flex align-items-center justify-content-center gap-2">
                        <FaTshirt className="footer-icon" />
                        <span>Everyday Fresh Products</span>
                    </div>

                    <div className="col-md-3 col-sm-6 mb-3 d-flex align-items-center justify-content-center gap-2">
                        <FaTruck className="footer-icon" />
                        <span>Free Delivery for Order over $70</span>
                    </div>

                    <div className="col-md-3 col-sm-6 mb-3 d-flex align-items-center justify-content-center gap-2">
                        <FaTags className="footer-icon" />
                        <span>Daily Mega Discounts</span>
                    </div>

                    <div className="col-md-3 col-sm-6 mb-3 d-flex align-items-center justify-content-center gap-2">
                        <FaDollarSign className="footer-icon" />
                        <span>Best Price on the Market</span>
                    </div>
                </div>

                <hr />

                {/* Hàng 2 - 5 Cột */}
                <div className="row text-center justify-content-between">

                    <div className="col-md-2 col-sm-6 mb-3">
                        <h5 className="mb-3">FRUIT & VEGETABLES</h5>
                        <ul className="list-unstyled text-start">
                            <li>Fresh Vegetables</li>
                            <li>Herbs & Seasonings</li>
                            <li>Fresh Fruits</li>
                            <li>Cuts & Sprouts</li>
                            <li>Exotic Fruits & Veggies</li>
                            <li>Packaged Produce</li>
                            <li>Party Trays</li>
                        </ul>
                    </div>

                    <div className="col-md-2 col-sm-6 mb-3">
                        <h5 className="mb-3">BREAKFAST & DAIRY</h5>
                        <ul className="list-unstyled text-start">
                            <li>Fresh Vegetables</li>
                            <li>Herbs & Seasonings</li>
                            <li>Fresh Fruits</li>
                            <li>Cuts & Sprouts</li>
                            <li>Exotic Fruits & Veggies</li>
                            <li>Packaged Produce</li>
                            <li>Party Trays</li>
                        </ul>
                    </div>

                    <div className="col-md-2 col-sm-6 mb-3">
                        <h5 className="mb-3">MEAT & SEAFOOD</h5>
                        <ul className="list-unstyled text-start">
                            <li>Fresh Vegetables</li>
                            <li>Herbs & Seasonings</li>
                            <li>Fresh Fruits</li>
                            <li>Cuts & Sprouts</li>
                            <li>Exotic Fruits & Veggies</li>
                            <li>Packaged Produce</li>
                            <li>Party Trays</li>
                        </ul>
                    </div>

                    <div className="col-md-2 col-sm-6 mb-3">
                        <h5 className="mb-3">BEVERAGES</h5>
                        <ul className="list-unstyled text-start">
                            <li>Fresh Vegetables</li>
                            <li>Herbs & Seasonings</li>
                            <li>Fresh Fruits</li>
                            <li>Cuts & Sprouts</li>
                            <li>Exotic Fruits & Veggies</li>
                            <li>Packaged Produce</li>
                            <li>Party Trays</li>
                        </ul>
                    </div>

                    <div className="col-md-2 col-sm-6 mb-3">
                        <h5 className="mb-3">BREADS & BAKERY</h5>
                        <ul className="list-unstyled text-start">
                            <li>Fresh Vegetables</li>
                            <li>Herbs & Seasonings</li>
                            <li>Fresh Fruits</li>
                            <li>Cuts & Sprouts</li>
                            <li>Exotic Fruits & Veggies</li>
                            <li>Packaged Produce</li>
                            <li>Party Trays</li>
                        </ul>
                    </div>

                </div>
            </div>

            <div className="container text-center">
                <div className="row">
                    <div className="col">
                        Copyright 2024. All rights reserved
                    </div>
                    <div className="col d-flex justify-content-center gap-4">
                        {/* Các icon mạng xã hội */}
                        <FaFacebook className="footer-icon" />
                        <FaInstagram className="footer-icon" />
                        <FaTwitter className="footer-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
