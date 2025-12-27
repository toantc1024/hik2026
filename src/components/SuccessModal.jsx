import { useState, useEffect } from "react";
import { Modal, Button, Group, Stack, Text, Anchor, Alert, Image, Box } from "@mantine/core";
import { FiCheck, FiX, FiDownload, FiAlertCircle, FiShare2 } from "react-icons/fi";

// Detect if running in a WebView (Zalo, Facebook, Messenger, etc.)
function detectWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    // Check for common in-app browsers
    const isZalo = /Zalo/i.test(ua);
    const isFacebookApp = /FBAN|FBAV|FB_IAB/i.test(ua);
    const isMessenger = /Messenger/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isLine = /Line/i.test(ua);
    const isTelegram = /TelegramBot/i.test(ua);
    const isSnapchat = /Snapchat/i.test(ua);
    const isTwitter = /Twitter/i.test(ua);
    const isLinkedIn = /LinkedIn/i.test(ua);
    const isWeChat = /MicroMessenger/i.test(ua);
    const isViber = /Viber/i.test(ua);

    // Generic WebView detection
    const isWebView = /(wv|WebView)/i.test(ua);

    return {
        isInAppBrowser: isZalo || isFacebookApp || isMessenger || isInstagram || isLine ||
            isTelegram || isSnapchat || isTwitter || isLinkedIn || isWeChat || isViber || isWebView,
        appName: isZalo ? 'Zalo' :
            isFacebookApp ? 'Facebook' :
                isMessenger ? 'Messenger' :
                    isInstagram ? 'Instagram' :
                        isLine ? 'Line' :
                            isWeChat ? 'Zalo/WeChat' :
                                isViber ? 'Viber' :
                                    'ứng dụng này'
    };
}

export default function SuccessModal({ isOpen, onClose, imageUrl, fileName }) {
    const [webViewInfo, setWebViewInfo] = useState({ isInAppBrowser: false, appName: '' });
    const [showImage, setShowImage] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWebViewInfo(detectWebView());
            // Check if Web Share API is available
            setCanShare(navigator.share && navigator.canShare);
        }
    }, [isOpen]);

    // Handle share via Web Share API
    const handleShare = async () => {
        if (!imageUrl) return;

        try {
            // Convert blob URL to blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName || 'avatar_image.png', { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Khung ảnh đại diện',
                    text: 'Khung ảnh đại diện của tôi'
                });
            } else {
                // Fallback: share URL or text
                await navigator.share({
                    title: 'Khung ảnh đại diện',
                    text: 'Khung ảnh đại diện của tôi',
                    url: imageUrl
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Lỗi khi chia sẻ:', error);
            }
        }
    };

    // Handle showing full image for long-press save
    const handleShowImage = () => {
        setShowImage(true);
    };

    return (
        <Modal
            opened={isOpen}
            onClose={() => {
                setShowImage(false);
                onClose();
            }}
            title={
                <Group>
                    <FiCheck size={20} color="green" />
                    Thành công
                </Group>
            }
            size={showImage ? "lg" : "md"}
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
            <Stack spacing="md" style={{ paddingTop: '12px' }}>
                {!showImage ? (
                    <>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            marginTop: '12px'
                        }}>
                            Ảnh đã được xử lý thành công!
                        </div>

                        {/* Warning for in-app browsers */}
                        {webViewInfo.isInAppBrowser && (
                            <Alert
                                icon={<FiAlertCircle size={18} />}
                                title="Hướng dẫn lưu ảnh"
                                color="orange"
                                radius="md"
                            >
                                <Text size="sm">
                                    Bạn đang mở trong <strong>{webViewInfo.appName}</strong>.
                                    Để lưu ảnh, vui lòng:
                                </Text>
                                <Text size="sm" mt="xs">
                                    1. Nhấn nút <strong>"Xem ảnh đầy đủ"</strong> bên dưới
                                </Text>
                                <Text size="sm">
                                    2. <strong>Giữ lâu</strong> trên ảnh và chọn <strong>"Lưu ảnh"</strong>
                                </Text>
                                <Text size="sm" mt="xs" c="dimmed">
                                    Hoặc mở trong trình duyệt bằng dấu ⋮ → "Mở trong trình duyệt"
                                </Text>
                            </Alert>
                        )}

                        {/* Action buttons */}
                        <Stack spacing="sm">
                            {/* Show full image button for in-app browsers */}
                            {webViewInfo.isInAppBrowser && imageUrl && (
                                <Button
                                    onClick={handleShowImage}
                                    fullWidth
                                    variant="gradient"
                                    gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                                    leftSection={<FiDownload size={18} />}
                                    size="md"
                                    radius="xl"
                                >
                                    Xem ảnh đầy đủ để lưu
                                </Button>
                            )}

                            {/* Share button if Web Share API is available */}
                            {canShare && imageUrl && (
                                <Button
                                    onClick={handleShare}
                                    fullWidth
                                    variant="light"
                                    color="blue"
                                    leftSection={<FiShare2 size={18} />}
                                    size="md"
                                    radius="xl"
                                >
                                    Chia sẻ ảnh
                                </Button>
                            )}

                            {/* Direct download link for normal browsers */}
                            {imageUrl && !webViewInfo.isInAppBrowser && (
                                <Anchor
                                    href={imageUrl}
                                    download={fileName}
                                    style={{ width: '100%' }}
                                >
                                    <Button
                                        fullWidth
                                        variant="gradient"
                                        gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                                        leftSection={<FiDownload size={18} />}
                                        size="md"
                                        radius="xl"
                                    >
                                        Tải ảnh xuống
                                    </Button>
                                </Anchor>
                            )}

                            {imageUrl && (
                                <Text align="center" size="xs" color="dimmed">
                                    <Anchor
                                        href={imageUrl}
                                        download={fileName}
                                        target="_blank"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        Nếu không tự động tải về, ấn vào đây
                                    </Anchor>
                                </Text>
                            )}
                        </Stack>

                        <Button
                            onClick={onClose}
                            fullWidth
                            variant="outline"
                            color="gray"
                            rightSection={<FiX size={20} />}
                            radius="xl"
                        >
                            Đóng
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Full image view for long-press saving */}
                        <Alert
                            icon={<FiAlertCircle size={16} />}
                            color="blue"
                            radius="md"
                            mb="sm"
                        >
                            <Text size="sm">
                                <strong>Giữ lâu</strong> trên ảnh bên dưới và chọn <strong>"Lưu ảnh"</strong> để lưu vào thư viện
                            </Text>
                        </Alert>

                        <Box
                            style={{
                                textAlign: 'center',
                                background: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '12px'
                            }}
                        >
                            <Image
                                src={imageUrl}
                                alt="Ảnh đã tạo"
                                radius="md"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '60vh',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>

                        <Group grow mt="sm">
                            <Button
                                onClick={() => setShowImage(false)}
                                variant="outline"
                                color="gray"
                                radius="xl"
                            >
                                Quay lại
                            </Button>

                            {canShare && (
                                <Button
                                    onClick={handleShare}
                                    variant="gradient"
                                    gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                                    leftSection={<FiShare2 size={16} />}
                                    radius="xl"
                                >
                                    Chia sẻ
                                </Button>
                            )}
                        </Group>
                    </>
                )}
            </Stack>
        </Modal>
    );
}
