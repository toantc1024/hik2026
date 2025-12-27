import { useRef, useEffect, useState, useCallback } from "react";
import { Paper, Text, Slider, Group, Stack } from "@mantine/core";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";

// Default/initial image settings - exported for reset functionality
const DEFAULT_IMAGE_SETTINGS = {
    x: 275,  // Top left X position
    y: 205,  // Top left Y position  
    size: 1444  // Default size (100%)
};

export default function CanvasPreview({
    drawFrame,
    frame,
    uploadedImg,
    uploadedImgLoaded,
    frameLoaded,
    formData,
    canvasSize,
    title,
    imageSettings,
    onImageSettingsChange
}) {
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialImagePos, setInitialImagePos] = useState({ x: 0, y: 0 });

    // Pinch-to-zoom state
    const [isPinching, setIsPinching] = useState(false);
    const [initialPinchDistance, setInitialPinchDistance] = useState(0);
    const [initialPinchSize, setInitialPinchSize] = useState(0);
    const [initialPinchCenter, setInitialPinchCenter] = useState({ x: 0, y: 0 });

    // Min/Max zoom constants (matching crop modal: 1x to 3x, displayed as 50% to 300%)
    const MIN_PERCENTAGE = 50;
    const MAX_PERCENTAGE = 300;
    const BASE_SIZE = 1444;

    useEffect(() => {
        if (frameLoaded && canvasRef.current) {
            drawFrame(canvasRef.current);
        }
    }, [frameLoaded, uploadedImgLoaded, formData, canvasSize, drawFrame, imageSettings]);

    // Get mouse/touch position relative to canvas
    const getMousePos = useCallback((canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Handle touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }, []);

    // Check if mouse is over the image area
    const isMouseOverImage = useCallback((mousePos, canvas) => {
        if (!imageSettings || !frame) return false;

        const scale = canvas.width / frame.width;
        const imageX = imageSettings.x * scale;
        const imageY = imageSettings.y * scale;
        const imageSize = imageSettings.size * scale;

        // Check if mouse is within the circular image bounds
        const centerX = imageX + imageSize / 2;
        const centerY = imageY + imageSize / 2;
        const radius = imageSize / 2;
        const distance = Math.sqrt(
            Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2)
        );

        return distance <= radius;
    }, [imageSettings, frame]);

    // Check if touch is on the canvas at all
    const isTouchOnCanvas = useCallback((e) => {
        if (!canvasRef.current) return false;
        const rect = canvasRef.current.getBoundingClientRect();

        // Check if any touch point is within canvas bounds
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                return true;
            }
        }
        return false;
    }, []);

    // Calculate distance between two touch points
    const getTouchDistance = useCallback((touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Get center point between two touches
    const getTouchCenter = useCallback((touches) => {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }, []);

    // Zoom from center - adjusts position to keep center fixed
    const zoomFromCenter = useCallback((newSize, oldSize, currentX, currentY) => {
        // Calculate current center
        const currentCenterX = currentX + oldSize / 2;
        const currentCenterY = currentY + oldSize / 2;

        // Calculate new position to keep center fixed
        const newX = currentCenterX - newSize / 2;
        const newY = currentCenterY - newSize / 2;

        return { x: newX, y: newY };
    }, []);

    // Handle touch start for both drag and pinch
    const handleTouchStart = useCallback((e) => {
        if (!uploadedImgLoaded || !canvasRef.current || !onImageSettingsChange) return;
        e.preventDefault();

        if (e.touches.length === 2) {
            // Start pinch-to-zoom - allow from anywhere on canvas, not just on image
            setIsPinching(true);
            setIsDragging(false);
            setInitialPinchDistance(getTouchDistance(e.touches));
            setInitialPinchSize(imageSettings.size);
            setInitialPinchCenter({ x: imageSettings.x, y: imageSettings.y });
        } else if (e.touches.length === 1) {
            // Start drag - only if touch is on the image
            const mousePos = getMousePos(canvasRef.current, e);
            if (isMouseOverImage(mousePos, canvasRef.current)) {
                setIsDragging(true);
                setDragStart(mousePos);
                setInitialImagePos({ x: imageSettings.x, y: imageSettings.y });
                canvasRef.current.style.cursor = 'grabbing';
            }
        }
    }, [uploadedImgLoaded, getMousePos, isMouseOverImage, imageSettings, onImageSettingsChange, getTouchDistance]);

    // Handle touch move for both drag and pinch
    const handleTouchMove = useCallback((e) => {
        if (!canvasRef.current || !onImageSettingsChange) return;
        e.preventDefault();

        if (isPinching && e.touches.length === 2) {
            // Handle pinch-to-zoom with center origin - works from anywhere on canvas
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / initialPinchDistance;
            const newSize = Math.round(initialPinchSize * scale);

            // Clamp size to valid range
            const minSize = Math.round(BASE_SIZE * MIN_PERCENTAGE / 100);
            const maxSize = Math.round(BASE_SIZE * MAX_PERCENTAGE / 100);
            const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));

            // Zoom from center
            const newPos = zoomFromCenter(clampedSize, initialPinchSize, initialPinchCenter.x, initialPinchCenter.y);

            onImageSettingsChange({
                ...imageSettings,
                size: clampedSize,
                x: newPos.x,
                y: newPos.y
            });
        } else if (isDragging && e.touches.length === 1) {
            // Handle drag
            const mousePos = getMousePos(canvasRef.current, e);
            const scale = canvasRef.current.width / frame.width;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            const newX = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.width - imageSettings.size * 0.5,
                    initialImagePos.x + deltaX));
            const newY = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.height - imageSettings.size * 0.5,
                    initialImagePos.y + deltaY));

            onImageSettingsChange({
                ...imageSettings,
                x: newX,
                y: newY
            });
        }
    }, [isPinching, isDragging, initialPinchDistance, initialPinchSize, initialPinchCenter, getTouchDistance, getMousePos, dragStart, initialImagePos, imageSettings, frame, onImageSettingsChange, zoomFromCenter, MIN_PERCENTAGE, MAX_PERCENTAGE, BASE_SIZE]);

    // Handle touch end
    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        setIsPinching(false);
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, []);

    // Mouse event handlers (for desktop)
    const handleMouseDown = useCallback((e) => {
        if (!uploadedImgLoaded || !canvasRef.current || !onImageSettingsChange) return;

        const mousePos = getMousePos(canvasRef.current, e);

        if (isMouseOverImage(mousePos, canvasRef.current)) {
            setIsDragging(true);
            setDragStart(mousePos);
            setInitialImagePos({ x: imageSettings.x, y: imageSettings.y });
            canvasRef.current.style.cursor = 'grabbing';
        }
    }, [uploadedImgLoaded, getMousePos, isMouseOverImage, imageSettings, onImageSettingsChange]);

    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, e);

        if (isDragging && onImageSettingsChange) {
            const scale = canvasRef.current.width / frame.width;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            const newX = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.width - imageSettings.size * 0.5,
                    initialImagePos.x + deltaX));
            const newY = Math.max(-imageSettings.size * 0.5,
                Math.min(frame.height - imageSettings.size * 0.5,
                    initialImagePos.y + deltaY));

            onImageSettingsChange({
                ...imageSettings,
                x: newX,
                y: newY
            });
        } else if (uploadedImgLoaded && isMouseOverImage(mousePos, canvasRef.current)) {
            canvasRef.current.style.cursor = 'grab';
        } else {
            canvasRef.current.style.cursor = 'default';
        }
    }, [isDragging, dragStart, initialImagePos, imageSettings, frame, getMousePos, isMouseOverImage, uploadedImgLoaded, onImageSettingsChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, []);

    // Add event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Mouse events
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        // Prevent context menu on long press
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);

            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchEnd);
            canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Handle zoom changes with center origin
    const handleZoomChange = useCallback((percentage) => {
        if (onImageSettingsChange && imageSettings) {
            const newSize = Math.round((percentage / 100) * BASE_SIZE);
            const oldSize = imageSettings.size;

            // Zoom from center
            const newPos = zoomFromCenter(newSize, oldSize, imageSettings.x, imageSettings.y);

            onImageSettingsChange({
                ...imageSettings,
                size: newSize,
                x: newPos.x,
                y: newPos.y
            });
        }
    }, [onImageSettingsChange, imageSettings, zoomFromCenter]);

    // Convert current size to percentage for display
    const getCurrentPercentage = useCallback(() => {
        if (!imageSettings?.size) return 100;
        return Math.round((imageSettings.size / BASE_SIZE) * 100);
    }, [imageSettings?.size]);

    return (
        <Paper p="md" radius="xl" style={{
            width: "100%",
            overflow: "hidden",
            touchAction: "pan-y",
            borderRadius: '24px'
        }}>
            {title && (
                <Text size="lg" weight={700} align="center" mb="md">
                    {title}
                </Text>
            )}
            <Stack spacing="md">
                <canvas
                    ref={canvasRef}
                    style={{
                        maxWidth: "100%",
                        height: "40vh",
                        display: "block",
                        margin: "0 auto",
                        cursor: "default",
                        userSelect: "none",
                        touchAction: "none",
                        borderRadius: "16px"
                    }}
                />

                {/* Zoom Controls - Simplified: only slider with icons */}
                {uploadedImgLoaded && onImageSettingsChange && (
                    <Stack spacing="md" px="md">
                        <Group spacing="sm" align="center" style={{ width: '100%' }}>
                            <FiZoomOut size={18} style={{ color: '#666', flexShrink: 0 }} />
                            <Slider
                                value={getCurrentPercentage()}
                                onChange={handleZoomChange}
                                min={MIN_PERCENTAGE}
                                max={MAX_PERCENTAGE}
                                step={5}
                                marks={[
                                    { value: 50, label: '50%' },
                                    { value: 100, label: '100%' },
                                    { value: 200, label: '200%' },
                                    { value: 300, label: '300%' }
                                ]}
                                size="md"
                                color="blue"
                                label={(value) => `${value}%`}
                                style={{ flex: 1 }}
                            />
                            <FiZoomIn size={18} style={{ color: '#666', flexShrink: 0 }} />
                        </Group>

                        <Text size="xs" color="dimmed" align="center" mt="md" mb="sm">
                            Kéo ảnh để di chuyển • Dùng 2 ngón để zoom
                        </Text>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

export { DEFAULT_IMAGE_SETTINGS };
