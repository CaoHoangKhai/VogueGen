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

        // ✅ Tạo bản thiết kế (THÊM gioitinh từ sản phẩm)
        const tempResult = await this.design.insertOne({
            manguoidung: userId,
            masanpham: productId,
            gioitinh: product.gioitinh || null,   // 👈 lấy từ sản phẩm
            mau,
            ngaytao: new Date(),
            trangthai: 1 // 1 là hiển thị, 0 là ẩn
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
                    {
                        manguoidung: new ObjectId(manguoidung),
                        trangthai: 1 // chỉ lấy thiết kế đang hoạt động
                    },
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
                .sort({ ngaytao: -1 })
                .toArray();

            return designs;

        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách thiết kế:", err.message);
            throw new Error("Lỗi server khi lấy danh sách thiết kế.");
        }
    }

    async getDesignDetail(designId) {
        const design = await this.design.findOne({ _id: designId });
        if (!design) {
            return { success: false, message: "Không tìm thấy thiết kế." };
        }

        const thietKeCu = await this.thietkecuanguoidung.find({ madesign: designId }).toArray();

        const overlays = thietKeCu.map(item => ({
            vitri: item.vitri,
            overlays: item.overlays || []
        }));

        return {
            success: true,
            message: "Lấy chi tiết thiết kế thành cônghehehe.",
            design,
            overlays // ✅ cấu trúc phù hợp với frontend
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
        console.log("👻 Đang ẩn thiết kế có ID:", objectId);

        // Cập nhật trạng thái thiết kế chính thành 0 (ẩn)
        const result = await this.design.updateOne(
            { _id: objectId },
            { $set: { trangthai: 0 } }
        );

        // Cập nhật trạng thái thiết kế người dùng liên quan
        const relatedUpdate = await this.thietkecuanguoidung.updateMany(
            { madesign: objectId },
            { $set: { trangthai: 0 } }
        );

        return {
            success: result.modifiedCount === 1,
            message: result.modifiedCount === 1
                ? `Đã ẩn thiết kế và ${relatedUpdate.modifiedCount} bản thiết kế người dùng.`
                : "Không tìm thấy thiết kế để ẩn."
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

    async getImagesByColorDesign(productId, colorHex) {
        try {
            // Xác định danh sách vị trí dựa vào danh mục
            let positions = ["front", "right", "left", "back", "bottom"]

            const images = await this.hinhanhsanpham.find({
                masanpham: new ObjectId(productId),
                mau: colorHex,
                vitri: { $in: positions }
            }).toArray();

            return { success: true, images };
        } catch (error) {
            console.error("❌ getImagesByColorDesign error:", error);
            return { success: false, message: error.message };
        }
    }

    async saveUserDesign({ madesign, mau, overlays }) {
        if (!madesign || !mau || !Array.isArray(overlays)) {
            throw new Error("Thiếu madesign, màu hoặc overlays không hợp lệ");
        }
        const madesignId = new ObjectId(madesign);
        // 1. Cập nhật màu cho document gốc trong "designs"
        const designUpdateResult = await this.design.updateOne(
            { _id: madesignId },
            {
                $set: {
                    mau,
                    updatedAt: new Date()
                }
            }
        );

        const updateResults = [];

        // 2. Cập nhật hoặc chèn từng mặt
        for (const item of overlays) {
            const { vitri, overlays: overlayList } = item;

            const existing = await this.thietkecuanguoidung.findOne({
                madesign: madesignId,
                vitri
            });

            let result;
            if (existing) {
                result = await this.thietkecuanguoidung.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            overlays: overlayList,
                            mau,
                            updatedAt: new Date()
                        }
                    }
                );
            } else {
                result = await this.thietkecuanguoidung.insertOne({
                    madesign: madesignId,
                    masanpham: existing?.masanpham || new ObjectId(), // fallback nếu cần
                    vitri,
                    overlays: overlayList,
                    mau,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            updateResults.push({
                vitri,
                modified: result.modifiedCount || 0,
                insertedId: result.insertedId || null
            });
        }
        return {
            success: true,
            message: "Lưu overlays và màu thành công",
            result: {
                designRoot: {
                    modified: designUpdateResult.modifiedCount
                },
                overlays: updateResults
            }
        };
    }

    async getDesignLink(designId) {
        if (!ObjectId.isValid(designId)) return null;

        const design = await this.design.findOne({ _id: new ObjectId(designId) });
        if (!design || !design.link) return null;
        return design.link;
    }


}

module.exports = DesignService;