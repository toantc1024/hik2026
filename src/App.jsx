// filepath: c:\Users\Deno\hvm\thanhdoan.pnt\src\App.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Stack,
  Grid,
  Tooltip,
} from "@mantine/core";
import AVATAR_FRAME from "./assets/avatar.png";
import "./App.css";
import "./fonts.css";

// Import components
import AvatarUploader from "./components/AvatarUploader";
import CanvasPreview from "./components/CanvasPreview";
import ImageFrameRenderer from "./components/ImageFrameRenderer";
import ImageDownloader from "./components/ImageDownloader";
import InAppBrowserAlert from "./components/InAppBrowserAlert";


export default function ImageFrameOverlay() {
  // State management
  const [avatarFrame, setAvatarFrame] = useState(null);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [uploadedImgLoaded, setUploadedImgLoaded] = useState(false);
  const [avatarFrameLoaded, setAvatarFrameLoaded] = useState(false);
  const [avatarCanvasSize, setAvatarCanvasSize] = useState({ width: 0, height: 0 });
  const [renderer, setRenderer] = useState(null);

  // Image customization settings - Default for 1200x1200 frame specifications
  const [squareImageSettings, setSquareImageSettings] = useState({
    x: 0,   // Top left X position
    y: 0,   // Top left Y position
    size: 1200  // Size matching 1200x1200 frame
  });

  // Load frame images
  useEffect(() => {
    // Load avatar frame
    const avatarImg = new Image();
    avatarImg.src = AVATAR_FRAME;
    avatarImg.onload = () => {
      setAvatarFrame(avatarImg);
      setAvatarFrameLoaded(true);
      setRenderer(new ImageFrameRenderer(null, avatarImg));
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Get the container width for the canvas (full width for desktop, less for mobile)
      const containerWidth = window.innerWidth >= 768
        ? window.innerWidth * 0.6
        : window.innerWidth * 0.85;

      // Scale the avatar frame
      if (avatarFrame) {
        const scale = containerWidth / avatarFrame.width;
        setAvatarCanvasSize({
          width: avatarFrame.width * scale,
          height: avatarFrame.height * scale,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [avatarFrame]);

  // Frame area constants (where the avatar image should fit)
  // Based on 1200x1200 frame with circular/square hole at center
  const FRAME_AREA = {
    x: 0,
    y: 0,
    size: 1200
  };

  // Handle image loading from ImageUploader component
  // Reset image position to center and fit the frame area
  const handleImageLoaded = useCallback((image) => {
    setUploadedImg(image);
    setUploadedImgLoaded(true);

    // Reset to default frame area position - image will be centered and fit
    setSquareImageSettings({
      x: FRAME_AREA.x,
      y: FRAME_AREA.y,
      size: FRAME_AREA.size
    });
  }, []);

  // Draw avatar frame on canvas
  const drawAvatarFrame = useCallback((canvas) => {
    if (renderer && avatarFrameLoaded) {
      renderer.drawAvatarFrameOnCanvas(
        canvas,
        uploadedImg,
        uploadedImgLoaded,
        avatarCanvasSize,
        squareImageSettings
      );
    }
  }, [renderer, avatarFrameLoaded, uploadedImg, uploadedImgLoaded, avatarCanvasSize, squareImageSettings]);

  // Handle avatar frame download  
  const handleAvatarDownload = async () => {
    if (!uploadedImgLoaded) {
      alert("Vui lòng tải ảnh lên trước khi lưu!");
      return { success: false };
    }

    try {
      if (renderer) {
        const blob = await renderer.createHighResolutionAvatarImage(
          uploadedImg,
          uploadedImgLoaded,
          squareImageSettings
        );

        const url = URL.createObjectURL(blob);
        const fileName = `avatar_image.png`;

        // Create and click link to download
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);



        return { success: true, url, fileName };
      }
      return { success: false };
    } catch (error) {
      console.error("Error downloading avatar image:", error);
      return { success: false };
    }
  };

  // Helper function to get the reason why the button is disabled
  const getDownloadDisabledReason = () => {
    if (!uploadedImgLoaded) {
      return "Vui lòng tải ảnh lên trước khi lưu";
    }
    return null;
  };

  const avatarInputRef = useRef(null);

  return (
    <div className="blue-theme-background" style={{
      background: 'linear-gradient(135deg, #F0F6FF 0%, #FFF6F7 50%, #EEF5FF 100%)',
      padding: '.5rem .5rem',
      minHeight: '60vh'
    }}>
      {/* Alert for in-app browsers like Zalo */}
      <InAppBrowserAlert />

      <Container size="xl" px="md" py="xl" className="blue-theme-container">
        <Grid gutter="md">
          <Grid.Col sm={12} md={4}>
            <Stack spacing="lg">
              <AvatarUploader inputRef={avatarInputRef} onImageLoaded={handleImageLoaded} />

              <Tooltip
                label={getDownloadDisabledReason()}
                disabled={!getDownloadDisabledReason()}
                position="bottom"
                withArrow
              >
                <div style={{ width: '100%' }}>
                  <ImageDownloader
                    onDownload={handleAvatarDownload}
                    disabled={!uploadedImgLoaded}
                    buttonLabel="Tải avatar"
                  />
                </div>
              </Tooltip>
            </Stack>
          </Grid.Col>
          <Grid.Col sm={12} md={8}>
            <Stack spacing="md">
              <CanvasPreview
                drawFrame={drawAvatarFrame}
                frame={avatarFrame}
                uploadedImg={uploadedImg}
                uploadedImgLoaded={uploadedImgLoaded}
                frameLoaded={avatarFrameLoaded}
                formData={{}}
                canvasSize={avatarCanvasSize}
                title=""
                imageSettings={squareImageSettings}
                onImageSettingsChange={setSquareImageSettings}
                onClick={() => {
                  if (!uploadedImgLoaded) {
                    avatarInputRef.current?.click();
                  }
                }}
              />


            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}

