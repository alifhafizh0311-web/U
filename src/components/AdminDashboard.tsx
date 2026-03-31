import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, onSnapshot, query, orderBy, auth, signOut, updateDoc, deleteDoc, doc } from "../firebase";
import { Trash2, CheckCircle, XCircle, LogOut, LayoutDashboard, ShoppingBag, MessageSquare, Search, Filter, Calendar, Check, Clock } from "lucide-react";

interface Order {
  id: string;
  name: string;
  phone: string;
  service: string;
  budget: number;
  features: string;
  promoCode: string;
  message: string;
  status?: "pending" | "confirmed" | "completed";
  createdAt: any;
  uid: string;
}

interface Testimonial {
  id: string;
  name: string;
  message: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "testimonials">("orders");
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const newOrders: Order[] = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const id = change.doc.id;
          // Only highlight if it's not the initial load (more than 0 orders already)
          // Actually, initial load also triggers 'added' for all docs.
          // Let's use a flag or check if the snapshot is from cache.
          if (!snapshot.metadata.fromCache && snapshot.docs.length > orders.length) {
            setNewOrderIds((prev) => new Set(prev).add(id));
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }, 5000);
          }
        }
      });
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
    });

    const qTestimonials = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    const unsubscribeTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeTestimonials();
    };
  }, [orders.length]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery);
      
      const matchesService = serviceFilter === "all" || order.service === serviceFilter;
      const matchesStatus = statusFilter === "all" || (order.status || "pending") === statusFilter;
      
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const orderDate = order.createdAt?.toDate();
        if (orderDate) {
          if (dateRange.start) {
            matchesDate = matchesDate && orderDate >= new Date(dateRange.start);
          }
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && orderDate <= endDate;
          }
        }
      }

      return matchesSearch && matchesService && matchesStatus && matchesDate;
    });
  }, [orders, searchQuery, serviceFilter, statusFilter, dateRange]);

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "confirmed" | "completed") => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm("Hapus pesanan ini?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (window.confirm("Hapus testimoni ini?")) {
      try {
        await deleteDoc(doc(db, "testimonials", id));
      } catch (error) {
        console.error("Error deleting testimonial:", error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter">Web</span>
          <span className="text-2xl">👀</span>
          <span className="ml-2 text-xs font-bold text-neon-blue uppercase tracking-widest">Admin</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "orders" ? "bg-neon-blue text-black font-bold" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            <ShoppingBag size={20} /> Pesanan
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "testimonials" ? "bg-neon-blue text-black font-bold" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            <MessageSquare size={20} /> Testimoni
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors w-full"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {activeTab === "orders" ? "Manajemen Pesanan" : "Manajemen Testimoni"}
            </h1>
            <p className="text-zinc-400">
              Total: {activeTab === "orders" ? filteredOrders.length : testimonials.length} data ditemukan
            </p>
          </div>

          {activeTab === "orders" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama/pesan/WA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-neon-blue outline-none transition-colors w-64"
                />
              </div>
              
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-neon-blue outline-none transition-colors text-sm"
              >
                <option value="all">Semua Layanan</option>
                <option value="Landing Page">Landing Page</option>
                <option value="Company Profile">Company Profile</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Web App">Web App</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-neon-blue outline-none transition-colors text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1">
                <Calendar size={16} className="text-zinc-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-transparent outline-none text-xs"
                />
                <span className="text-zinc-600">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-transparent outline-none text-xs"
                />
              </div>
            </div>
          )}
        </header>

        <div className="grid gap-6">
          {activeTab === "orders" ? (
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    backgroundColor: newOrderIds.has(order.id) ? "rgba(0, 243, 255, 0.1)" : "rgba(24, 24, 27, 1)",
                    borderColor: newOrderIds.has(order.id) ? "rgba(0, 243, 255, 0.5)" : "rgba(39, 39, 42, 1)"
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`p-6 rounded-3xl border flex flex-col md:flex-row gap-6 justify-between items-start transition-colors relative overflow-hidden`}
                >
                  {newOrderIds.has(order.id) && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50"
                    />
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{order.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-xs font-bold uppercase">
                        {order.service}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        order.status === "completed" ? "bg-green-500/20 text-green-500" :
                        order.status === "confirmed" ? "bg-blue-500/20 text-blue-500" :
                        "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {order.status || "pending"}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      WhatsApp: <a href={`https://wa.me/${order.phone?.replace(/\D/g, "").startsWith("0") ? "62" + order.phone?.replace(/\D/g, "").slice(1) : order.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline font-mono">{order.phone}</a>
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Budget: <span className="text-white font-bold">Rp {order.budget?.toLocaleString()}</span>
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Fitur: <span className="text-white">{order.features || "-"}</span>
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Pesan: <span className="text-white italic">"{order.message || "-"}"</span>
                    </p>
                    {order.promoCode && (
                      <p className="text-xs text-green-400 font-bold">Promo: {order.promoCode}</p>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-4">
                    <p className="text-xs text-zinc-500">
                      {order.createdAt?.toDate().toLocaleString() || "Baru saja"}
                    </p>
                    <div className="flex gap-2">
                      <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                        <button 
                          onClick={() => updateOrderStatus(order.id, "pending")}
                          className={`p-2 rounded-lg transition-colors ${order.status === "pending" || !order.status ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"}`}
                          title="Set Pending"
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className={`p-2 rounded-lg transition-colors ${order.status === "confirmed" ? "bg-blue-500 text-white" : "text-zinc-500 hover:text-white"}`}
                          title="Set Confirmed"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          className={`p-2 rounded-lg transition-colors ${order.status === "completed" ? "bg-green-500 text-white" : "text-zinc-500 hover:text-white"}`}
                          title="Set Completed"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            testimonials.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold mb-1">{t.name}</h3>
                  <p className="text-zinc-400 italic">"{t.message}"</p>
                </div>
                <button 
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
