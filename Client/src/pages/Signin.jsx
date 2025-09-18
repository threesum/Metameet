import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/signin", form);
      localStorage.setItem("metameet-user", JSON.stringify(res.data.user));
      navigate("/room");
    } catch (err) {
      setError(err.response?.data?.message || "Signin failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <motion.form
        onSubmit={handleSignin}
        className="p-8 bg-theme-surface rounded-xl shadow-lg max-w-sm w-full border border-theme"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-accent-gradient">Welcome Back</h2>
        <p className="text-center text-theme-secondary mb-6">Sign in to access your virtual room</p>

        <motion.input
          name="username"
          placeholder="Email Address"
          className="mb-4 px-4 py-2 block w-full text-theme-primary bg-white border-2 border-theme rounded-md focus:outline-none transition"
          style={{ 
            '--tw-ring-color': 'var(--accent-start)',
            'borderColor': 'var(--border)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-start)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          onChange={handleChange}
          required
          whileFocus={{ scale: 1.05 }}
        />

        <motion.input
          name="password"
          type="password"
          placeholder="Password"
          className="mb-6 px-4 py-2 block w-full text-theme-primary bg-white border-2 border-theme rounded-md focus:outline-none transition"
          style={{ 
            '--tw-ring-color': 'var(--accent-start)',
            'borderColor': 'var(--border)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-start)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          onChange={handleChange}
          required
          whileFocus={{ scale: 1.05 }}
        />

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <motion.button
          type="submit"
          className="w-full py-2 bg-accent-gradient rounded-md font-semibold text-white hover:opacity-90 transition"
          whileHover={{ scale: 1.05 }}
        >
          Sign In
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Signin;
