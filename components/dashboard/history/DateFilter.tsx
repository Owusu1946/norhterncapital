"use client";

import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function DateFilter() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState("Juni 2022"); // Matches design

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
                <CalendarIcon size={18} className="text-gray-500" />
                28 Jun, 2022
                <ChevronDown size={18} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50">
                    <div className="flex justify-between items-center mb-6">
                        <button className="text-gray-400 hover:text-gray-600"><ChevronLeft size={20} /></button>
                        <h4 className="font-bold text-gray-800">{currentMonth}</h4>
                        <button className="text-gray-400 hover:text-gray-600"><ChevronRight size={20} /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                            <span key={day} className="text-sm font-bold text-gray-800">{day}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        {/* Grayed out past month */}
                        {['27', '28', '29', '30'].map(d => (
                            <span key={`prev-${d}`} className="text-gray-300 py-2">{d}</span>
                        ))}
                        {/* Current month */}
                        {['1', '2'].map(d => <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>)}
                        <span className="text-orange-500 font-medium py-2">3</span>
                        {['4', '5', '6', '7', '8', '9'].map(d => <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>)}
                        <span className="text-orange-500 font-medium py-2">10</span>
                        {['11', '12', '13', '14', '15', '16'].map(d => <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>)}
                        <span className="text-orange-500 font-medium py-2">17</span>
                        {/* ... simpler filler for the rest to match visual essence without full calendar logic for now */}
                        {['18', '19', '20', '21', '22', '23', '24'].map(d =>
                            d === '24' ? <span key={d} className="text-orange-500 font-medium py-2">{d}</span> :
                                <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>
                        )}
                        {['25', '26', '27'].map(d => <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>)}
                        <span className="bg-orange-500 text-white font-bold py-2 rounded-full shadow-md shadow-orange-200">28</span>
                        {['29', '30', '31'].map(d =>
                            d === '31' ? <span key={d} className="text-orange-500 font-medium py-2">{d}</span> :
                                <span key={d} className="text-gray-800 font-medium py-2 hover:bg-gray-50 rounded-full cursor-pointer">{d}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
