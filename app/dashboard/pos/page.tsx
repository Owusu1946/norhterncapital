"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { CategoryTabs } from "@/components/dashboard/pos/CategoryTabs";
import { MenuGrid } from "@/components/dashboard/pos/MenuGrid";
import { OrderPanel } from "@/components/dashboard/pos/OrderPanel";

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

export default function POSPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch categories and items from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, itemsRes] = await Promise.all([
                    fetch("/api/pos/menu/categories"),
                    fetch("/api/pos/menu/items"),
                ]);

                if (catsRes.ok) {
                    const catsData = await catsRes.json();
                    setCategories(catsData.data.categories);
                }

                if (itemsRes.ok) {
                    const itemsData = await itemsRes.json();
                    setMenuItems(itemsData.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch menu data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter Items
    const filteredItems = menuItems.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category?._id === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && item.isAvailable;
    });

    const addToCart = (item: MenuItem) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.productId === item._id);
            if (existing) {
                return prev.map((i) =>
                    i.productId === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...prev,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    image: item.image,
                },
            ];
        });
    };

    const activeCategoryName = activeCategory === "all"
        ? "All"
        : categories.find(c => c._id === activeCategory)?.name || "Menu";

    return (
        <div className="flex h-screen overflow-hidden">

            {/* LEFT: Menu Area */}
            <div className="flex-1 flex flex-col p-8 pr-4 h-full overflow-hidden">

                {/* Header: Search & Info */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Choose Order</h1>

                    {/* Search Bar */}
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-6">
                    <CategoryTabs
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelect={setActiveCategory}
                    />
                </div>

                {/* Scrollable Grid */}
                <div className="flex-1 overflow-y-auto pr-2 pb-20 scrollbar-hide">
                    {/* Result Count Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">{activeCategoryName} Menu</h2>
                        <p className="text-gray-400 text-sm">{filteredItems.length} items</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-orange-500" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>No items found</p>
                            <p className="text-sm mt-1">Add items in Menu Setup</p>
                        </div>
                    ) : (
                        <MenuGrid items={filteredItems} onAddToOrder={addToCart} />
                    )}
                </div>
            </div>

            {/* RIGHT: Order Panel */}
            <div className="w-[400px] h-full border-l border-gray-100 shadow-xl z-20">
                <OrderPanel cartItems={cartItems} setCartItems={setCartItems} />
            </div>

        </div>
    );
}
