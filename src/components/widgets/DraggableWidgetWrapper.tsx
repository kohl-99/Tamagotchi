"use client";

import { type ReactNode, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useWidgetStore, type PlacedWidget } from "@/store/useWidgetStore";

/* ══════════════════════════════════════════════════════════
   DRAGGABLE WIDGET WRAPPER
   Wraps any widget with free-form Framer Motion drag.
   On dragEnd: accumulated delta is added to stored (x, y),
   motion values reset to 0 — giving precise, persistent placement.
   ══════════════════════════════════════════════════════════ */

export function DraggableWidgetWrapper({
    widget,
    children,
}: {
    widget: PlacedWidget;
    children: ReactNode;
}) {
    const updatePosition = useWidgetStore((s) => s.updatePosition);
    const [isDragging, setIsDragging] = useState(false);

    /* Tracks only the live drag delta — accumulated offset is in the store */
    const dx = useMotionValue(0);
    const dy = useMotionValue(0);

    return (
        <motion.div
            className="fixed select-none"
            style={{
                left: widget.x,
                top: widget.y,
                x: dx,
                y: dy,
                zIndex: isDragging ? 200 : 60,
                cursor: isDragging ? "grabbing" : "grab",
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            whileDrag={{ scale: 1.03 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => {
                setIsDragging(false);
                /* Commit new absolute position and reset delta */
                updatePosition(widget.id, widget.x + dx.get(), widget.y + dy.get());
                dx.set(0);
                dy.set(0);
            }}
        >
            {/* Subtle drag indicator — tiny dots top-center */}
            <div
                className="absolute left-1/2 -translate-x-1/2 -top-3 flex gap-1 opacity-0 transition-opacity duration-200"
                style={{ opacity: isDragging ? 0 : undefined }}
                data-drag-handle
            >
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-1 w-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.2)" }}
                    />
                ))}
            </div>

            {children}
        </motion.div>
    );
}
