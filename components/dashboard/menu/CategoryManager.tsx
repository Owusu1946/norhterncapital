"use client";

import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Category {
    _id: string;
    name: string;
}

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/pos/menu/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        setIsAdding(true);

        try {
            const res = await fetch("/api/pos/menu/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory }),
            });

            if (res.ok) {
                const data = await res.json();
                setCategories([...categories, data.data.category]);
                setNewCategory("");
            }
        } catch (error) {
            console.error("Failed to add category:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);

        try {
            const res = await fetch(`/api/pos/menu/categories?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setCategories(categories.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete category:", error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Categories</h3>

            {/* Add Form */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="New Category Name"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-orange-500 focus:outline-none transition-all text-sm font-medium"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newCategory.trim() || isAdding}
                    className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isAdding ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-orange-500" />
                    </div>
                ) : categories.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No categories yet</p>
                ) : (
                    categories.map((cat) => (
                        <div key={cat._id} className="group flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <span className="font-medium text-gray-700">{cat.name}</span>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                disabled={deletingId === cat._id}
                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                {deletingId === cat._id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
