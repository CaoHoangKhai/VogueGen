import { useParams } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams(); // Lấy id từ URL

    return (
        <div>
            <p>Product ID: {id}</p>
        </div>
    );
};

export default ProductDetail;
