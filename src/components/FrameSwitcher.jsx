import { useRef } from "react";
import { Box, UnstyledButton } from "@mantine/core";
import { FiAward, FiUser } from "react-icons/fi";

export default function FrameSwitcher({ selectedFrameType, onSelectFrameType }) {
    const isTsv = selectedFrameType === "tsv";
    const isCbvc = selectedFrameType === "cbvc";
    const trackRef = useRef(null);
    const touchStartRef = useRef(null);

    // iOS Touch Start & Touch End gesture handling
    const handleTouchStart = (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartRef.current = e.touches[0].clientX;
        }
    };

    const handleTouchEnd = (e) => {
        if (touchStartRef.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const deltaX = touchEnd - touchStartRef.current;

        if (deltaX > 25) {
            // Swiped right -> CBVC / GV / Người học
            onSelectFrameType("cbvc");
        } else if (deltaX < -25) {
            // Swiped left -> Tân sinh viên
            onSelectFrameType("tsv");
        } else if (trackRef.current) {
            // Tap / Touch location determination
            const rect = trackRef.current.getBoundingClientRect();
            const relativeX = touchEnd - rect.left;
            if (relativeX < rect.width / 2) {
                onSelectFrameType("tsv");
            } else {
                onSelectFrameType("cbvc");
            }
        }

        touchStartRef.current = null;
    };

    return (
        <Box
            ref={trackRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
                position: "relative",
                display: "flex",
                width: "100%",
                backgroundColor: "#EEF2F6",
                borderRadius: "100px",
                padding: "4px",
                border: "1.5px solid rgba(15, 79, 230, 0.25)",
                boxShadow: "0 4px 14px rgba(15, 79, 230, 0.1)",
                overflow: "hidden",
                userSelect: "none",
                touchAction: "pan-y"
            }}
        >
            {/* iOS Active Sliding Pill */}
            <Box
                style={{
                    position: "absolute",
                    top: "4px",
                    bottom: "4px",
                    left: "4px",
                    width: "calc(50% - 4px)",
                    borderRadius: "100px",
                    backgroundColor: "#0F4FE6",
                    transform: isCbvc ? "translateX(100%)" : "translateX(0%)",
                    transition: "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    boxShadow: "0 3px 10px rgba(15, 79, 230, 0.35)",
                    zIndex: 1
                }}
            />

            {/* Tab Buttons */}
            <UnstyledButton
                onClick={() => onSelectFrameType("tsv")}
                style={{
                    flex: 1,
                    padding: "11px 4px",
                    borderRadius: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 2,
                    transition: "color 0.2s ease"
                }}
            >
                <FiAward size={15} style={{ color: isTsv ? "#ffffff" : "#334155", flexShrink: 0 }} />
                <span style={{
                    color: isTsv ? "#ffffff" : "#334155",
                    fontWeight: 700,
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                }}>
                    Tân sinh viên
                </span>
            </UnstyledButton>

            <UnstyledButton
                onClick={() => onSelectFrameType("cbvc")}
                style={{
                    flex: 1,
                    padding: "11px 4px",
                    borderRadius: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 2,
                    transition: "color 0.2s ease"
                }}
            >
                <FiUser size={15} style={{ color: isCbvc ? "#ffffff" : "#334155", flexShrink: 0 }} />
                <span style={{
                    color: isCbvc ? "#ffffff" : "#334155",
                    fontWeight: 700,
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                }}>
                    CBVC / GV / Người học
                </span>
            </UnstyledButton>
        </Box>
    );
}
