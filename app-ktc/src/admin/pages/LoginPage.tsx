import React from "react";
import LoginForm from "../components/LoginForm";

const bgStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 0,
};

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
      <img src="/images/banner3.jpg" alt="Login Background" style={bgStyle} />
      <div className="relative z-20 mt-20">
        <LoginForm />
      </div>
    </div>
  );
}
