"use client";
import Image from "next/image";
import React from "react";

function Error({ error, reset }) {
  return (
    <div className="loading-container vibrate-1">
      <h3 style={{ marginBottom: 20 }}>Ooops! error...</h3>
      {error?.message ? (
        <pre
          style={{
            maxWidth: 640,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 13,
            color: "#b00020",
            textAlign: "left",
            marginBottom: 16,
          }}
        >
          {String(error.message)}
        </pre>
      ) : null}
      <Image
        src="/logo-mark.png"
        alt="Le Monde Suites"
        width={130}
        height={130}
        unoptimized
      />
      {typeof reset === "function" ? (
        <button type="button" onClick={reset} style={{ marginTop: 16 }}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default Error;
