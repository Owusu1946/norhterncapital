"use client";

interface OrderCardProps {
    id: string;
    table: string;
    time: string;
    itemsCount: number;
    total: number;
    status: "active" | "completed";
    isActive?: boolean;
    onClick?: () => void;
}

export function OrderCard({ id, table, time, itemsCount, total, status, isActive, onClick }: OrderCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-[1.5rem] p-5 cursor-pointer transition-all border-2 relative overflow-hidden group
        ${isActive ? "border-orange-500 shadow-lg shadow-orange-100" : "border-transparent border-b-gray-50 hover:border-orange-200 hover:shadow-md"}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Orders : #{id}</h3>
                    <p className="text-gray-400 text-sm mt-1">Tabel : {table}</p>
                    {/* Typo 'Tabel' matches reference design, but 'Table' is better English. sticking to 'Table' generally unless requested */}
                </div>
                <span className="text-gray-400 text-xs font-medium">{time}</span>
            </div>

            <div className="flex justify-between items-end mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Qta : {itemsCount}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-gray-800">${total.toFixed(2)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white capitalize ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {status === 'active' ? 'Dine-in' : 'Completed'}
                    </span>
                </div>
            </div>
        </div>
    );
}
