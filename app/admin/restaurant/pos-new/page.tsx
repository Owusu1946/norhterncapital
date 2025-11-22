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

export default function ModernPOSPage() {
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

  const discount = subtotal * 0.1;
  const tax = subtotal * 0.125;
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
        {/* Left Panel - Order Queue */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Line</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-2">
              {["all", "dine-in", "takeaway", "delivery"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedOrderType(type as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedOrderType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? `All Orders ${mockQueuedOrders.length}` :
                   type === "dine-in" ? "Dine In" :
                   type === "takeaway" ? "Take Away" : "Delivery"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {order.type === "dine-in" && <Home className="h-4 w-4 text-gray-600" />}
                    {order.type === "takeaway" && <Coffee className="h-4 w-4 text-gray-600" />}
                    {order.type === "delivery" && <Car className="h-4 w-4 text-gray-600" />}
                    <div>
                      <p className="font-medium text-sm capitalize">{order.type.replace("-", " ")}</p>
                      <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{order.time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <span>{order.items} Items</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Menu */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold mb-4">Menu List</h1>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center gap-2 min-w-[90px] p-3 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${selectedCategory === category.id ? "text-blue-600" : "text-gray-600"}`} />
                    <span className={`text-xs font-medium ${selectedCategory === category.id ? "text-blue-600" : "text-gray-700"}`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-500">{category.count} Items</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Ordered</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Coffee className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">₵{item.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, (orderItems.find(o => o.item.id === item.id)?.quantity || 1) - 1)}
                          className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {orderItems.find(o => o.item.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          onClick={() => addToOrder(item)}
                          className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Order Details */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-3 mt-3">
              {["Dine In", "Take Away", "Delivery"].map((type) => (
                <button
                  key={type}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-gray-50"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Table Number</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Select Table</option>
                  <option>Table 1</option>
                  <option>Table 2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Order Items</h3>
              <button className="text-red-500 text-xs hover:underline">Reset Order</button>
            </div>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No items in order</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((orderItem) => (
                  <div key={orderItem.item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                      {orderItem.item.image ? (
                        <img src={orderItem.item.image} alt={orderItem.item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{orderItem.item.name}</p>
                      <p className="text-lg font-bold">₵{orderItem.item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(orderItem.item.id, orderItem.quantity - 1)}
                        className="h-6 w-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{orderItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(orderItem.item.id, orderItem.quantity + 1)}
                        className="h-6 w-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromOrder(orderItem.item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h3>
            
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="mobile">Mobile Money</option>
              </select>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sub Total</span>
                <span className="font-medium">₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Discount (10%)</span>
                <span>-₵{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (12.5%)</span>
                <span>₵{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">₵{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => alert("Payment confirmed!")}
              disabled={orderItems.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
