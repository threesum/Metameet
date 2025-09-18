import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthShell from "../components/AuthShell";

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
      const res = await axios.post("http://localhost:3000/signin", form);
      localStorage.setItem("metameet-user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signin failed");
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to access your virtual rooms">
      <motion.form
        onSubmit={handleSignin}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .55, ease: [0.4, 0.8, 0.3, 1] }}
        className="space-y-5"
        aria-describedby={error ? 'signin-error' : undefined}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-theme-secondary">Email Address</label>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`input-base ${error ? 'input-error' : ''}`}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-theme-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-base ${error ? 'input-error' : ''}`}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && <p id="signin-error" role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</p>}

        <div className="pt-2">
          <motion.button
            type="submit"
            className="w-full btn-base btn-primary"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.96 }}
          >
            Sign In
          </motion.button>
        </div>

        <p className="text-xs text-theme-secondary text-center pt-2">Don't have an account? <Link to="/signup" className="text-accent-gradient hover:opacity-80">Create one</Link></p>
      </motion.form>
    </AuthShell>
  );
};

export default Signin;
