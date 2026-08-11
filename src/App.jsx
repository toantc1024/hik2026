import { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Stack,
  Grid,
  Tooltip,
} from "@mantine/core";
import TSV_FRAME from "./assets/tsv.png";
import CBVC_FRAME from "./assets/cbvc.png";
import "./App.css";
import "./fonts.css";

// Import components
import AvatarUploader from "./components/AvatarUploader";
import CanvasPreview from "./components/CanvasPreview";
import ImageFrameRenderer from "./components/ImageFrameRenderer";
import ImageDownloader from "./components/ImageDownloader";
import InAppBrowserAlert from "./components/InAppBrowserAlert";
import FrameSwitcher from "./components/FrameSwitcher";

export default function ImageFrameOverlay() {
  // Frame selection state: 'tsv' (Tân sinh viên) or 'cbvc' (CBVC / Giảng viên / Người học)
  const [selectedFrameType, setSelectedFrameType] = useState("tsv");
  const [frameImages, setFrameImages] = useState({ tsv: null, cbvc: null });
  const [avatarFrame, setAvatarFrame] = useState(null);

  // State management
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

  // Load both frame images on component mount
  useEffect(() => {
    const tsvImg = new Image();
    tsvImg.src = TSV_FRAME;

    const cbvcImg = new Image();
    cbvcImg.src = CBVC_FRAME;

    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) {
        setFrameImages({ tsv: tsvImg, cbvc: cbvcImg });
        const activeImg = selectedFrameType === "cbvc" ? cbvcImg : tsvImg;
        setAvatarFrame(activeImg);
        setAvatarFrameLoaded(true);
        setRenderer(new ImageFrameRenderer(null, activeImg));
      }
    };

    tsvImg.onload = checkLoaded;
    cbvcImg.onload = checkLoaded;
  }, []);

  // Update active frame when selectedFrameType changes
  const handleSelectFrameType = useCallback((frameType) => {
    setSelectedFrameType(frameType);
    if (frameImages[frameType]) {
      const activeImg = frameImages[frameType];
      setAvatarFrame(activeImg);
      if (renderer) {
        renderer.avatarFrame = activeImg;
      }
    }
  }, [frameImages, renderer]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth >= 768
        ? window.innerWidth * 0.6
        : window.innerWidth * 0.85;

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

  // Frame area constants
  const FRAME_AREA = {
    x: 0,
    y: 0,
    size: 1200
  };

  const handleImageLoaded = useCallback((image) => {
    setUploadedImg(image);
    setUploadedImgLoaded(true);

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
        const fileName = `avatar_${selectedFrameType}.png`;

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

  const getDownloadDisabledReason = () => {
    if (!uploadedImgLoaded) {
      return "Vui lòng tải ảnh lên trước khi lưu";
    }
    return null;
  };

  const avatarInputRef = useRef(null);

  return (
    <div className="blue-theme-background" style={{
      background: selectedFrameType === 'cbvc'
        ? 'linear-gradient(135deg, #FFF0F0 0%, #FFFDF0 50%, #F0F6FF 100%)'
        : 'linear-gradient(135deg, #F0F6FF 0%, #FFF6F7 50%, #EEF5FF 100%)',
      padding: '.5rem .5rem',
      minHeight: '60vh',
      transition: 'background 0.5s ease'
    }}>
      {/* Alert for in-app browsers like Zalo */}
      <InAppBrowserAlert />

      <Container size="xl" px="md" py="xl" className="blue-theme-container">
        <Grid gutter="md">
          <Grid.Col sm={12} md={4}>
            <Stack spacing="lg">
              {/* Gradient Frame Switcher above Image Uploader */}
              <FrameSwitcher
                selectedFrameType={selectedFrameType}
                onSelectFrameType={handleSelectFrameType}
              />

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
