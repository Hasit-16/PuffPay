"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    format?: (val: number) => string;
}

export default function AnimatedNumber({ value, duration = 500, format }: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const startValue = displayValue;
        const endValue = value;
        const difference = endValue - startValue;

        if (difference === 0) return;

        const animate = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quad
            const easeOutProgress = 1 - (1 - percentage) * (1 - percentage);

            const currentVal = startValue + (difference * easeOutProgress);
            setDisplayValue(currentVal);

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    if (format) {
        return <>{format(displayValue)}</>;
    }

    return <>{Math.round(displayValue)}</>;
}
