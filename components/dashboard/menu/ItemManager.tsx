"use client";

import { Plus, Edit2, Trash2, X, Loader2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Category {
    _id: string;
    name: string;
}

interface Item {
    _id: string;
    name: string;
    price: number;
    category: Category;
    image?: string;
    isAvailable: boolean;
}

export function ItemManager() {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // Form State
    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formImage, setFormImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            const [itemsRes, catsRes] = await Promise.all([
                fetch("/api/pos/menu/items"),
                fetch("/api/pos/menu/categories"),
            ]);

            if (itemsRes.ok) {
                const itemsData = await itemsRes.json();
                setItems(itemsData.data.items);
            }

            if (catsRes.ok) {
                const catsData = await catsRes.json();
                setCategories(catsData.data.categories);
                if (catsData.data.categories.length > 0 && !formCategory) {
                    setFormCategory(catsData.data.categories[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/pos/menu/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormImage(data.data.url);
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
        } finally {
            setUploadingImage(false);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormName("");
        setFormPrice("");
        setFormImage(null);
        if (categories.length > 0) {
            setFormCategory(categories[0]._id);
        }
        setIsModalOpen(true);
    };

    const openEditModal = (item: Item) => {
        setEditingItem(item);
        setFormName(item.name);
        setFormPrice(item.price.toString());
        setFormCategory(item.category._id);
        setFormImage(item.image || null);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formName || !formPrice || !formCategory) return;
        setIsSubmitting(true);

        try {
            if (editingItem) {
                // Update existing item
                const res = await fetch("/api/pos/menu/items", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingItem._id,
                        name: formName,
                        price: formPrice,
                        category: formCategory,
                        image: formImage,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setItems(items.map(i => i._id === editingItem._id ? data.data.item : i));
                    closeModal();
                }
            } else {
                // Create new item
                const res = await fetch("/api/pos/menu/items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formName,
                        price: formPrice,
                        category: formCategory,
                        image: formImage,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setItems([data.data.item, ...items]);
                    closeModal();
                }
            }
        } catch (error) {
            console.error("Failed to save item:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormName("");
        setFormPrice("");
        setFormImage(null);
        if (categories.length > 0) {
            setFormCategory(categories[0]._id);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        setDeletingId(id);

        try {
            const res = await fetch(`/api/pos/menu/items?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setItems(items.filter(i => i._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">Menu Items</h3>
                <button
                    onClick={openAddModal}
                    disabled={categories.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 disabled:opacity-50"
                >
                    <Plus size={16} />
                    Add Item
                </button>
            </div>

            {categories.length === 0 && !isLoading && (
                <div className="text-center text-gray-400 py-8">
                    <p>Create a category first before adding items</p>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-orange-500" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No items yet</p>
                ) : (
                    items.map((item) => (
                        <div key={item._id} className="flex gap-4 p-3 rounded-2xl border border-gray-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all group">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-bold">
                                        {item.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                                    <span className="font-bold text-orange-500 text-sm">GH₵{item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{item.category?.name || "Uncategorized"}</p>
                            </div>
                            <div className="flex flex-col justify-center gap-2 border-l border-gray-100 pl-3">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    disabled={deletingId === item._id}
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    {deletingId === item._id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        <h3 className="font-bold text-xl text-gray-800 mb-6">
                            {editingItem ? "Edit Item" : "Add New Item"}
                        </h3>

                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Item Image</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-32 w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${formImage ? "border-orange-500" : "border-gray-200 hover:border-orange-300"
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    {uploadingImage ? (
                                        <Loader2 size={24} className="animate-spin text-orange-500" />
                                    ) : formImage ? (
                                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Upload size={24} className="mx-auto mb-1" />
                                            <p className="text-xs">Click to upload</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-orange-500 focus:bg-white focus:outline-none border-2 transition-all font-medium"
                                    placeholder="e.g. Spicy Noodles"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (GH₵)</label>
                                    <input
                                        type="number"
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-orange-500 focus:bg-white focus:outline-none border-2 transition-all font-medium"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-orange-500 focus:bg-white focus:outline-none border-2 transition-all font-medium appearance-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!formName || !formPrice || !formCategory || isSubmitting}
                                className="w-full py-4 mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    editingItem ? "Update Item" : "Save Item"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
