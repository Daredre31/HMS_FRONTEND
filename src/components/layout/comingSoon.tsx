import React from "react";

const ComingSoon: React.FC<{ title?: string }> = ({ title = "This feature" }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      textAlign: "center",
      gap: "0.75rem"
    }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>🚧 Coming Soon</h2>
      <p style={{ color: "#666", maxWidth: "400px" }}>
        {title} is under construction. Check back soon!
      </p>
    </div>
  );
};

export default ComingSoon;