import { useState, useRef } from "react";
import { Button, Modal, Slider } from "@mantine/core";
import { FiImage } from "react-icons/fi";
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
            />            <Button
                size="md"
                radius="xl"
                onClick={triggerFileInput}
                fullWidth
                leftIcon={<FiImage size={20} />}
                variant="gradient"
                gradient={{ from: '#0066CC', to: '#4D00CC', deg: 135 }}
                sx={{ boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)' }}
            >
                Tải ảnh lên
            </Button>

            <Modal
                opened={showCropModal}
                onClose={() => setShowCropModal(false)}
                title="Cắt ảnh"
                size="xl"
            >
                <div style={{ position: "relative", height: 400, marginBottom: 20 }}>
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
                <Slider
                    value={zoom}
                    onChange={setZoom}
                    min={1}
                    max={3}
                    step={0.1}
                    label="Thu phóng"
                    mb="md"
                    size="lg"
                />                <Button
                    onClick={getCroppedImage}
                    fullWidth
                    size="lg"
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: '#0066CC', to: '#4D00CC', deg: 135 }}
                >
                    Xác nhận
                </Button>
            </Modal>
        </>
    );
}