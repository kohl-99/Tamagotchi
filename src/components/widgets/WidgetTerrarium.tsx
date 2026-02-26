"use client";

import { useWidgetStore } from "@/store/useWidgetStore";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { ZenClock } from "./ZenClock";
import { VibePlayer } from "./VibePlayer";

/* ══════════════════════════════════════════════════════════
   WIDGET TERRARIUM — Iterates over all placed widgets,
   wraps each in DraggableWidgetWrapper for free drag-placement,
   and renders the correct widget component by type.
   ══════════════════════════════════════════════════════════ */

export function WidgetTerrarium() {
    const widgets = useWidgetStore((s) => s.widgets);

    return (
        <>
            {widgets.map((widget) => (
                <DraggableWidgetWrapper key={widget.id} widget={widget}>
                    {widget.type === "clock" && <ZenClock />}
                    {widget.type === "music_player" && <VibePlayer />}
                </DraggableWidgetWrapper>
            ))}
        </>
    );
}
