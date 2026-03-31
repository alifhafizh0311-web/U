import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart } from "lucide-react";

const names = ["Andi", "Siti", "Budi", "Rina", "Eko", "Dina", "Fajar", "Gita"];
const services = ["Landing Page", "Portofolio", "Website Bisnis", "Toko Online"];

export default function LiveNotification() {
  const [notification, setNotification] = useState<{ name: string; service: string } | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      setNotification({ name: randomName, service: randomService });

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        showNotification();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center gap-4 max-w-[300px]"
        >
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
            <ShoppingCart size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {notification.name} baru saja memesan!
            </p>
            <p className="text-xs text-zinc-400">
              Layanan: {notification.service}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
