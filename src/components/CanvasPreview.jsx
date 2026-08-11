import { useRef, useEffect, useState, useCallback } from "react";
import { Paper, Text, Slider, Group, Stack } from "@mantine/core";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";

// Default/initial image settings - exported for reset functionality
// Based on 1200x1200 avatar frame with circular/square hole at center
const DEFAULT_IMAGE_SETTINGS = {
    x: 0,   // Top left X position
    y: 0,   // Top left Y position
    size: 1200  // Default size matching 1200x1200 frame
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
    onImageSettingsChange,
    onClick // Added onClick prop
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
    const BASE_SIZE = 1200; // Matches avatar frame 1200x1200 size

    // Track if a drag movement occurred
    const [hasDragged, setHasDragged] = useState(false);
    const [touchedImage, setTouchedImage] = useState(false);

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

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }, []);

    // Check if mouse/touch is over the canvas area
    const isMouseOverImage = useCallback((mousePos, canvas) => {
        if (!imageSettings) return false;
        return true;
    }, [imageSettings]);

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
        if (!canvasRef.current) return;

        // If no image loaded, allow default tap behavior to trigger file selection
        if (!uploadedImgLoaded) {
            return;
        }

        // Image is loaded: prevent native scroll/click synthesis and enable photo dragging/pinching
        e.preventDefault();
        if (!onImageSettingsChange) return;

        if (e.touches.length === 2) {
            // Start pinch-to-zoom - allow from anywhere on canvas
            setIsPinching(true);
            setIsDragging(false);
            setHasDragged(false);
            setTouchedImage(false);
            setInitialPinchDistance(getTouchDistance(e.touches));
            setInitialPinchSize(imageSettings.size);
            setInitialPinchCenter({ x: imageSettings.x, y: imageSettings.y });
        } else if (e.touches.length === 1) {
            // Start drag
            const mousePos = getMousePos(canvasRef.current, e);
            setIsDragging(true);
            setHasDragged(false);
            setTouchedImage(true);
            setDragStart(mousePos);
            setInitialImagePos({ x: imageSettings.x, y: imageSettings.y });
            canvasRef.current.style.cursor = 'grabbing';
        }
    }, [uploadedImgLoaded, getMousePos, imageSettings, onImageSettingsChange, getTouchDistance]);

    // Handle touch move for both drag and pinch
    const handleTouchMove = useCallback((e) => {
        if (!canvasRef.current || !onImageSettingsChange || !uploadedImgLoaded) return;
        e.preventDefault();

        const frameWidth = frame ? frame.width : 1200;
        const frameHeight = frame ? frame.height : 1200;

        if (isPinching && e.touches.length === 2) {
            // Handle pinch-to-zoom with center origin
            const currentDistance = getTouchDistance(e.touches);
            if (initialPinchDistance > 0) {
                const scale = currentDistance / initialPinchDistance;
                const newSize = Math.round(initialPinchSize * scale);

                // Clamp size to valid range
                const minSize = Math.round(BASE_SIZE * MIN_PERCENTAGE / 100);
                const maxSize = Math.round(BASE_SIZE * MAX_PERCENTAGE / 100);
                const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));

                // Zoom from center
                const newPos = zoomFromCenter(clampedSize, initialPinchSize, initialPinchCenter.x, initialPinchCenter.y);

                setHasDragged(true); // Mark as dragged to avoid click
                onImageSettingsChange({
                    ...imageSettings,
                    size: clampedSize,
                    x: newPos.x,
                    y: newPos.y
                });
            }
        } else if (isDragging && e.touches.length === 1) {
            // Handle drag
            const mousePos = getMousePos(canvasRef.current, e);
            const scale = canvasRef.current.width / frameWidth;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            const newX = Math.max(-imageSettings.size * 0.8,
                Math.min(frameWidth - imageSettings.size * 0.2,
                    initialImagePos.x + deltaX));
            const newY = Math.max(-imageSettings.size * 0.8,
                Math.min(frameHeight - imageSettings.size * 0.2,
                    initialImagePos.y + deltaY));

            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                setHasDragged(true);
            }
            onImageSettingsChange({
                ...imageSettings,
                x: newX,
                y: newY
            });
        }
    }, [isPinching, isDragging, initialPinchDistance, initialPinchSize, initialPinchCenter, getTouchDistance, getMousePos, dragStart, initialImagePos, imageSettings, frame, onImageSettingsChange, zoomFromCenter, MIN_PERCENTAGE, MAX_PERCENTAGE, BASE_SIZE, uploadedImgLoaded]);

    // Handle touch end
    const handleTouchEnd = useCallback((e) => {
        if (uploadedImgLoaded) {
            e.preventDefault();
        }
        setIsPinching(false);
        const wasDragging = isDragging;
        setIsDragging(false);

        // Only trigger click (file upload) if NO image is uploaded yet
        if (!uploadedImgLoaded && !hasDragged && !wasDragging && !isPinching && onClick) {
            onClick();
        }
        setHasDragged(false);
        setTouchedImage(false);

        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, [isDragging, hasDragged, isPinching, onClick, uploadedImgLoaded]);

    // Mouse event handlers (for desktop)
    const handleMouseDown = useCallback((e) => {
        if (!canvasRef.current) return;

        if (!uploadedImgLoaded) {
            return;
        }

        if (!onImageSettingsChange) return;

        const mousePos = getMousePos(canvasRef.current, e);
        setIsDragging(true);
        setHasDragged(false);
        setDragStart(mousePos);
        setInitialImagePos({ x: imageSettings.x, y: imageSettings.y });
        canvasRef.current.style.cursor = 'grabbing';
    }, [uploadedImgLoaded, getMousePos, imageSettings, onImageSettingsChange]);

    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, e);
        const frameWidth = frame ? frame.width : 1200;
        const frameHeight = frame ? frame.height : 1200;

        if (isDragging && onImageSettingsChange && uploadedImgLoaded) {
            const scale = canvasRef.current.width / frameWidth;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            const newX = Math.max(-imageSettings.size * 0.8,
                Math.min(frameWidth - imageSettings.size * 0.2,
                    initialImagePos.x + deltaX));
            const newY = Math.max(-imageSettings.size * 0.8,
                Math.min(frameHeight - imageSettings.size * 0.2,
                    initialImagePos.y + deltaY));

            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                setHasDragged(true);
            }
            onImageSettingsChange({
                ...imageSettings,
                x: newX,
                y: newY
            });
        } else if (uploadedImgLoaded) {
            canvasRef.current.style.cursor = 'grab';
        } else {
            canvasRef.current.style.cursor = 'pointer';
        }
    }, [isDragging, dragStart, initialImagePos, imageSettings, frame, getMousePos, uploadedImgLoaded, onImageSettingsChange]);

    const handleMouseUp = useCallback(() => {
        const wasDragging = isDragging;
        setIsDragging(false);

        // Only trigger click (file upload) if NO image is uploaded yet
        if (!uploadedImgLoaded && !hasDragged && !wasDragging && onClick) {
            onClick();
        }
        setHasDragged(false);

        if (canvasRef.current) {
            canvasRef.current.style.cursor = uploadedImgLoaded ? 'grab' : 'pointer';
        }
    }, [isDragging, hasDragged, onClick, uploadedImgLoaded]);

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
                    className="avatar-canvas"
                    style={{
                        maxWidth: "100%",
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
