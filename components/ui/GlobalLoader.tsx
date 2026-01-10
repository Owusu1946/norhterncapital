"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoaderContextType {
    setIsGlobalLoading: (isLoading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoaderContext.Provider value={{ setIsGlobalLoading: setIsLoading }}>
            {children}
            {isLoading && <GlobalLoader />}
        </LoaderContext.Provider>
    );
}

export function useGlobalLoader() {
    const context = useContext(LoaderContext);
    if (context === undefined) {
        throw new Error("useGlobalLoader must be used within a GlobalLoaderProvider");
    }
    return context;
}

function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 backdrop-blur-md transition-all duration-300">
            <div className="relative">
                {/* Sleek animated ring */}
                <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                </div>
            </div>

            {/* Subtle text */}
            <div className="absolute mt-24 text-sm font-medium text-slate-600 tracking-wider uppercase">
                Loading...
            </div>
        </div>
    );
}
