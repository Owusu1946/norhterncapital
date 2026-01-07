"use client";

import { Plus } from "lucide-react";
import { useRef, useEffect } from "react";

interface Category {
    _id: string;
    name: string;
}

interface MenuItem {
    _id: string;
    name: string;
    price: number;
    category: Category;
    image?: string;
    isAvailable: boolean;
}

interface MenuGridProps {
    items: MenuItem[];
    onAddToOrder: (item: MenuItem) => void;
}

export function MenuGrid({ items, onAddToOrder }: MenuGridProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("/sounds/beep.mp3");
        // Preload the audio to avoid delay on first click
        audioRef.current.load();
    }, []);

    const playBeep = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0; // Reset to start for rapid clicks
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const handleClick = (item: MenuItem) => {
        if (item.isAvailable) {
            playBeep();
            onAddToOrder(item);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
                <div
                    key={item._id}
                    onClick={() => handleClick(item)}
                    className={`bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group flex flex-col h-full relative overflow-hidden active:scale-95 duration-100 ${!item.isAvailable ? "opacity-60 grayscale cursor-not-allowed" : ""
                        }`}
                >
                    {/* Image Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-200 bg-orange-50">
                                {item.name.charAt(0)}
                            </div>
                        )}

                        {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                            </div>
                        )}

                        {/* Hover Overlay with Add Button */}
                        {item.isAvailable && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-end p-2">
                                <button className="w-8 h-8 rounded-full bg-white text-orange-500 shadow-lg flex items-center justify-center transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide font-medium">{item.category?.name}</p>

                        <div className="mt-auto flex items-center justify-between">
                            <span className="font-black text-gray-900 text-lg">
                                <span className="text-xs align-top text-orange-500 mr-0.5">GH₵</span>
                                {item.price.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
