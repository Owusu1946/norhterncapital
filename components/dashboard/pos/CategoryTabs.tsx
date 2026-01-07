"use client";

import { LayoutGrid } from "lucide-react";

interface Category {
    _id: string;
    name: string;
}

interface CategoryTabsProps {
    categories: Category[];
    activeCategory: string;
    onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    return (
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mask-gradient">
            {/* All Menu Tab */}
            <button
                onClick={() => onSelect("all")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${activeCategory === "all"
                        ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:text-orange-500"
                    }`}
            >
                <LayoutGrid size={16} />
                <span>All Items</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => (
                <button
                    key={cat._id}
                    onClick={() => onSelect(cat._id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${activeCategory === cat._id
                            ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:text-orange-500"
                        }`}
                >
                    <span>{cat.name}</span>
                </button>
            ))}
        </div>
    );
}
