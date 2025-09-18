// Landing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaSyncAlt, FaUserEdit, FaMobileAlt } from "react-icons/fa";

const features = [
  {
    icon: <FaUsers size={24} />, 
    title: "Social Interaction",
    desc: "Engage in seamless conversations with avatars in shared spaces."
  },
  {
    icon: <FaSyncAlt size={24} />, 
    title: "Real-Time Collaboration",
    desc: "Experience low-latency interactions ideal for work, study, or casual hangs."
  },
  {
    icon: <FaUserEdit size={24} />, 
    title: "Avatar Customisation",
    desc: "Design your own digital identity with customizable avatars."
  },
  {
    icon: <FaMobileAlt size={24} />, 
    title: "Low-End Device Friendly",
    desc: "Optimized performance for all devices, no high specs needed."
  },
];

function GlowingParticles({ count = 90, className = "" }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const temp = Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
    }));
    setParticles(temp);
  }, [count]);

  return (
    <>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute w-[3px] h-[3px] rounded-full opacity-70 ${className}`}
          style={{ 
            top: p.top, 
            left: p.left,
            backgroundColor: 'var(--accent-start)',
            boxShadow: '0 0 6px var(--accent-start)'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ y: -20, opacity: [0, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <GlowingParticles count={100} />

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center px-4 py-24 w-full"
      >
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-accent-gradient">
          Step Into The 2D Metaverse
        </h2>
        <p className="text-lg mb-8 text-theme-secondary max-w-2xl mx-auto">
          MetaMeet is a browser-based platform for interactive virtual rooms where avatars connect, collaborate, and communicate.
        </p>
        <button
          onClick={() => navigate("/room")}
          className="px-6 py-3 bg-accent-gradient text-white rounded-full font-semibold hover:opacity-90 transition"
        >
          🚪 Enter Room
        </button>
      </motion.div>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-12 w-full">
        <h3 className="text-3xl font-bold text-center mb-12">✨ Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-theme-surface/20 border border-theme rounded-xl p-6 flex items-start gap-4 backdrop-blur-md hover:scale-105 hover:shadow-2xl transition-transform duration-300 cursor-pointer hover:bg-theme-surface/30"
            >
              <div className="mt-1" style={{ color: 'var(--accent-start)' }}>{feature.icon}</div>
              <div>
                <h4 className="text-xl font-semibold mb-1 text-theme-primary">{feature.title}</h4>
                <p className="text-sm text-theme-secondary">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-theme py-6 px-6 flex flex-col md:flex-row justify-between items-center text-sm text-theme-secondary bg-theme-surface/40 backdrop-blur w-full">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span>Made with</span>
          <span className="text-red-500">❤️</span>
          <span>by</span>
          <a href="#" className="hover:opacity-80 transition" style={{ color: 'var(--accent-start)' }}> Team MetaMeet 💻</a>
        </div>
        <span>© 2025 metameet. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Landing;
