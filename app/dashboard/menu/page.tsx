"use client";

import { CategoryManager } from "@/components/dashboard/menu/CategoryManager";
import { ItemManager } from "@/components/dashboard/menu/ItemManager";

export default function MenuPage() {
    return (
        <div className="p-8 pb-20 h-full overflow-hidden flex gap-6">
            <div className="w-1/3 min-w-[300px]">
                <CategoryManager />
            </div>
            <div className="flex-1">
                <ItemManager />
            </div>
        </div>
    );
}
