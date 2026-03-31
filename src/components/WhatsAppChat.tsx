import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageCircle, DollarSign, Settings, QrCode, Phone } from "lucide-react";
import { auth, db, collection, addDoc, serverTimestamp } from "../firebase";
import axios from "axios";

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState("");
  const [budget, setBudget] = useState("");
  const [features, setFeatures] = useState("");
  const [promo, setPromo] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-weboo-chat", handleOpenChat);
    return () => window.removeEventListener("open-weboo-chat", handleOpenChat);
  }, []);

  const handleSend = async () => {
    if (!name || !phone || !order || !budget) {
      alert("Mohon isi nama, nomor WhatsApp, jenis pesanan, dan budget.");
      return;
    }

    setIsSending(true);
    const path = "orders";
    try {
      const orderData = {
        name,
        phone,
        service: order,
        budget: Number(budget),
        features,
        promoCode: promo,
        message,
        createdAt: serverTimestamp(),
        uid: auth.currentUser?.uid || "anonymous",
      };

      // Save to Firestore
      await addDoc(collection(db, path), orderData);

      // Format phone for WhatsApp link (remove non-digits)
      const cleanPhone = phone.replace(/\D/g, "");
      const waLink = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`;

      // Notify Telegram via server API
      const telegramMessage = `🚀 *PESANAN BARU DI WEBOO!* 🚀

👤 *Nama:* ${name}
📱 *WhatsApp:* ${phone}
📦 *Layanan:* ${order}
💰 *Budget:* Rp ${Number(budget).toLocaleString()}
🛠️ *Fitur:* ${features || "-"}
🎟️ *Promo:* ${promo || "-"}
💬 *Pesan:* ${message || "-"}

🔗 *Chat Pembeli:* ${waLink}

_Segera hubungi klien untuk konfirmasi!_`;

      try {
        await axios.post("/api/notify-telegram", { message: telegramMessage });
      } catch (err) {
        console.warn("Failed to send Telegram notification:", err);
      }

      const waText = `Halo Weboo! 👋

Nama: ${name}
WhatsApp: ${phone}
Pesanan: ${order}
Budget: Rp ${Number(budget).toLocaleString()}
Fitur: ${features || "-"}
Kode Promo: ${promo || "-"}
Pesan: ${message || "-"}

Saya mau bikin website bang!`;

      const encodedText = encodeURIComponent(waText);
      window.open(`https://wa.me/6285717043813?text=${encodedText}`, "_blank");
      
      // Show QRIS after successful order
      setShowQRIS(true);
    } catch (error) {
      console.error("Error saving order: ", error);
      alert(`Terjadi kesalahan saat menyimpan pesanan: ${error instanceof Error ? error.message : "Missing or insufficient permissions"}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
      >
        <MessageCircle size={32} />
      </motion.button>

      {/* QRIS Modal */}
      <AnimatePresence>
        {showQRIS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <h3 className="text-2xl font-bold mb-2">Pembayaran QRIS</h3>
              <p className="text-zinc-400 mb-6 text-sm">Scan untuk bayar DP atau pelunasan via DANA</p>
              
              <div className="bg-white p-4 rounded-2xl mb-6 aspect-square flex items-center justify-center">
                {/* Placeholder for QRIS Image */}
                <div className="flex flex-col items-center gap-2 text-black">
                  <QrCode size={120} />
                  <span className="font-bold text-xs">QRIS DANA WEBOO</span>
                </div>
              </div>

              <button
                onClick={() => setShowQRIS(false)}
                className="w-full py-3 rounded-xl bg-neon-blue text-black font-bold hover:opacity-80 transition-opacity"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[90vw] rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-green-500 text-white flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                👀
              </div>
              <div>
                <h3 className="font-bold text-lg">Weboo Admin</h3>
                <p className="text-sm opacity-80">Online • Fast Response</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto bg-black/20">
              <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-800 text-zinc-300 text-sm">
                Halo! 👋 Mau bikin website apa nih? Isi form di bawah ya biar admin langsung proses!
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm"
                />
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Nomor WhatsApp (e.g. 0812...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm"
                  />
                </div>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm text-zinc-400"
                >
                  <option value="">Pilih Jenis Pesanan</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Portofolio">Portofolio</option>
                  <option value="Website Bisnis">Website Bisnis</option>
                  <option value="Toko Online">Toko Online</option>
                </select>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="number"
                    placeholder="Budget (e.g. 50000)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm"
                  />
                </div>
                <div className="relative">
                  <Settings size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Fitur yang diinginkan (e.g. Animasi, Form)"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Kode Promo (Opsional)"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm"
                />
                <textarea
                  placeholder="Pesan tambahan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-green-500 outline-none text-sm min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Mengirim..." : "Pesan Sekarang"} <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
