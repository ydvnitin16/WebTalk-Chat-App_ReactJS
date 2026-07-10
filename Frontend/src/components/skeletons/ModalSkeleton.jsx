const ModalSkeleton = () => {
    return (
        <div className='absolute h-screen w-full flex justify-center items-center'>
            <div className='flex flex-col justify-center gap-2 h-[50vh] w-[50vw] z-100 rounded-2xl p-6 space-y-4 bg-white dark:bg-zinc-900'>
                <div className='flex justify-center'>
                    <div className='w-40 h-40 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse' />
                </div>

                <div className='h-4 w-1/2 mx-auto bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse' />

                    <div
                        className='h-10 w-full bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse'
                    />

                <div className='h-10 w-full bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse' />
            </div>
        </div>
    );
};
export default ModalSkeleton;
