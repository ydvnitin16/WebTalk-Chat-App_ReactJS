import { formatCallDuration } from "@/utils/utils";
import { useEffect, useState } from "react";

const useDurationTimer = (startTime) => {
    const [duration, setDuration] = useState("00:00");

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            setDuration(formatCallDuration(startTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return { duration };
};

export default useDurationTimer;
