import { useState, useEffect } from "react";
import { Modal, Button, Group, Stack, Text, Alert, Box } from "@mantine/core";
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
        isZalo,
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
    const [webViewInfo, setWebViewInfo] = useState({ isInAppBrowser: false, isZalo: false, appName: '' });
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [shareError, setShareError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const info = detectWebView();
            setWebViewInfo(info);
            // Check if Web Share API is available
            setCanShare(!!(navigator.share));
            setShareError(null);
        }
    }, [isOpen]);

    // Handle share via Web Share API (PRIMARY METHOD for Zalo/in-app browsers)
    const handleShare = async () => {
        if (!imageUrl) return;

        setIsSharing(true);
        setShareError(null);

        try {
            // Convert blob URL to blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName || 'khung_anh_dai_dien.png', { type: 'image/png' });

            // Check if can share files
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Khung ảnh đại diện',
                });
            } else if (navigator.share) {
                // Fallback: share without file
                await navigator.share({
                    title: 'Khung ảnh đại diện',
                    text: 'Khung ảnh đại diện của tôi',
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                setShareError('Không thể chia sẻ. Vui lòng thử cách khác.');
            }
        } finally {
            setIsSharing(false);
        }
    };

    // Download image by creating a temporary link (for desktop browsers)
    const handleDownload = async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'khung_anh_dai_dien.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <FiCheck size={20} color="green" />
                    <Text fw={600}>Thành công</Text>
                </Group>
            }
            size="md"
            centered
            radius="xl"
            styles={{
                content: {
                    borderRadius: '24px',
                },
                header: {
                    borderRadius: '24px 24px 0 0',
                }
            }}
        >
            <Stack gap="md" style={{ paddingTop: '8px' }}>
                <Box style={{
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                }}>
                    Ảnh đã được xử lý thành công!
                </Box>

                {/* Preview image */}
                {imageUrl && (
                    <Box
                        style={{
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '1rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt="Ảnh đã tạo"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                borderRadius: '12px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            }}
                        />
                    </Box>
                )}

                {/* In-app browser warning and instructions */}
                {webViewInfo.isInAppBrowser && (
                    <Alert
                        icon={<FiAlertCircle size={18} />}
                        title={`Đang mở trong ${webViewInfo.appName}`}
                        color="blue"
                        radius="lg"
                    >
                        <Stack gap="xs">
                            <Text size="sm">
                                Để lưu ảnh, hãy nhấn nút <strong>"Lưu/Chia sẻ ảnh"</strong> bên dưới.
                            </Text>
                            <Text size="sm">
                                Trong menu hiện ra, chọn <strong>"Lưu ảnh"</strong> hoặc <strong>"Save to Photos"</strong>.
                            </Text>
                        </Stack>
                    </Alert>
                )}

                {/* Share error message */}
                {shareError && (
                    <Alert color="red" radius="lg">
                        <Text size="sm">{shareError}</Text>
                    </Alert>
                )}

                {/* Action buttons */}
                <Stack gap="sm">
                    {/* PRIMARY: Share button for in-app browsers (Web Share API) */}
                    {canShare && imageUrl && webViewInfo.isInAppBrowser && (
                        <Button
                            onClick={handleShare}
                            fullWidth
                            variant="gradient"
                            gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                            leftSection={<FiShare2 size={18} />}
                            size="lg"
                            radius="xl"
                            loading={isSharing}
                        >
                            Lưu/Chia sẻ ảnh
                        </Button>
                    )}

                    {/* DESKTOP: Direct download button */}
                    {imageUrl && !webViewInfo.isInAppBrowser && (
                        <Button
                            onClick={handleDownload}
                            fullWidth
                            variant="gradient"
                            gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                            leftSection={<FiDownload size={18} />}
                            size="lg"
                            radius="xl"
                        >
                            Tải ảnh xuống
                        </Button>
                    )}

                    {/* Share for desktop */}
                    {canShare && imageUrl && !webViewInfo.isInAppBrowser && (
                        <Button
                            onClick={handleShare}
                            fullWidth
                            variant="light"
                            color="blue"
                            leftSection={<FiShare2 size={18} />}
                            size="md"
                            radius="xl"
                            loading={isSharing}
                        >
                            Chia sẻ ảnh
                        </Button>
                    )}
                </Stack>

                <Button
                    onClick={onClose}
                    fullWidth
                    variant="subtle"
                    color="gray"
                    rightSection={<FiX size={18} />}
                    radius="xl"
                >
                    Đóng
                </Button>
            </Stack>
        </Modal>
    );
}
