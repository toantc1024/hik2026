import { useState, useRef } from "react";
import { Button, Modal, Slider, Stack, Text } from "@mantine/core";
import { FiImage, FiCheck, FiZoomIn, FiZoomOut } from "react-icons/fi";
import Cropper from "react-easy-crop";

export default function ImageUploader({ onImageLoaded }) {
    const [showCropModal, setShowCropModal] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [tempImage, setTempImage] = useState(null);

    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = (file) => {
        if (!file) return;

        // Reset states for new upload
        setCroppedAreaPixels(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });

        const reader = new FileReader();
        reader.onload = (e) => {
            setTempImage(e.target.result);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);

        // Clear the file input value to allow selecting the same file again
        fileInputRef.current.value = "";
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", reject);
            image.src = url;
        });

    const getCroppedImage = async () => {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const image = await createImage(tempImage);

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const croppedImage = new Image();
            croppedImage.src = canvas.toDataURL();
            croppedImage.onload = () => {
                onImageLoaded(croppedImage);
                setShowCropModal(false);
            };
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files[0])}
                style={{ display: "none" }}
                accept="image/*"
            />
            <Button
                size="md"
                radius="xl"
                onClick={triggerFileInput}
                fullWidth
                leftSection={<FiImage size={20} />}
                variant="gradient"
                gradient={{ from: '#0066CC', to: '#4D00CC', deg: 135 }}
                style={{
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)',
                    borderRadius: '24px'
                }}
            >
                Tải ảnh lên
            </Button>

            <Modal
                opened={showCropModal}
                onClose={() => setShowCropModal(false)}
                title="Cắt ảnh"
                size="xl"
                centered
                radius="xl"
                styles={{
                    content: {
                        borderRadius: '24px',
                    },
                    header: {
                        borderRadius: '24px 24px 0 0',
                    },
                    body: {
                        borderRadius: '0 0 24px 24px',
                    }
                }}
            >
                <Stack spacing="md" style={{ paddingTop: '16px' }}>
                    <div style={{
                        position: "relative",
                        height: 400,
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }}>
                        <Cropper
                            image={tempImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            cropShape="rect"
                        />
                    </div>

                    <Stack spacing="xs">
                        <Text size="sm" weight={500} align="center" color="dimmed">
                            Thu phóng ảnh
                        </Text>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '0 8px'
                        }}>
                            <FiZoomOut size={18} style={{ color: '#666', flexShrink: 0 }} />
                            <Slider
                                value={zoom}
                                onChange={setZoom}
                                min={1}
                                max={3}
                                step={0.1}
                                size="md"
                                style={{ flex: 1 }}
                                color="blue"
                                label={(value) => `${Math.round(value * 100)}%`}
                            />
                            <FiZoomIn size={18} style={{ color: '#666', flexShrink: 0 }} />
                        </div>
                    </Stack>

                    <Button
                        onClick={getCroppedImage}
                        fullWidth
                        size="lg"
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: '#0066CC', to: '#4D00CC', deg: 135 }}
                        leftSection={<FiCheck size={20} />}
                        style={{ borderRadius: '24px' }}
                    >
                        Xác nhận
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}