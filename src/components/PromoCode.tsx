import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function PromoCode() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handleValidate = () => {
    if (code.toUpperCase() === "WEB50") {
      setStatus("valid");
    } else {
      setStatus("invalid");
    }
  };

  return (
    <section className="py-20 bg-zinc-900/50">
      <div className="container mx-auto px-4 max-w-md">
        <div className="p-8 rounded-3xl bg-black border border-zinc-800 neon-border-blue">
          <h3 className="text-2xl font-bold mb-6 text-center">Punya Kode Promo?</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan kode..."
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-neon-blue outline-none transition-colors"
            />
            <button
              onClick={handleValidate}
              className="px-6 py-3 rounded-xl bg-neon-blue text-black font-bold hover:opacity-80 transition-opacity"
            >
              Cek
            </button>
          </div>
          <AnimatePresence mode="wait">
            {status === "valid" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-green-400 text-center font-medium"
              >
                Diskon 50% aktif! 🎉
              </motion.p>
            )}
            {status === "invalid" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-red-400 text-center font-medium"
              >
                Kode tidak valid ❌
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
