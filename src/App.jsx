// filepath: c:\Users\Deno\hvm\thanhdoan.pnt\src\App.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Stack,
  Grid,
  Tooltip,
  Button,
} from "@mantine/core";
import { FiExternalLink } from "react-icons/fi";
import AVATAR_FRAME from "./assets/avatar.png";
import "./App.css";
import "./fonts.css";

// Import components
import ImageUploader from "./components/ImageUploader";
import CanvasPreview from "./components/CanvasPreview";
import ImageFrameRenderer from "./components/ImageFrameRenderer";
import ImageDownloader from "./components/ImageDownloader";
import InAppBrowserAlert from "./components/InAppBrowserAlert";
import ConfirmLinkModal from "./components/ConfirmLinkModal";


export default function ImageFrameOverlay() {
  // State management
  const [avatarFrame, setAvatarFrame] = useState(null);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [uploadedImgLoaded, setUploadedImgLoaded] = useState(false);
  const [avatarFrameLoaded, setAvatarFrameLoaded] = useState(false);
  const [avatarCanvasSize, setAvatarCanvasSize] = useState({ width: 0, height: 0 });
  const [renderer, setRenderer] = useState(null);

  // Modal state for external link confirmation
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);


  // Image customization settings - Updated for 3750x3750 frame specifications
  const [squareImageSettings, setSquareImageSettings] = useState({
    x: 510,   // Top left X position of the circular hole
    y: 510,   // Top left Y position of the circular hole  
    size: 2730  // Size of the circular area (diameter)
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
  // Based on 3750x3750 frame with circular hole at center
  const FRAME_AREA = {
    x: 510,      // Top left X of circular hole
    y: 510,      // Top left Y of circular hole
    size: 2730   // Diameter of the circular area
  };

  // Handle image loading from ImageUploader component
  // Reset image position to center and fit the frame area
  const handleImageLoaded = useCallback((image) => {
    setUploadedImg(image);
    setUploadedImgLoaded(true);

    // Reset to default frame area position - image will be centered and fit
    // The drawSquareImage function handles scaling and centering within the size
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

  return (
    <div className="blue-theme-background" style={{
      background: 'linear-gradient(135deg, #E6F3FF 0%, #F0E6FF 50%, #CCE7FF 100%)',
      padding: '.5rem .5rem',
      minHeight: '60vh'
    }}>
      {/* Alert for in-app browsers like Zalo */}
      <InAppBrowserAlert />

      <Container size="xl" px="md" py="xl" className="blue-theme-container">
        <Grid gutter="md">
          <Grid.Col sm={12} md={4}>
            <Stack spacing="lg">
              <ImageUploader onImageLoaded={handleImageLoaded} />

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

              <Button
                fullWidth
                size="md"
                radius="xl"
                variant="light"
                leftSection={<FiExternalLink size={18} />}
                onClick={() => setConfirmModalOpened(true)}
              >
                Bộ nhận diện HCMUTE
              </Button>
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
              />


            </Stack>
          </Grid.Col>
        </Grid>

        {/* Loading overlay removed as requested */}

        {/* Confirm Link Modal */}
        <ConfirmLinkModal
          opened={confirmModalOpened}
          onClose={() => setConfirmModalOpened(false)}
          url="https://link.hcmute.edu.vn/BonhandienHCMUTE"
          title="Bộ nhận diện HCMUTE"
        />
      </Container>
    </div>
  );
}

