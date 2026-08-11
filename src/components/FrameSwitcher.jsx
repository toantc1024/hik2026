import { Paper, Text, SegmentedControl, Center, Box } from "@mantine/core";
import { FiAward, FiUser } from "react-icons/fi";

export default function FrameSwitcher({ selectedFrameType, onSelectFrameType }) {
    return (
        <Paper
            p="md"
            radius="xl"
            style={{
                borderRadius: "24px",
                background: "linear-gradient(135deg, rgba(240, 246, 255, 0.95) 0%, rgba(255, 246, 247, 0.95) 100%)",
                border: "1.5px solid rgba(15, 79, 230, 0.2)",
                boxShadow: "0 4px 16px rgba(0, 102, 204, 0.08)",
            }}
        >
            <Text size="xs" fw={700} mb="xs" style={{ color: "#072E8A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                                <Box component="span" style={{ fontWeight: 600, fontSize: "13px" }}>
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
                                <Box component="span" style={{ fontWeight: 600, fontSize: "12px" }}>
                                    CBVC / GV / Người học
                                </Box>
                            </Center>
                        ),
                    },
                ]}
                styles={{
                    root: {
                        backgroundColor: "#ffffff",
                        padding: "4px",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        borderRadius: "20px",
                    },
                    indicator: {
                        backgroundImage: selectedFrameType === "cbvc"
                            ? "linear-gradient(135deg, #E11D2E 0%, #D99E00 100%)"
                            : "linear-gradient(135deg, #0F4FE6 0%, #E11D2E 100%)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 12px rgba(15, 79, 230, 0.25)",
                    },
                    label: {
                        padding: "8px 4px",
                        color: "#2D3748",
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
