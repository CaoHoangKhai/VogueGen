import React, { useEffect, useRef } from "react";

const Tinymce = ({ value, onChange, id = "tinymce-editor", height = 300 }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Nếu đã có script tinymce trên window thì khởi tạo
        if (window.tinymce) {
            window.tinymce.init({
                selector: `#${id}`,
                height,
                forced_root_block: false, // Bỏ auto bọc thẻ p
                plugins: "lists link image table code",
                toolbar:
                    "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
                setup: (editor) => {
                    editor.on("Change KeyUp", () => {
                        onChange(editor.getContent());
                    });
                    editor.on("init", () => {
                        editor.setContent(value || "");
                    });
                },
            });

            editorRef.current = window.tinymce.get(id);
        }

        // Cleanup khi unmount
        return () => {
            if (window.tinymce) {
                window.tinymce.remove(`#${id}`);
            }
        };
        // eslint-disable-next-line
    }, []);

    // Khi value thay đổi từ ngoài vào
    useEffect(() => {
        if (window.tinymce && window.tinymce.get(id)) {
            const editor = window.tinymce.get(id);
            if (editor.getContent() !== value) {
                editor.setContent(value || "");
            }
        }
    }, [value, id]);

    return <textarea id={id} />;
};

export default Tinymce;