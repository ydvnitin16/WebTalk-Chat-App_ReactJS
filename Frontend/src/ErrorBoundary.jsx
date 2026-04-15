import { Rotate3D, RotateCcw, RotateCw } from "lucide-react";
import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='h-screen w-full absolute flex items-center justify-center'>
                    <div className='text-center'>
                        <h1 className='text-xl font-semibold text-black dark:text-white '>
                            Something went wrong
                        </h1>
                        <button
                            onClick={() => window.location.reload()}
                            className='inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:opacity-70 cursor-pointer'
                        >
                            <RotateCw size={18} /> Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
