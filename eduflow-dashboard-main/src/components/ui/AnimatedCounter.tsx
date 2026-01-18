import { useEffect, useState } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
}

export function AnimatedCounter({ value, duration = 1000 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const end = value;

        const easeOutExpo = (t: number) => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easeOutExpo(progress);
            const step = Math.floor(easedProgress * end);

            setCount(step);

            if (progress < 1) {
                window.requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        window.requestAnimationFrame(animate);
    }, [value, duration]);

    return <>{count}</>;
}
