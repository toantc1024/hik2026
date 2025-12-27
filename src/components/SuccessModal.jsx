import { useState } from "react";
import { Modal, Button, Group, Stack, Text, Anchor } from "@mantine/core";
import { FiCheck, FiX, FiDownload } from "react-icons/fi";

export default function SuccessModal({ isOpen, onClose, imageUrl, fileName }) {
    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group>
                    <FiCheck size={20} color="green" />
                    Thành công
                </Group>
            }
            size="sm"
        >
            <Stack spacing="md">
                <div style={{
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    marginTop: '12px'
                }}>Ảnh đã được tải xuống thành công!</div>

                {imageUrl && (
                    <Text align="center" size="sm" color="dimmed" my="xs">
                        <Anchor
                            href={imageUrl}
                            download={fileName}
                            target="_blank"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 500
                            }}
                        >
                            <FiDownload size={16} />
                            Nếu không tự động tải về, ấn vào đây
                        </Anchor>
                    </Text>
                )}

                <Button
                    onClick={onClose}
                    fullWidth
                    rightIcon={<FiX size={20} />}
                >
                    Đóng
                </Button>
            </Stack>
        </Modal>
    );
}
