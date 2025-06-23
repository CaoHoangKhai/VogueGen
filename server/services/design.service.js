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
        this.mauthietke = client.db().collection("mauthietke");
        this.thietkecuanguoidung = client.db().collection("thietkecuanguoidung")
    }

    async createDesign({ manguoidung, theloai }) {
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");
        if (!ObjectId.isValid(theloai)) throw new Error("ID thể loại không hợp lệ.");

        const user = await this.nguoidung.findOne({ _id: new ObjectId(manguoidung) });
        if (!user) {
            return {
                success: false,
                message: "Vui lòng đăng ký để sử dụng tính năng thiết kế."
            };
        }

        const category = await this.theloaisanpham.findOne({ _id: new ObjectId(theloai) });
        if (!category) {
            return {
                success: false,
                message: "Thể loại không tồn tại. Vui lòng chọn thể loại hợp lệ."
            };
        }

        // 👉 Tạm thời insert trước để lấy ObjectId
        const tempResult = await this.design.insertOne({
            manguoidung: new ObjectId(manguoidung),
            theloai: new ObjectId(theloai),
            ngaytao: new Date()
        });

        const insertedId = tempResult.insertedId;
        const slugPrefix = category?.tendanhmuc ? toSlug(category.tendanhmuc) : "san-pham";
        const link = `${slugPrefix}/${insertedId}`;
        const ten = `Thiết kế ${insertedId.toString()}`;

        // 👉 Cập nhật lại với tên + link
        await this.design.updateOne(
            { _id: insertedId },
            { $set: { link, ten } }
        );

        return {
            success: true,
            message: "Khởi tạo thiết kế thành công.",
            id: insertedId,
            link
        };
    }


    async getDesignsByUser(manguoidung) {
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");

        const designs = await this.design
            .find({ manguoidung: new ObjectId(manguoidung) })
            .sort({ ngaytao: -1 }) // 🆕 sắp xếp mới nhất lên đầu
            .toArray();


        for (const design of designs) {
            // Lấy thông tin thể loại
            const theloai = await this.theloaisanpham.findOne({ _id: design.theloai });
            design.theloai_info = theloai || null;

            // Tạo slug từ tên danh mục
            const slugPrefix = theloai?.tendanhmuc ? toSlug(theloai.tendanhmuc) : "san-pham";

            // Lấy danh sách ảnh mẫu từ collection mauthietke theo theloai
            const mauThietKeArr = await this.mauthietke
                .find({ theloai: design.theloai })
                .toArray();

            // Sắp xếp theo position: front → back → others
            mauThietKeArr.sort((a, b) => {
                const priority = { front: 1, back: 2 };
                return (priority[a.position] || 3) - (priority[b.position] || 3);
            });

            // Gắn link đường dẫn ảnh
            design.hinhanh_mau = mauThietKeArr.map(mau => {
                const fileName = mau.duongdan || mau.hinhanh || mau.anhthietke || null;
                return fileName ? `http://localhost:4000/images/designs/${slugPrefix}/${fileName}` : null;
            });
        }

        return designs;
    }

    async getDesignById(designId) {
        if (!ObjectId.isValid(designId)) throw new Error("ID thiết kế không hợp lệ.");

        const design = await this.design.findOne({ _id: new ObjectId(designId) });
        if (!design) return null;

        // Lấy thông tin thể loại
        const theloai = await this.theloaisanpham.findOne({ _id: design.theloai });
        design.theloai_info = theloai || null;

        // Tạo slug từ tên danh mục
        const slugPrefix = theloai?.tendanhmuc ? toSlug(theloai.tendanhmuc) : "san-pham";

        // Lấy danh sách ảnh mẫu từ collection mauthietke theo theloai
        const mauThietKeArr = await this.mauthietke
            .find({ theloai: design.theloai })
            .toArray();

        mauThietKeArr.sort((a, b) => {
            const priority = { front: 1, back: 2 };
            return (priority[a.position] || 3) - (priority[b.position] || 3);
        });

        design.hinhanh_mau = mauThietKeArr.map(mau => {
            const fileName = mau.duongdan || mau.hinhanh || mau.anhthietke || mau.designImage || null;
            return fileName
                ? {
                    url: `http://localhost:4000/images/designs/${slugPrefix}/${fileName}`,
                    position: mau.position || null
                }
                : null;
        }).filter(Boolean);

        return design;

    }

    async saveUserDesignFull({ designId, color, designData }) {
        if (!ObjectId.isValid(designId)) throw new Error("ID thiết kế không hợp lệ.");

        // Kiểm tra thiết kế gốc có tồn tại không
        const design = await this.design.findOne({ _id: new ObjectId(designId) });
        if (!design) {
            return { success: false, message: "Thiết kế không tồn tại." };
        }

        const operations = [];

        // Duyệt qua cả hai mặt: front, back
        for (const side of ["front", "back"]) {
            const data = {
                id_thietke: new ObjectId(designId),
                side,
                color,
                texts: designData[side]?.texts || [],
                images: designData[side]?.images || [],
                updated_at: new Date()
            };

            // Thêm created_at nếu là tạo mới
            operations.push(
                this.thietkecuanguoidung.updateOne(
                    { id_thietke: data.id_thietke, side: side },
                    {
                        $set: data,
                        $setOnInsert: { created_at: new Date() }
                    },
                    { upsert: true }
                )
            );
        }

        // Thực hiện song song
        await Promise.all(operations);

        return {
            success: true,
            message: "Đã lưu hoặc cập nhật thiết kế người dùng (2 mặt)."
        };
    }

    async getUserDesignByDesignId(designId) {
        if (!ObjectId.isValid(designId)) throw new Error("ID thiết kế không hợp lệ.");

        const data = await this.thietkecuanguoidung
            .find({ id_thietke: new ObjectId(designId) })
            .toArray();

        if (!data || data.length === 0) {
            return {
                success: false,
                message: "Chưa có thiết kế người dùng cho ID này."
            };
        }

        // Gom dữ liệu theo mặt áo (front/back)
        const designData = {
            front: { texts: [], images: [] },
            back: { texts: [], images: [] }
        };

        let color = null;

        data.forEach((entry) => {
            if (entry.side === "front" || entry.side === "back") {
                designData[entry.side] = {
                    texts: entry.texts || [],
                    images: entry.images || []
                };
                color = entry.color || color;
            }
        });

        return {
            success: true,
            message: "Lấy thiết kế người dùng thành công.",
            tshirtColor: color,
            designData
        };
    }


}

module.exports = DesignService;