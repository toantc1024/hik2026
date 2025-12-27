// This component contains all the canvas drawing logic
export default class ImageFrameRenderer {
    constructor(frame, avatarFrame = null) {
        this.frame = frame;
        this.avatarFrame = avatarFrame;
    }

    drawCircularImage(ctx, image, x, y, targetSize = 300) {
        // Calculate scaling to fit the target size while maintaining aspect ratio
        const scale = targetSize / Math.max(image.width, image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Center the image within the circle
        const offsetX = (targetSize - scaledWidth) / 2;
        const offsetY = (targetSize - scaledHeight) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            x + targetSize / 2,
            y + targetSize / 2,
            targetSize / 2,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();

        // Draw the image scaled and centered
        ctx.drawImage(image, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        ctx.restore();
    }

    drawSquareImage(ctx, image, x, y, targetSize = 300) {
        // Calculate scaling to fill the entire target area while maintaining aspect ratio
        const imageAspectRatio = image.width / image.height;

        let scaledWidth, scaledHeight;

        if (imageAspectRatio > 1) {
            // Image is wider than tall - scale by height
            scaledHeight = targetSize;
            scaledWidth = targetSize * imageAspectRatio;
        } else {
            // Image is taller than wide or square - scale by width
            scaledWidth = targetSize;
            scaledHeight = targetSize / imageAspectRatio;
        }

        // Center the image within the square area
        const offsetX = (targetSize - scaledWidth) / 2;
        const offsetY = (targetSize - scaledHeight) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, targetSize, targetSize);
        ctx.closePath();
        ctx.clip();

        // Draw the image scaled to fill the area
        ctx.drawImage(image, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        ctx.restore();
    }

    drawText(ctx, text, x, y, fillColor, centered = false, forcedScale = null, scale) {
        const scaleToUse = forcedScale || scale;
        ctx.save();        // Setup shadow and basic styles
        ctx.shadowOffsetX = 2 * scaleToUse;
        ctx.shadowOffsetY = 1 * scaleToUse;
        ctx.shadowBlur = 8 * scaleToUse;
        // ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.font = `bold ${Math.round(195 * scaleToUse)}px UTM-Swis`; // Increased from 65 to 85
        ctx.lineWidth = Math.round(4 * scaleToUse); // Reduced from 10 to 4 to eliminate sharp edges
        ctx.strokeStyle = "#ff69b4"; // Pink border
        ctx.fillStyle = "white";     // White fill

        ctx.textAlign = centered ? "center" : "left";
        ctx.textBaseline = "middle";

        const xPos = forcedScale ? x : x * scaleToUse;
        const yPos = forcedScale ? y : y * scaleToUse;

        ctx.strokeText(text, xPos, yPos);
        ctx.fillText(text, xPos, yPos);

        ctx.restore();
    }

    drawFrameOnCanvas(canvas, uploadedImg, uploadedImgLoaded, formData, canvasSize, imageSettings = { x: 275, y: 205, size: 1444 }) {
        const ctx = canvas.getContext("2d", { alpha: true });

        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const scale = canvasSize.width / this.frame.width;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw circular image
        if (uploadedImgLoaded) {
            const imageX = imageSettings.x * scale;
            const imageY = imageSettings.y * scale;
            const imageSize = imageSettings.size * scale;
            this.drawCircularImage(ctx, uploadedImg, imageX, imageY, imageSize);
        }

        // Draw frame
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(this.frame, 0, 0);
        ctx.restore();


        // Draw name text with prefix
        if (formData.name) {
            // Calculate text measurements
            ctx.save();
            ctx.font = `bold ${Math.round(165 * scale)}px UTM-Swis`; // Make sure to use 165 for font size

            // Center at X position 1883
            const centerX = 1883;
            const name = formData.name;
            const nameWidth = ctx.measureText(name).width;
            ctx.restore();

            // Draw the text centered at position (1883, 3770) using the center alignment option
            this.drawText(
                ctx,
                name,
                centerX,
                3770,
                "#f2774b",
                true, // Set to true for centered text
                null,
                scale
            );
        }
    }

    drawAvatarFrameOnCanvas(canvas, uploadedImg, uploadedImgLoaded, canvasSize, imageSettings = { x: 275, y: 205, size: 1444 }) {
        const ctx = canvas.getContext("2d", { alpha: true });

        if (!ctx || !this.avatarFrame) return;

        // Set canvas dimensions
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const scale = canvasSize.width / this.avatarFrame.width;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw square image
        if (uploadedImgLoaded) {
            const imageX = imageSettings.x * scale;
            const imageY = imageSettings.y * scale;
            const imageSize = imageSettings.size * scale;
            this.drawSquareImage(ctx, uploadedImg, imageX, imageY, imageSize);
        }

        // Draw frame
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(this.avatarFrame, 0, 0);
        ctx.restore();
    }

    // Create a high-resolution version of the image for download
    createHighResolutionImage(uploadedImg, uploadedImgLoaded, formData, imageSettings = { x: 275, y: 205, size: 1444 }) {
        return new Promise((resolve, reject) => {
            try {
                const exportCanvas = document.createElement("canvas");
                const exportCtx = exportCanvas.getContext("2d", { alpha: true });

                if (!exportCtx) {
                    throw new Error("Không thể tạo context cho canvas");
                }

                exportCanvas.width = this.frame.width;
                exportCanvas.height = this.frame.height;
                // Draw the circular image at high resolution
                if (uploadedImgLoaded) {
                    const imageX = imageSettings.x;
                    const imageY = imageSettings.y;
                    const imageSize = imageSettings.size;
                    this.drawCircularImage(exportCtx, uploadedImg, imageX, imageY, imageSize);
                }

                // Draw frame and position/unit text
                exportCtx.drawImage(this.frame, 0, 0);
                exportCtx.imageSmoothingEnabled = true;                // Draw name text centered just like in the preview
                if (formData.name) {
                    // Use the same position as in the preview (1883, 3770)
                    const centerX = 1883;

                    this.drawText(
                        exportCtx,
                        formData.name,
                        centerX,
                        3770,
                        "#f2774b",
                        true, // Set to true for centered text
                        1
                    );
                }

                // Convert to Blob and resolve
                exportCanvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Không thể tạo file ảnh"));
                        }
                    },
                    "image/png",
                    1.0
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    // Create a high-resolution version of the avatar image for download
    createHighResolutionAvatarImage(uploadedImg, uploadedImgLoaded, imageSettings = { x: 275, y: 205, size: 1444 }) {
        return new Promise((resolve, reject) => {
            try {
                const exportCanvas = document.createElement("canvas");
                const exportCtx = exportCanvas.getContext("2d", { alpha: true });

                if (!exportCtx || !this.avatarFrame) {
                    throw new Error("Cannot create context for canvas or avatar frame is missing");
                }

                exportCanvas.width = this.avatarFrame.width;
                exportCanvas.height = this.avatarFrame.height;

                // Draw the square image at high resolution
                if (uploadedImgLoaded) {
                    const imageX = imageSettings.x;
                    const imageY = imageSettings.y;
                    const imageSize = imageSettings.size;
                    this.drawSquareImage(exportCtx, uploadedImg, imageX, imageY, imageSize);
                }

                // Draw frame
                exportCtx.drawImage(this.avatarFrame, 0, 0);
                exportCtx.imageSmoothingEnabled = true;

                // Convert to Blob and resolve
                exportCanvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Cannot create image file"));
                        }
                    },
                    "image/png",
                    1.0
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
