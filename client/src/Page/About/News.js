import React from 'react';

const fashionNews = [
    {
        id: 1,
        title: "Xu hướng màu pastel Hè 2025",
        summary: "Tone pastel nhẹ nhàng đang làm mưa làm gió trên sàn diễn mùa này.",
        image: "https://picsum.photos/id/1011/400/300"
    },
    {
        id: 2,
        title: "Mix đồ công sở cá tính",
        summary: "Phong cách smart-casual giúp bạn nổi bật nơi làm việc.",
        image: "https://picsum.photos/id/1018/400/300"
    },
    {
        id: 3,
        title: "Gợi ý phối đồ dạo phố",
        summary: "Năng động, thoải mái và vẫn rất sành điệu với outfit thường ngày.",
        image: "https://picsum.photos/id/1027/400/300"
    },
    {
        id: 4,
        title: "Top 5 mẫu váy hot nhất hè này",
        summary: "Những thiết kế bay bổng, nữ tính đang trở lại mạnh mẽ.",
        image: "https://picsum.photos/id/1049/400/300"
    },
    {
        id: 5,
        title: "Phụ kiện nổi bật 2025",
        summary: "Nón, túi và giày là điểm nhấn hoàn hảo cho outfit.",
        image: "https://picsum.photos/id/1035/400/300"
    },
    {
        id: 6,
        title: "Trang phục bền vững",
        summary: "Xu hướng thời trang thân thiện với môi trường lên ngôi.",
        image: "https://picsum.photos/id/1052/400/300"
    },
    {
        id: 7,
        title: "Chất liệu mỏng nhẹ lên ngôi",
        summary: "Vải voan, linen và cotton chiếm sóng mùa nóng.",
        image: "https://picsum.photos/id/1062/400/300"
    },
    {
        id: 8,
        title: "Trang điểm tối giản & thời trang",
        summary: "Makeup đơn giản đang là lựa chọn hàng đầu cho các tín đồ fashion.",
        image: "https://picsum.photos/id/1080/400/300"
    }
];

const News = () => {
    return (
        <div className="container">
            <h2 className="text-center mb-5 fw-bold">Tin Tức Thời Trang</h2>
            <div className="row">
                {fashionNews.map((news) => (
                    <div className="col-md-3 mb-4" key={news.id}>
                        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                            <img
                                src={news.image}
                                alt={news.title}
                                className="card-img-top"
                                style={{ height: 180, objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h6 className="card-title fw-bold">{news.title}</h6>
                                <p className="card-text text-muted small">{news.summary}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default News;
