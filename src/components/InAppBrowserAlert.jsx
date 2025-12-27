import { useState, useEffect } from "react";
import { Modal, Button, Stack, Text, Alert, Box } from "@mantine/core";
import { FiAlertTriangle, FiExternalLink } from "react-icons/fi";

// Detect if running in a WebView (Zalo, Facebook, Messenger, etc.)
function detectWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    const isZalo = /Zalo/i.test(ua);
    const isFacebookApp = /FBAN|FBAV|FB_IAB/i.test(ua);
    const isMessenger = /Messenger/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isLine = /Line/i.test(ua);
    const isWeChat = /MicroMessenger/i.test(ua);
    const isViber = /Viber/i.test(ua);
    const isWebView = /(wv|WebView)/i.test(ua);

    const isInAppBrowser = isZalo || isFacebookApp || isMessenger || isInstagram || isLine || isWeChat || isViber || isWebView;

    const appName = isZalo ? 'Zalo' :
        isFacebookApp ? 'Facebook' :
            isMessenger ? 'Messenger' :
                isInstagram ? 'Instagram' :
                    isLine ? 'Line' :
                        isWeChat ? 'WeChat' :
                            isViber ? 'Viber' :
                                'ứng dụng này';

    return { isInAppBrowser, appName };
}

export default function InAppBrowserAlert() {
    const [isOpen, setIsOpen] = useState(false);
    const [webViewInfo, setWebViewInfo] = useState({ isInAppBrowser: false, appName: '' });

    useEffect(() => {
        const info = detectWebView();
        setWebViewInfo(info);

        // Show alert if in-app browser detected
        if (info.isInAppBrowser) {
            // Check if user dismissed before (session storage)
            const dismissed = sessionStorage.getItem('inAppBrowserAlertDismissed');
            if (!dismissed) {
                setIsOpen(true);
            }
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('inAppBrowserAlertDismissed', 'true');
        setIsOpen(false);
    };

    if (!webViewInfo.isInAppBrowser) {
        return null;
    }

    return (
        <Modal
            opened={isOpen}
            onClose={handleDismiss}
            title={
                <Text fw={700} size="lg" c="orange">
                    ⚠️ Lưu ý quan trọng
                </Text>
            }
            centered
            radius="xl"
            size="md"
            styles={{
                content: {
                    borderRadius: '24px',
                },
                header: {
                    borderRadius: '24px 24px 0 0',
                }
            }}
        >
            <Stack gap="md" style={{ paddingTop: '1rem' }}>
                <Alert
                    icon={<FiAlertTriangle size={20} />}
                    color="orange"
                    radius="lg"
                    variant="light"
                >
                    <Text size="sm" fw={500}>
                        Bạn đang mở trong <strong>{webViewInfo.appName}</strong>
                    </Text>
                </Alert>

                <Box>
                    <Text size="sm" mb="xs">
                        Để <strong>tải ảnh về máy</strong> dễ dàng hơn, vui lòng mở trang này trong trình duyệt:
                    </Text>

                    <Stack gap="xs" mt="md">
                        <Box style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <Text size="sm" fw={500} mb="xs">
                                Cách mở trong trình duyệt:
                            </Text>
                            <Text size="sm" c="dimmed">
                                1. Nhấn vào dấu <strong>⋮</strong> hoặc <strong>⋯</strong> (góc trên bên phải màn hình)
                            </Text>
                            <Text size="sm" c="dimmed">
                                2. Chọn <strong>"Mở trong trình duyệt"</strong> hoặc <strong>"Open in Browser"</strong>
                            </Text>
                        </Box>
                    </Stack>
                </Box>

                <Text size="xs" c="dimmed" ta="center">
                    Nếu bạn vẫn muốn tiếp tục trong {webViewInfo.appName}, hãy nhấn "Tiếp tục" bên dưới.
                </Text>

                <Stack gap="sm">
                    <Button
                        onClick={handleDismiss}
                        fullWidth
                        variant="gradient"
                        gradient={{ from: 'blue.6', to: 'purple.6', deg: 135 }}
                        leftSection={<FiExternalLink size={18} />}
                        size="md"
                        radius="xl"
                    >
                        Tiếp tục trong {webViewInfo.appName}
                    </Button>
                </Stack>
            </Stack>
        </Modal>
    );
}
