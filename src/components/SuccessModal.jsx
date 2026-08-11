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
    const [isSharing, setIsSharing] = useState(false);
    const [shareError, setShareError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const info = detectWebView();
            setWebViewInfo(info);
            setShareError(null);
        }
    }, [isOpen]);

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

    // Handle share via Web Share API with robust fallbacks for all browsers/webviews
    const handleShare = async () => {
        if (!imageUrl) return;

        setIsSharing(true);
        setShareError(null);

        try {
            // Convert blob URL to blob & file
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName || 'khung_anh_dai_dien.png', { type: 'image/png' });

            // 1. Try file share via Web Share API
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Khung ảnh đại diện',
                });
            } else if (navigator.share) {
                // 2. Try link/text share via Web Share API
                await navigator.share({
                    title: 'Khung ảnh đại diện',
                    text: 'Khung ảnh đại diện của tôi',
                    url: window.location.href,
                });
            } else if (navigator.clipboard && window.ClipboardItem) {
                // 3. Fallback: copy image to clipboard
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                    alert("Đã sao chép ảnh vào bộ nhớ tạm!");
                } catch (clipErr) {
                    await handleDownload();
                }
            } else {
                // 4. Fallback: trigger download
                await handleDownload();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                await handleDownload();
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <FiCheck size={18} color="green" />
                    <Text fw={600} size="md">Thành công</Text>
                </Group>
            }
            size="md"
            centered
            radius="xl"
            styles={{
                content: {
                    borderRadius: '24px',
                    maxHeight: '90vh',
                },
                header: {
                    borderRadius: '24px 24px 0 0',
                    paddingBottom: '4px',
                },
                body: {
                    maxHeight: '75vh',
                    overflowY: 'auto',
                    paddingBottom: '12px',
                }
            }}
        >
            <Stack gap="xs" style={{ paddingTop: '2px' }}>
                <Box style={{
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#333'
                }}>
                    Ảnh đã được xử lý thành công!
                </Box>

                {/* Preview image */}
                {imageUrl && (
                    <Box
                        style={{
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '0.5rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt="Ảnh đã tạo"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '130px',
                                objectFit: 'contain',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                        />
                    </Box>
                )}

                {/* In-app browser warning and instructions */}
                {webViewInfo.isInAppBrowser && (
                    <Alert
                        icon={<FiAlertCircle size={16} />}
                        title={`Đang mở trong ${webViewInfo.appName}`}
                        color="blue"
                        radius="md"
                        p="xs"
                    >
                        <Text size="xs">
                            Để lưu ảnh, chọn <strong>"Chia sẻ ảnh"</strong> hoặc <strong>"Tải ảnh xuống"</strong> bên dưới.
                        </Text>
                    </Alert>
                )}

                {/* Share error message */}
                {shareError && (
                    <Alert color="red" radius="md" p="xs">
                        <Text size="xs">{shareError}</Text>
                    </Alert>
                )}

                {/* Action buttons */}
                <Stack gap="xs" mt="xs">
                    {imageUrl && (
                        <>
                            <Button
                                onClick={handleDownload}
                                fullWidth
                                variant="gradient"
                                gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                                leftSection={<FiDownload size={18} />}
                                size="md"
                                radius="xl"
                                style={{ borderRadius: '20px' }}
                            >
                                Tải ảnh xuống
                            </Button>

                            <Button
                                onClick={handleShare}
                                fullWidth
                                variant="filled"
                                color="blue"
                                leftSection={<FiShare2 size={18} />}
                                size="md"
                                radius="xl"
                                loading={isSharing}
                                style={{
                                    backgroundColor: '#0F4FE6',
                                    color: '#ffffff',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 12px rgba(15, 79, 230, 0.2)'
                                }}
                            >
                                Chia sẻ ảnh
                            </Button>
                        </>
                    )}
                </Stack>

                <Button
                    onClick={onClose}
                    fullWidth
                    variant="subtle"
                    color="gray"
                    rightSection={<FiX size={16} />}
                    size="xs"
                    radius="xl"
                    mt="2px"
                >
                    Đóng
                </Button>
            </Stack>
        </Modal>
    );
}
