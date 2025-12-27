import { useState } from "react";
import { Button } from "@mantine/core";
import { FiDownload } from "react-icons/fi";
import SuccessModal from "./SuccessModal";

export default function ImageDownloader({
    onDownload,
    disabled,
    buttonLabel = "Tải Ảnh Xuống",
}) {
    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileName, setFileName] = useState("image.png");

    const handleDownload = async () => {
        try {
            setSaving(true);
            const result = await onDownload();
            if (result && result.success) {
                setImageUrl(result.url);
                setFileName(result.fileName || "image.png");
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error("Lỗi khi lưu ảnh:", error);
            alert(
                `Có lỗi xảy ra khi lưu ảnh: ${error.message || "Lỗi không xác định"}`
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Button
                size="md"
                radius="xl"
                onClick={handleDownload}
                fullWidth
                color="blue"
                loading={saving}
                leftSection={<FiDownload size={20} />}
                disabled={disabled}
                variant="gradient"
                gradient={{ from: '#0066CC', to: '#4D00CC', deg: 135 }}
                style={{
                    boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 102, 204, 0.25)',
                    borderRadius: '24px'
                }}
            >
                {saving ? "Đang xử lý..." : buttonLabel}
            </Button>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                imageUrl={imageUrl}
                fileName={fileName}
            />
        </>
    );
}
