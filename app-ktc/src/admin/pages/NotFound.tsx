import { Link } from "react-router";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        textAlign: "center",
        padding: "40px 16px",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: 900,
          marginBottom: "0.5em",
          letterSpacing: "2px",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1em" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1.2rem", marginBottom: "2em" }}>
        Oops! The page you are looking for does not exist or has been moved.
        <br />
        Please check the URL or return to the homepage.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "12px 32px",
          background: "#fff",
          color: "#764ba2",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "1rem",
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        Go to Homepage
      </Link>
      <div style={{ marginTop: "3em", opacity: 0.5 }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="60" fill="#fff" fillOpacity="0.1" />
          <text
            x="50%"
            y="54%"
            textAnchor="middle"
            fill="#fff"
            fontSize="32"
            fontWeight="bold"
            dy=".3em"
          >
            ?
          </text>
        </svg>
      </div>
    </div>
  );
}
