"use client";

interface DishItem {
    id: string;
    name: string;
    image?: string;
    metaPrimary: string;
    metaSecondary?: string;
    metaColor?: string;
}

interface DishListProps {
    title: string;
    items: DishItem[];
    actionLabel?: string;
}

export function DishList({ title, items, actionLabel = "View all" }: DishListProps) {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                </div>
                <div className="text-center py-8 text-gray-400">
                    <p>No data yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <button className="text-sm text-orange-500 font-bold hover:underline flex items-center gap-1">
                    {actionLabel} &rarr;
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-orange-50 flex items-center justify-center">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-orange-400 font-bold text-lg">{item.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                            <p className={`text-xs font-semibold mt-1 ${item.metaColor || "text-gray-500"}`}>
                                {item.metaPrimary}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
