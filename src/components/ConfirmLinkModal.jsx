import { Modal, Button, Group, Text, Stack } from "@mantine/core";
import { FiExternalLink, FiX } from "react-icons/fi";

export default function ConfirmLinkModal({ opened, onClose, url, title }) {
    const handleConfirm = () => {
        window.open(url, "_blank");
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text size="lg" fw={600}>
                    Xác nhận mở liên kết
                </Text>
            }
            centered
            radius="xl"
            padding="lg"
        >
            <Stack spacing="md">
                <Text size="sm" c="dimmed" mt="md">
                    Bạn có muốn mở trang "{title}" trong tab mới không?
                </Text>

                <Text
                    size="xs"
                    c="blue"
                    style={{
                        wordBreak: "break-all",
                        background: "var(--mantine-color-blue-0)",
                        padding: "8px 12px",
                        borderRadius: "8px"
                    }}
                >
                    {url}
                </Text>

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        leftSection={<FiX size={16} />}
                        radius={24}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        leftSection={<FiExternalLink size={16} />}
                        radius={24}
                    >
                        Mở liên kết
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
