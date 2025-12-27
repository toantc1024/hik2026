import { useRef, useEffect, useState, useCallback } from "react";
import { Paper, Text, Slider, Group, Stack } from "@mantine/core";

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

    // Mouse/Touch event handlers
    const handleMouseDown = useCallback((e) => {
        if (!uploadedImgLoaded || !canvasRef.current || !onImageSettingsChange) return;

        // For touch events, only proceed if it's a single touch
        if (e.touches && e.touches.length !== 1) return;

        // Prevent default touch behavior
        if (e.touches) {
            e.preventDefault();
        }

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

        // For touch events, only proceed if it's a single touch
        if (e.touches && e.touches.length !== 1) return;

        // Prevent default touch behavior
        if (e.touches) {
            e.preventDefault();
        }

        const mousePos = getMousePos(canvasRef.current, e);

        if (isDragging && onImageSettingsChange) {
            const scale = canvasRef.current.width / frame.width;
            const deltaX = (mousePos.x - dragStart.x) / scale;
            const deltaY = (mousePos.y - dragStart.y) / scale;

            // Calculate new position with constraints to keep image within reasonable bounds
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

    const handleMouseUp = useCallback((e) => {
        // Prevent default touch behavior
        if (e.touches || e.changedTouches) {
            e.preventDefault();
        }

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

        // Touch events
        canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
        canvas.addEventListener('touchmove', handleMouseMove, { passive: false });
        canvas.addEventListener('touchend', handleMouseUp, { passive: false });
        canvas.addEventListener('touchcancel', handleMouseUp, { passive: false });

        // Prevent context menu on long press
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);

            canvas.removeEventListener('touchstart', handleMouseDown);
            canvas.removeEventListener('touchmove', handleMouseMove);
            canvas.removeEventListener('touchend', handleMouseUp);
            canvas.removeEventListener('touchcancel', handleMouseUp);
            canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    // Handle zoom changes - now working with percentages
    const handleZoomChange = useCallback((percentage) => {
        if (onImageSettingsChange && imageSettings) {
            // Convert percentage to actual pixel size
            // 100% = 1444 (default), range from 50% (722px) to 100% (1444px)
            const actualSize = Math.round((percentage / 100) * 1444);
            onImageSettingsChange({
                ...imageSettings,
                size: actualSize
            });
        }
    }, [onImageSettingsChange, imageSettings]);

    // Convert current size to percentage for display
    const getCurrentPercentage = useCallback(() => {
        if (!imageSettings?.size) return 100;
        return Math.round((imageSettings.size / 1444) * 100);
    }, [imageSettings?.size]);

    return (
        <Paper p="md" style={{
            width: "100%",
            overflow: "hidden",
            touchAction: "pan-y" // Allow vertical scrolling but prevent zoom
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
                        touchAction: "none" // Prevent default touch behaviors like zoom
                    }}
                />

                {/* Zoom Controls */}
                {uploadedImgLoaded && onImageSettingsChange && (
                    <Group grow p={"xl"}>
                        <div>
                            <Text size="sm" mb={5} align="center" weight={500}>
                                Phóng to: {getCurrentPercentage()}%
                            </Text>
                            <Slider
                                value={getCurrentPercentage()}
                                onChange={handleZoomChange}
                                min={50}
                                max={125}
                                step={5}
                                marks={[
                                    { value: 50, label: '50%' },
                                    { value: 75, label: '75%' },
                                    { value: 100, label: '100%' },
                                    { value: 125, label: '125%' }
                                ]}
                                size="md"
                                color="blue"
                                label={(value) => `${value}%`}
                            />
                        </div>
                    </Group>
                )}
            </Stack>
        </Paper>
    );
}
