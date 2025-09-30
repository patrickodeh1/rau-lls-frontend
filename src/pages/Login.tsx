import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, LoginResponse } from "../services/auth";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data: LoginResponse = await login(email, password);
      console.log("Login successful:", data);

      // Store tokens & role
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/dashboard");
      } else if (data.role === "employee") {
        navigate("/leads");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError("Invalid email or password");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
