export const sortTimelineItems = (items = []) =>
    [...items].sort((a, b) => {
        const timeDiff =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();

        if (timeDiff !== 0) return timeDiff;

        return String(a?.data?._id || "").localeCompare(
            String(b?.data?._id || ""),
        );
    });
