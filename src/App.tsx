import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, DollarSign, Settings, MessageSquare, ArrowRight, LogIn, LogOut, User as UserIcon, Shield } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Testimonials from "./components/Testimonials";
import PromoCode from "./components/PromoCode";
import WhatsAppChat from "./components/WhatsAppChat";
import LiveNotification from "./components/LiveNotification";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminDashboard from "./components/AdminDashboard";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "./firebase";

const ADMIN_EMAIL = "sabilisalam0311@gmail.com";

const openChat = () => {
  window.dispatchEvent(new CustomEvent("open-weboo-chat"));
};

function Navbar({ user, handleLogin, handleLogout, scrollToSection }: any) {
  const location = useLocation();
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (location.pathname === "/admin") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <span className="text-2xl font-bold tracking-tighter">Web</span>
          <div className="flex items-center -ml-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-2xl"
            >
              👀
            </motion.div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <button onClick={() => scrollToSection("features")} className="hover:text-neon-blue transition-colors">Fitur</button>
          <button onClick={() => scrollToSection("testimonials")} className="hover:text-neon-blue transition-colors">Testimoni</button>
          <button onClick={() => scrollToSection("promo")} className="hover:text-neon-blue transition-colors">Promo</button>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="p-2 rounded-full bg-neon-blue/10 text-neon-blue hover:bg-neon-blue hover:text-black transition-all">
                  <Shield size={18} />
                </Link>
              )}
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-neon-blue" />
              ) : (
                <UserIcon size={20} className="text-zinc-400" />
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <LogIn size={18} /> Login
            </button>
          )}
          <button
            onClick={openChat}
            className="px-6 py-2 rounded-full bg-neon-blue text-black font-bold text-sm hover:opacity-80 transition-opacity"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </nav>
  );
}

function LandingPage({ scrollToSection }: any) {
  const features = [
    {
      title: "Website Cepat & Ringan",
      desc: "Optimasi performa maksimal agar website Anda loading secepat kilat.",
      icon: <Zap className="text-neon-blue" size={32} />,
    },
    {
      title: "Harga Terjangkau",
      desc: "Mulai dari 50rb sudah termasuk hosting. Cocok untuk UMKM & Portofolio.",
      icon: <DollarSign className="text-neon-purple" size={32} />,
    },
    {
      title: "Custom Sesuai Kebutuhan",
      desc: "Desain unik dan fitur yang bisa disesuaikan dengan keinginan Anda.",
      icon: <Settings className="text-neon-blue" size={32} />,
    },
    {
      title: "Support Fast Response",
      desc: "Admin kami siap membantu Anda kapan saja dengan respon cepat.",
      icon: <MessageSquare className="text-neon-purple" size={32} />,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-neon-blue/10 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Jasa Pembuatan Website <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple neon-glow-blue">
                Murah & Cepat
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Mulai dari <span className="text-white font-bold">50.000</span> sudah termasuk hosting. <br className="hidden md:block" />
              Solusi digital modern untuk bisnis dan portofolio Anda.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={openChat}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-neon-blue text-black font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Pesan Sekarang <ArrowRight size={20} />
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-lg hover:bg-zinc-800 transition-colors"
              >
                Lihat Fitur
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-neon-blue/50 transition-colors group"
              >
                <div className="mb-6 p-4 rounded-2xl bg-black w-fit group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Promo Code */}
      <div id="promo">
        <PromoCode />
      </div>

      {/* Footer / Contact Section */}
      <footer id="contact" className="py-20 border-t border-zinc-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-bold tracking-tighter">Web</span>
            <span className="text-3xl">👀</span>
          </div>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Siap untuk go digital? Hubungi kami sekarang dan dapatkan website impian Anda hanya dalam hitungan hari.
          </p>
          <div className="flex items-center justify-center gap-6 mb-12">
            <a href="#" className="text-zinc-400 hover:text-neon-blue transition-colors">Instagram</a>
            <a href="#" className="text-zinc-400 hover:text-neon-blue transition-colors">TikTok</a>
            <a href="#" className="text-zinc-400 hover:text-neon-blue transition-colors">Twitter</a>
          </div>
          <p className="text-zinc-600 text-sm">
            &copy; 2026 Weboo Digital Agency. All rights reserved.
          </p>
        </div>
      </footer>

      <WhatsAppChat />
      <LiveNotification />
    </>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl"
        >
          👀
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-neon-blue/30 text-white">
      <Navbar user={user} handleLogin={handleLogin} handleLogout={handleLogout} scrollToSection={scrollToSection} />
      <Routes>
        <Route path="/" element={<LandingPage scrollToSection={scrollToSection} />} />
        <Route 
          path="/admin" 
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : (
              <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                  <Shield size={64} className="mx-auto mb-6 text-red-500" />
                  <h1 className="text-3xl font-bold mb-2">Akses Ditolak</h1>
                  <p className="text-zinc-400 mb-8">Halaman ini hanya untuk administrator.</p>
                  <Link to="/" className="px-8 py-3 rounded-full bg-white text-black font-bold">Kembali ke Beranda</Link>
                </div>
              </div>
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}
