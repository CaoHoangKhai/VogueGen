const { ObjectId } = require("mongodb");

function toSlug(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}

class DesignService {
    constructor(client) {
        this.design = client.db().collection("designs");
        this.theloaisanpham = client.db().collection("theloaisanpham");
        this.nguoidung = client.db().collection("nguoidung");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
        this.thietkecuanguoidung = client.db().collection("thietkecuanguoidung");
        this.mausanpham = client.db().collection("mausanpham");
        this.sanpham = client.db().collection("sanpham");
    }

    async createDesign({ manguoidung, masanpham, mausac }) {
        // 🛡️ Kiểm tra input
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");
        if (!ObjectId.isValid(masanpham)) throw new Error("ID sản phẩm không hợp lệ.");
        if (!mausac || typeof mausac !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(mausac.trim())) {
            throw new Error("Màu sắc không hợp lệ. Định dạng phải là mã hex ví dụ: #FF0000");
        }

        const userId = new ObjectId(manguoidung);
        const productId = new ObjectId(masanpham);
        const mau = mausac.trim();

        console.log("🟡 [CREATE DESIGN] User:", userId.toString());
        console.log("🟡 [CREATE DESIGN] Product:", productId.toString());
        console.log("🟡 [CREATE DESIGN] Color:", mau);

        // 📌 Kiểm tra người dùng
        const user = await this.nguoidung.findOne({ _id: userId });
        if (!user) {
            return { success: false, message: "Vui lòng đăng ký để sử dụng tính năng thiết kế." };
        }

        // 📦 Lấy sản phẩm
        const product = await this.sanpham.findOne({ _id: productId });
        if (!product) {
            return { success: false, message: "Không tìm thấy sản phẩm để thiết kế." };
        }

        // 📚 Lấy slug từ thể loại sản phẩm
        let categoryId = null;
        if (ObjectId.isValid(product.theloai)) {
            categoryId = new ObjectId(product.theloai);
        } else {
            return { success: false, message: "ID thể loại trong sản phẩm không hợp lệ." };
        }

        const category = await this.theloaisanpham.findOne({ _id: categoryId });
        if (!category || !category.slug) {
            return { success: false, message: "Không tìm thấy danh mục sản phẩm." };
        }

        const slug = category.slug;

        // ✅ Tạo bản thiết kế
        const tempResult = await this.design.insertOne({
            manguoidung: userId,
            masanpham: productId,
            mau,
            ngaytao: new Date()
        });

        const insertedId = tempResult.insertedId;
        const ten = `Thiết kế ${insertedId.toString()}`;
        const link = `${slug}/${insertedId.toString()}`;

        // 📝 Cập nhật tên & link cho thiết kế
        await this.design.updateOne({ _id: insertedId }, { $set: { ten, link } });

        // 🧩 Tạo thiết kế người dùng cho 2 mặt (front, back)
        const inserts = ["front", "back"].map(vitri => ({
            madesign: insertedId,
            masanpham: productId,
            vitri,
            mau,
            overlays: [],
            createdAt: new Date()
        }));

        await this.thietkecuanguoidung.insertMany(inserts);

        console.log("🟢 [CREATE DESIGN] Thiết kế và overlay đã được khởi tạo.");

        // 📤 Trả kết quả
        return {
            success: true,
            message: "Khởi tạo thiết kế thành công.",
            id: insertedId,
            link // ví dụ: "t-shirts/6868d5107b3ea89efb7ecf98"
        };
    }
    
    async getDesignsByUser(manguoidung) {
        try {
            if (!ObjectId.isValid(manguoidung)) {
                throw new Error("ID người dùng không hợp lệ.");
            }

            if (!this.design) {
                throw new Error("Collection 'design' chưa được khởi tạo.");
            }

            const designs = await this.design
                .find(
                    { manguoidung: new ObjectId(manguoidung) },
                    {
                        projection: {
                            _id: 1,
                            manguoidung: 1,
                            theloai: 1,
                            ngaytao: 1,
                            link: 1,
                            ten: 1
                        }
                    }
                )
                .sort({ ngaytao: -1 }) // mới nhất lên trước
                .toArray();

            return designs;

        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách thiết kế đơn giản:", err.message);
            throw new Error("Lỗi server khi lấy danh sách thiết kế.");
        }
    }

    async getDesignDetail(designId) {
        const design = await this.design.findOne({ _id: designId });
        if (!design) {
            return { success: false, message: "Không tìm thấy thiết kế." };
        }

        const images = await this.thietkecuanguoidung.find({ madesign: designId }).toArray();

        return {
            success: true,
            message: "Lấy chi tiết thiết kế thành công.",
            design,
            images // chứa ảnh front, back, overlay v.v.
        };
    }

    async getColorFromDesign(designId) {
        try {
            const objectId = new ObjectId(designId);

            // 1. Lấy thông tin thiết kế
            const designDoc = await this.thietkecuanguoidung.findOne({ madesign: objectId });

            if (!designDoc || !designDoc.masanpham) {
                return {
                    success: false,
                    message: "Không tìm thấy thông tin sản phẩm từ thiết kế."
                };
            }

            const productId = designDoc.masanpham;
            const designColor = designDoc.mau;

            // 2. Lấy danh sách màu từ bảng mausanpham
            const colorDocs = await this.mausanpham
                .find({ masanpham: productId })
                .project({ mau: 1 })
                .toArray();

            if (!colorDocs || colorDocs.length === 0) {
                return {
                    success: false,
                    message: "Không tìm thấy màu nào cho sản phẩm này."
                };
            }

            const uniqueColors = [...new Set(colorDocs.map(doc => doc.mau))];

            const matchedColor = uniqueColors.includes(designColor) ? designColor : uniqueColors[0];

            return {
                success: true,
                color: matchedColor,
                colors: uniqueColors
            };
        } catch (error) {
            console.error("🔥 Lỗi getColorFromDesign:", error);
            return { success: false, message: "Lỗi server." };
        }
    }

    async deleteDesign(designId) {
        if (!ObjectId.isValid(designId)) {
            return { success: false, message: "ID không hợp lệ." };
        }

        const objectId = new ObjectId(designId);
        console.log("🗑️ Đang xóa thiết kế có ID:", objectId);

        // Xóa thiết kế chính
        const result = await this.design.deleteOne({ _id: objectId });
        console.log("✅ Kết quả xóa thiết kế:", result);

        // Xóa thiết kế người dùng liên quan (2 mặt)
        const relatedDelete = await this.thietkecuanguoidung.deleteMany({ madesign: objectId });
        console.log("🧹 Đã xóa thiết kế người dùng liên quan:", relatedDelete.deletedCount);

        return {
            success: result.deletedCount === 1,
            message: result.deletedCount === 1
                ? "Đã xóa thiết kế và dữ liệu liên quan."
                : "Không tìm thấy thiết kế để xóa."
        };
    }

    async renameDesign(designId, newTen) {
        if (!ObjectId.isValid(designId)) return { success: false, message: "ID không hợp lệ." };
        const result = await this.design.updateOne(
            { _id: new ObjectId(designId) },
            { $set: { ten: newTen } }
        );
        return {
            success: result.modifiedCount === 1,
            message: result.modifiedCount === 1 ? "Đã đổi tên thành công" : "Không tìm thấy thiết kế"
        };
    }

}

module.exports = DesignService;
