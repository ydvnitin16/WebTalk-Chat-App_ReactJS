import { Info } from "lucide-react";
import { useEffect, useState } from "react";

const ServerBootBanner = () => {
    const [status, setStatus] = useState("checking");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener("online", handleStatusChange);
        window.addEventListener("offline", handleStatusChange);

        let pollInterval;

        async function checkServer() {
            if (!navigator.onLine) return;

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/health`,
                );
                const data = await res.json();

                if (data.status === "ready") {
                    setStatus("ready");
                    clearInterval(pollInterval);
                } else {
                    setStatus("booting");
                }
            } catch (err) {
                setStatus("booting");
            }
        }
        // first check
        checkServer();

        // check every 3 seconds only if not ready
        pollInterval = setInterval(() => {
            if (status !== "ready") checkServer();
        }, 3000);

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener("online", handleStatusChange);
            window.removeEventListener("offline", handleStatusChange);
        };
    }, [status]);

    // Dont show while checking or ready
    if (status === "ready" || status === "checking") return null;

    const isOffline = !isOnline;

    return (
        <div className='absolute top-0 z-[1000] w-full border-b border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90'>
            <div className='mx-auto flex min-h-12 w-full max-w-screen-2xl items-center justify-center gap-3 px-4 py-2 text-center text-sm'>
                {isOffline ? (
                    <>
                        <Info className='text-red-700' />
                        <p className='font-medium text-slate-900 dark:text-slate-100'>
                            You are currently offline . Please check your
                            connection.
                        </p>
                    </>
                ) : (
                    <>
                        <span className='relative flex h-3 w-3 shrink-0'>
                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75'></span>
                            <span className='relative inline-flex h-3 w-3 rounded-full bg-sky-500'></span>
                        </span>
                        <p className='font-medium text-slate-700 dark:text-slate-300'>
                            Server is booting up on the free host. This can take
                            a few seconds.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServerBootBanner;
