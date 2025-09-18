import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthShell from "../components/AuthShell";

const Signup = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:3000/signup", form);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Set up your profile and enter shared spaces">
      <motion.form
        onSubmit={handleSignup}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .55, ease: [0.4, 0.8, 0.3, 1] }}
        className="space-y-5"
        aria-describedby={error ? 'signup-error' : undefined}
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
              autoComplete="new-password"
              placeholder="••••••••"
              className={`input-base ${error ? 'input-error' : ''}`}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && <p id="signup-error" role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</p>}

        <div className="pt-2">
          <motion.button
            type="submit"
            className="w-full btn-base btn-primary"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.96 }}
          >
            Sign Up
          </motion.button>
        </div>

        <p className="text-xs text-theme-secondary text-center pt-2">Already have an account? <Link to="/signin" className="text-accent-gradient hover:opacity-80">Sign in</Link></p>
      </motion.form>
    </AuthShell>
  );
};

export default Signup;
