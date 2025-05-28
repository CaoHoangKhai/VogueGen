// File: NewAdd.jsx

import React, { useState, useRef } from 'react';
// import { Editor } from '@tinymce/tinymce-react';

// Bắt buộc import các thành phần core của TinyMCE
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

// Các plugin bạn dùng
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/fullscreen';

// Import skin CSS (bắt buộc để TinyMCE hiển thị đúng giao diện)
import 'tinymce/skins/ui/oxide/skin.min.css';

const NewAdd = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content1, setContent1] = useState('');
    const [content2, setContent2] = useState('');
    const [previewImg1, setPreviewImg1] = useState(null);
    const [previewImg2, setPreviewImg2] = useState(null);
    const [status, setStatus] = useState('');

    const inputFile1Ref = useRef(null);
    const inputFile2Ref = useRef(null);

    const handleImagePreview = (e, setPreviewFunc) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewFunc(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (setPreviewFunc, inputRef) => {
        setPreviewFunc(null);
        if (inputRef && inputRef.current) {
            inputRef.current.value = null;
        }
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setContent1('');
        setContent2('');
        setPreviewImg1(null);
        setPreviewImg2(null);
        setStatus('');
        if (inputFile1Ref.current) inputFile1Ref.current.value = null;
        if (inputFile2Ref.current) inputFile2Ref.current.value = null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề.');
            return;
        }
        if (!status) {
            alert('Vui lòng chọn trạng thái.');
            return;
        }
        const formData = {
            title,
            description,
            content1,
            content2,
            status,
            previewImg1,
            previewImg2,
        };
        console.log('Dữ liệu gửi:', formData);
        alert('Gửi dữ liệu thành công! Kiểm tra console.');
    };

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3 className="text-center mb-3 mt-3">THÊM TIN TỨC</h3>
                </div>
                <div className="card-body row">
                    {/* FORM NHẬP */}
                    <div className="col-md-6">
                        <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label"><strong>Thêm tiêu đề*</strong></label>
                                <input
                                    placeholder="Nhập tiêu đề"
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><strong>Nội dung mô tả</strong></label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả ngắn"
                                    required
                                />
                            </div>

                            {/* HÌNH 1 */}
                            <div className="mb-3">
                                <label className="form-label"><strong>Hình ảnh minh họa (Phần 1)</strong></label>
                                <input
                                    type="file"
                                    className="form-control"
                                    ref={inputFile1Ref}
                                    accept="image/*"
                                    onChange={(e) => handleImagePreview(e, setPreviewImg1)}
                                />

                                {previewImg1 && (
                                    <div className="mt-2">
                                        {/* <img src={previewImg1} alt="Preview 1" className="img-fluid mb-2" /> */}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveImage(setPreviewImg1, inputFile1Ref)}
                                        >
                                            Gỡ ảnh
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* <div className="mb-3">
                                <label className="form-label"><strong>Nội dung đầy đủ (Phần 1)</strong></label>
                                <Editor
                                    id="content1"
                                    value={content1}
                                    init={{
                                        height: 300,
                                        menubar: true,
                                        plugins: [
                                            'advlist autolink lists link image charmap preview fullscreen',
                                        ],
                                        toolbar:
                                            'undo redo | formatselect | bold italic backcolor | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'bullist numlist outdent indent | removeformat | fullscreen | help',
                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                    }}
                                    onEditorChange={(newValue) => setContent1(newValue)}
                                />
                            </div> */}

                            {/* HÌNH 2 */}
                            <div className="mb-3">
                                <label className="form-label"><strong>Hình ảnh minh họa (Phần 2)</strong></label>
                                <input
                                    type="file"
                                    className="form-control"
                                    ref={inputFile1Ref}
                                    accept="image/*"
                                    onChange={(e) => handleImagePreview(e, setPreviewImg1)}
                                />
                                {previewImg2 && (
                                    <div className="mt-2">
                                        {/* <img src={previewImg2} alt="Preview 2" className="img-fluid mb-2" /> */}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveImage(setPreviewImg2, inputFile2Ref)}
                                        >
                                            Gỡ ảnh
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* <div className="mb-3">
                                <label className="form-label"><strong>Nội dung đầy đủ (Phần 2)</strong></label>
                                <Editor
                                    id="content2"
                                    value={content2}
                                    init={{
                                        height: 300,
                                        menubar: true,
                                        plugins: [
                                            'advlist autolink lists link image charmap preview fullscreen',
                                        ],
                                        toolbar:
                                            'undo redo | formatselect | bold italic backcolor | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'bullist numlist outdent indent | removeformat | fullscreen | help',
                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                    }}
                                    onEditorChange={(newValue) => setContent2(newValue)}
                                />
                            </div> */}

                            <div className="mb-3">
                                <label className="form-label"><strong>Trạng thái</strong></label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        -- Chọn trạng thái --
                                    </option>
                                    <option value="1">Hiển thị</option>
                                    <option value="2">Đã ẩn</option>
                                </select>
                            </div>

                            <div className="d-flex">
                                <button type="button" className="btn btn-secondary me-2" onClick={handleReset}>
                                    Reset
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Thêm Tin Tức
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* XEM TRƯỚC */}
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header bg-primary text-white"><strong>Xem Trước Bài Viết</strong></div>
                            <div className="card-body">
                                <h4 className='text-center'>{title}</h4>
                                <p>{description}</p>
                                {previewImg1 && <img src={previewImg1} alt="Ảnh minh họa phần 1" className="img-fluid mb-2" />}
                                {/* <div dangerouslySetInnerHTML={{ __html: content1 }} /> */}
                                {previewImg2 && <img src={previewImg2} alt="Ảnh minh họa phần 2" className="img-fluid mb-2" />}
                                {/* <div dangerouslySetInnerHTML={{ __html: content2 }} /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewAdd;