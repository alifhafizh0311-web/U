import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db, collection, onSnapshot, query, orderBy, limit } from "../firebase";

interface Testimonial {
  name: string;
  message: string;
}

const defaultTestimonials: Testimonial[] = [
  { name: "Andi", message: "Weboo mantap! Website saya jadi keren banget." },
  { name: "Siti", message: "Harganya beneran murah, tapi kualitas bintang 5." },
  { name: "Budi", message: "Fast response banget adminnya. Recomended!" },
  { name: "Rina", message: "Website jualan saya jadi lebih profesional." },
  { name: "Eko", message: "Gak nyangka 50rb dapet hosting juga. Gokil!" },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => doc.data() as Testimonial);
      if (fetched.length > 0) {
        setTestimonials(fetched);
      }
    }, (error) => {
      console.error("Firestore Error in Testimonials: ", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-black/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 neon-glow-blue">
          Apa Kata Mereka?
        </h2>
        <div className="overflow-hidden relative">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="min-w-[300px] p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-neon-blue transition-colors"
              >
                <p className="text-zinc-400 italic mb-4">"{t.message}"</p>
                <p className="font-bold text-neon-blue">- {t.name}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
