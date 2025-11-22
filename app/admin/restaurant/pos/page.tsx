"use client";

import React, { useState, useMemo } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  MoreHorizontal,
  Clock,
  Home,
  Car,
  Coffee,
  Croissant,
  UtensilsCrossed,
  Wine,
  Cookie,
  Pizza,
  Salad,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
}

interface OrderItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}


interface QueuedOrder {
  id: string;
  orderNumber: string;
  type: "dine-in" | "takeaway" | "delivery";
  status: "waiting" | "preparing" | "ready";
  items: number;
  time: Date;
}

const categories = [
  { id: "breakfast", name: "Breakfast", icon: Croissant, count: 72 },
  { id: "beverages", name: "Beverages", icon: Coffee, count: 56 },
  { id: "main", name: "Main Dish", icon: UtensilsCrossed, count: 42 },
  { id: "side", name: "Side Dish", icon: Pizza, count: 36 },
  { id: "appetizer", name: "Appetizer", icon: Salad, count: 39 },
  { id: "dessert", name: "Dessert", icon: Cookie, count: 29 },
];

const mockMenuItems: MenuItem[] = [
  { id: "1", name: "French Fries", category: "side", price: 7.50, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=300&fit=crop", available: true },
  { id: "2", name: "Spicy Fried Chicken", category: "main", price: 45.50, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop", available: true },
  { id: "3", name: "Butter Chicken", category: "main", price: 15.45, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop", available: true },
  { id: "4", name: "Fried Rice", category: "side", price: 19.50, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop", available: true },
  { id: "5", name: "Cappuccino", category: "beverages", price: 5.50, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop", available: true },
  { id: "6", name: "Chocolate Cake", category: "dessert", price: 12, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop", available: true },
];

const mockQueuedOrders: QueuedOrder[] = [
  { id: "1", orderNumber: "18729", type: "takeaway", status: "waiting", items: 4, time: new Date(Date.now() - 10 * 60000) },
  { id: "2", orderNumber: "18732", type: "delivery", status: "ready", items: 4, time: new Date(Date.now() - 15 * 60000) },
  { id: "3", orderNumber: "18750", type: "dine-in", status: "preparing", items: 6, time: new Date(Date.now() - 5 * 60000) },
];

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("Anna Jones");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedOrderType, setSelectedOrderType] = useState<"all" | "dine-in" | "takeaway" | "delivery">("all");

  const filteredItems = useMemo(() => {
    return mockMenuItems.filter((item) => {
      const matchesCategory = item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (selectedOrderType === "all") return mockQueuedOrders;
    return mockQueuedOrders.filter(order => order.type === selectedOrderType);
  }, [selectedOrderType]);

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  }, [orderItems]);

  const discount = subtotal * 0.1; // 10% discount
  const tax = subtotal * 0.125; // 12.5% tax
  const total = subtotal - discount + tax;

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find((item) => item.item.id === menuItem.id);
    if (existingItem) {
      updateQuantity(menuItem.id, existingItem.quantity + 1);
    } else {
      setOrderItems([...orderItems, { item: menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.item.id !== itemId));
  };

  const resetOrder = () => {
    setOrderItems([]);
    setTableNumber("");
  };

  const processPayment = () => {
    console.log("Processing payment:", {
      method: paymentMethod,
      total,
      items: orderItems,
      customer: customerName,
      table: tableNumber,
    });
    resetOrder();
    alert("Payment confirmed!");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      waiting: "bg-orange-100 text-orange-600",
      preparing: "bg-blue-100 text-blue-600",
      ready: "bg-green-100 text-green-600",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex">
        {/* Menu Section */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Restaurant POS</h1>
            <p className="text-sm text-gray-500 mt-1">Take orders and process payments</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.available && addToOrder(item)}
                disabled={!item.available}
                className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                  !item.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Coffee className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h3>
                <p className="text-blue-600 font-semibold">₵{item.price}</p>
                {!item.available && (
                  <p className="text-red-500 text-xs mt-1">Out of stock</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Order Section */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Order Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Table number (optional)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-auto p-4">
            {orderItems.length === 0 ? (
              <p className="text-gray-400 text-center mt-8">No items in order</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((orderItem) => (
                  <div
                    key={orderItem.item.id}
                    className="bg-gray-50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {orderItem.item.name}
                      </h4>
                      <button
                        onClick={() => removeFromOrder(orderItem.item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(orderItem.item.id, orderItem.quantity - 1)
                          }
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {orderItem.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(orderItem.item.id, orderItem.quantity + 1)
                          }
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium text-gray-900">
                        ₵{(orderItem.item.price * orderItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (12.5%)</span>
              <span className="font-medium">₵{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-blue-600">₵{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <button
              onClick={processPayment}
              disabled={orderItems.length === 0 || !customerName}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Payment
            </button>
            <button
              onClick={resetOrder}
              disabled={orderItems.length === 0}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear Order
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
