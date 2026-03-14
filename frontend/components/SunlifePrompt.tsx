"use client";

import { useEffect, useCallback, useState } from "react";

/* ─── Types ─── */
interface SunlifePromptProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/* ─── Component ─── */
export function SunlifePrompt({ isOpen, onClose, onConfirm }: SunlifePromptProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const id = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(id);
        }
        setIsVisible(false);
    }, [isOpen]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            onClick={onClose}
        >
            {/* ── Outer pixel border ── */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative transform transition-all duration-300 ease-out ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-3"
                    }`}
            >
                {/* Pixel shadow layer */}
                <div
                    className="absolute inset-0 translate-x-1 translate-y-1"
                    style={{
                        backgroundColor: "#8B6914",
                        borderRadius: "6px",
                    }}
                />

                {/* Main panel */}
                <div
                    className="relative"
                    style={{
                        width: "420px",
                        maxWidth: "92vw",
                        backgroundColor: "#D4B896",
                        border: "4px solid #6B4E2A",
                        borderRadius: "6px",
                        boxShadow: "inset 0 0 0 2px #E8D5B7, inset 0 0 0 4px #C4A882",
                    }}
                >
                    {/* ── Close button (X) — top right, pixel style ── */}
                    <button
                        onClick={onClose}
                        className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        style={{
                            backgroundColor: "#C4A06A",
                            border: "3px solid #6B4E2A",
                            borderRadius: "4px",
                            boxShadow: "1px 2px 0 #6B4E2A",
                            color: "#5A3D1A",
                            fontWeight: 900,
                            fontSize: "16px",
                            fontFamily: "monospace",
                            lineHeight: 1,
                        }}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    {/* ── Inner content area ── */}
                    <div className="px-7 pb-7 pt-6">
                        {/* Sun Life Logo */}
                        <div className="mb-1 flex justify-center">
                            <img
                                src="/sunlife-logo.png"
                                alt="Sun Life"
                                style={{ width: "64px", height: "auto" }}
                            />
                        </div>

                        {/* Title */}
                        <h2
                            className="mb-5 text-center"
                            style={{
                                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                                fontSize: "14px",
                                letterSpacing: "2px",
                                color: "#4A3520",
                                textShadow: "1px 1px 0 rgba(0,0,0,0.1)",
                            }}
                        >
                            SUN LIFE BOOTH
                        </h2>

                        {/* Message bubble */}
                        <div
                            className="mb-6"
                            style={{
                                backgroundColor: "#EBD9BE",
                                border: "3px solid #B8975A",
                                borderRadius: "4px",
                                padding: "16px 18px",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: "'Press Start 2P', 'Courier New', monospace",
                                    fontSize: "10px",
                                    lineHeight: "22px",
                                    color: "#4A3520",
                                }}
                            >
                                Hi there! Do you want to see the Sun Life insurance plan that
                                best applies to your dental treatment?
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            {/* YES */}
                            <button
                                onClick={onConfirm}
                                className="flex-1 transition-all duration-150 hover:brightness-95 active:translate-y-[1px]"
                                style={{
                                    backgroundColor: "#EBD9BE",
                                    border: "3px solid #B8975A",
                                    borderRadius: "4px",
                                    padding: "12px 0",
                                    fontFamily: "'Press Start 2P', 'Courier New', monospace",
                                    fontSize: "12px",
                                    color: "#4A3520",
                                    cursor: "pointer",
                                    boxShadow: "0 3px 0 #8B6914, inset 0 1px 0 rgba(255,255,255,0.3)",
                                    textShadow: "1px 1px 0 rgba(0,0,0,0.08)",
                                }}
                            >
                                YES
                            </button>

                            {/* NO */}
                            <button
                                onClick={onClose}
                                className="flex-1 transition-all duration-150 hover:brightness-95 active:translate-y-[1px]"
                                style={{
                                    backgroundColor: "#EBD9BE",
                                    border: "3px solid #B8975A",
                                    borderRadius: "4px",
                                    padding: "12px 0",
                                    fontFamily: "'Press Start 2P', 'Courier New', monospace",
                                    fontSize: "12px",
                                    color: "#4A3520",
                                    cursor: "pointer",
                                    boxShadow: "0 3px 0 #8B6914, inset 0 1px 0 rgba(255,255,255,0.3)",
                                    textShadow: "1px 1px 0 rgba(0,0,0,0.08)",
                                }}
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Hook ─── */
export function useSunlifePrompt() {
    const [isOpen, setIsOpen] = useState(false);

    const openSunlifePrompt = useCallback(() => setIsOpen(true), []);
    const closeSunlifePrompt = useCallback(() => setIsOpen(false), []);

    return { isOpen, openSunlifePrompt, closeSunlifePrompt };
}
