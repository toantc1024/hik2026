import { useState, useRef } from "react";
import { Paper, Text, Group, Box, Badge } from "@mantine/core";
import { FiUser, FiAward, FiMove } from "react-icons/fi";

const FRAME_OPTIONS = [
    {
        id: "tsv",
        label: "Tân sinh viên",
        shortLabel: "Tân sinh viên",
        icon: FiAward,
        gradient: "linear-gradient(135deg, #0F4FE6 0%, #E11D2E 100%)",
        color: "#0F4FE6",
        badge: "TÂN SINH VIÊN"
    },
    {
        id: "cbvc",
        label: "CBVC / Giảng viên / Người học",
        shortLabel: "CBVC / GV / NH",
        icon: FiUser,
        gradient: "linear-gradient(135deg, #E11D2E 0%, #D99E00 100%)",
        color: "#E11D2E",
        badge: "CBVC / GV / NH"
    }
];

export default function FrameSwitcher({ selectedFrameType, onSelectFrameType }) {
    const [isDraggingKnob, setIsDraggingKnob] = useState(false);
    const containerRef = useRef(null);

    // HTML5 Drag & drop handler to allow dragging options directly onto canvas
    const handleDragStart = (e, frameId) => {
        e.dataTransfer.setData("frameType", frameId);
        e.dataTransfer.effectAllowed = "copy";
    };

    // Pointer/touch drag handling to slide between options inside the switcher
    const handlePointerDown = () => {
        setIsDraggingKnob(true);
    };

    const handlePointerMove = (e) => {
        if (!isDraggingKnob || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const ratio = relativeX / rect.width;

        if (ratio < 0.5 && selectedFrameType !== "tsv") {
            onSelectFrameType("tsv");
        } else if (ratio >= 0.5 && selectedFrameType !== "cbvc") {
            onSelectFrameType("cbvc");
        }
    };

    const handlePointerUp = () => {
        setIsDraggingKnob(false);
    };

    return (
        <Paper
            p="md"
            radius="xl"
            style={{
                borderRadius: "24px",
                background: "linear-gradient(135deg, rgba(240, 246, 255, 0.95) 0%, rgba(255, 246, 247, 0.95) 100%)",
                border: "1.5px solid rgba(15, 79, 230, 0.2)",
                boxShadow: "0 4px 16px rgba(0, 102, 204, 0.08)",
                userSelect: "none"
            }}
        >
            <Group justify="space-between" align="center" mb="xs">
                <Text size="xs" fw={700} style={{ color: "#072E8A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Mẫu khung đối tượng
                </Text>
                <Text size="10px" color="dimmed" style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <FiMove size={12} /> Kéo/chạm để đổi khung
                </Text>
            </Group>

            {/* Gradient Switcher Track */}
            <Box
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{
                    position: "relative",
                    display: "flex",
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "4px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                    touchAction: "none",
                    cursor: "pointer"
                }}
            >
                {FRAME_OPTIONS.map((option) => {
                    const isSelected = selectedFrameType === option.id;
                    const Icon = option.icon;

                    return (
                        <Box
                            key={option.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, option.id)}
                            onClick={() => onSelectFrameType(option.id)}
                            style={{
                                flex: 1,
                                position: "relative",
                                zIndex: 2,
                                padding: "10px 6px",
                                borderRadius: "16px",
                                textAlign: "center",
                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                background: isSelected ? option.gradient : "transparent",
                                color: isSelected ? "#ffffff" : "#4A5568",
                                boxShadow: isSelected ? "0 4px 12px rgba(15, 79, 230, 0.25)" : "none",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px"
                            }}
                        >
                            <Group gap="6px" justify="center">
                                <Icon size={16} style={{ filter: isSelected ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" : "none" }} />
                                <Text
                                    fw={isSelected ? 700 : 600}
                                    size="xs"
                                    style={{
                                        color: isSelected ? "#ffffff" : "#2D3748",
                                        lineHeight: 1.2
                                    }}
                                >
                                    {option.label}
                                </Text>
                            </Group>

                            {isSelected && (
                                <Badge
                                    size="xs"
                                    variant="white"
                                    style={{
                                        color: option.color,
                                        fontWeight: 700,
                                        fontSize: "9px",
                                        padding: "0 6px",
                                        height: "16px",
                                        marginTop: "2px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                                    }}
                                >
                                    Đang dùng
                                </Badge>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
