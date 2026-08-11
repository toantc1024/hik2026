import { Paper, Text, SegmentedControl, Center, Box } from "@mantine/core";
import { FiAward, FiUser } from "react-icons/fi";

export default function FrameSwitcher({ selectedFrameType, onSelectFrameType }) {
    return (
        <Paper
            p="md"
            radius="xl"
            style={{
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "1.5px solid rgba(15, 79, 230, 0.25)",
                boxShadow: "0 4px 16px rgba(15, 79, 230, 0.08)",
            }}
        >
            <Text size="xs" fw={700} mb="xs" style={{ color: "#0F4FE6", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Chọn đối tượng sử dụng frame
            </Text>

            <SegmentedControl
                value={selectedFrameType}
                onChange={onSelectFrameType}
                fullWidth
                size="md"
                radius="xl"
                color="blue"
                data={[
                    {
                        value: "tsv",
                        label: (
                            <Center style={{ gap: 6 }}>
                                <FiAward size={16} />
                                <Box component="span" style={{ fontWeight: 700, fontSize: "13px" }}>
                                    Tân sinh viên
                                </Box>
                            </Center>
                        ),
                    },
                    {
                        value: "cbvc",
                        label: (
                            <Center style={{ gap: 6 }}>
                                <FiUser size={16} />
                                <Box component="span" style={{ fontWeight: 700, fontSize: "12px" }}>
                                    CBVC / GV / Người học
                                </Box>
                            </Center>
                        ),
                    },
                ]}
                styles={{
                    root: {
                        backgroundColor: "#F0F4FA",
                        padding: "4px",
                        border: "1px solid rgba(15, 79, 230, 0.15)",
                        borderRadius: "20px",
                    },
                    indicator: {
                        backgroundColor: "#0F4FE6",
                        borderRadius: "16px",
                        boxShadow: "0 4px 12px rgba(15, 79, 230, 0.3)",
                    },
                    label: {
                        padding: "8px 4px",
                        color: "#2D3748",
                        fontWeight: 700,
                        transition: "color 0.2s ease",
                        '&[data-active]': {
                            color: "#ffffff !important",
                        }
                    }
                }}
            />
        </Paper>
    );
}
