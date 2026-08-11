import { Paper, Text, Box, UnstyledButton } from "@mantine/core";
import { FiAward, FiUser } from "react-icons/fi";

export default function FrameSwitcher({ selectedFrameType, onSelectFrameType }) {
    const isTsv = selectedFrameType === "tsv";
    const isCbvc = selectedFrameType === "cbvc";

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

            <Box
                style={{
                    display: "flex",
                    backgroundColor: "#F0F4FA",
                    borderRadius: "20px",
                    padding: "4px",
                    border: "1px solid rgba(15, 79, 230, 0.15)",
                }}
            >
                <UnstyledButton
                    onClick={() => onSelectFrameType("tsv")}
                    style={{
                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: "16px",
                        backgroundColor: isTsv ? "#0F4FE6" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontWeight: 700,
                        fontSize: "13px",
                        transition: "all 0.2s ease",
                        boxShadow: isTsv ? "0 4px 12px rgba(15, 79, 230, 0.3)" : "none",
                        cursor: "pointer"
                    }}
                >
                    <FiAward size={16} style={{ color: isTsv ? "#ffffff" : "#4A5568" }} />
                    <span style={{ color: isTsv ? "#ffffff" : "#4A5568", fontWeight: 700 }}>
                        Tân sinh viên
                    </span>
                </UnstyledButton>

                <UnstyledButton
                    onClick={() => onSelectFrameType("cbvc")}
                    style={{
                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: "16px",
                        backgroundColor: isCbvc ? "#0F4FE6" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontWeight: 700,
                        fontSize: "12px",
                        transition: "all 0.2s ease",
                        boxShadow: isCbvc ? "0 4px 12px rgba(15, 79, 230, 0.3)" : "none",
                        cursor: "pointer"
                    }}
                >
                    <FiUser size={16} style={{ color: isCbvc ? "#ffffff" : "#4A5568" }} />
                    <span style={{ color: isCbvc ? "#ffffff" : "#4A5568", fontWeight: 700 }}>
                        CBVC / GV / Người học
                    </span>
                </UnstyledButton>
            </Box>
        </Paper>
    );
}
