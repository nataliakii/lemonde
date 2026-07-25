"use client";

/**
 * Stay / rental terms content — supports new sections[] shape and legacy fields.
 */

import { useState, useEffect } from "react";
import { terms } from "@app/data/terms";

export default function RentalTermsContent({ forcedLang = null }) {
  const [lang, setLang] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const supportedTermsLangs = ["en", "el", "ru"];
    const normalizedForcedLang =
      typeof forcedLang === "string"
        ? forcedLang.toLowerCase().split("-")[0]
        : null;

    if (normalizedForcedLang) {
      setLang(
        supportedTermsLangs.includes(normalizedForcedLang)
          ? normalizedForcedLang
          : "en"
      );
      setIsHydrated(true);
      return;
    }

    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && supportedTermsLangs.includes(savedLang)) {
      setLang(savedLang);
    } else {
      setLang("en");
    }

    setIsHydrated(true);
  }, [forcedLang]);

  const containerStyle = {
    width: "100%",
    maxWidth: 820,
    margin: "0 auto",
    padding: "24px 24px 48px",
    boxSizing: "border-box",
  };

  if (!isHydrated) {
    return (
      <div
        style={{
          ...containerStyle,
          textAlign: "center",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    );
  }

  const content = terms[lang] || terms.en;
  const sections = Array.isArray(content.sections) ? content.sections : null;

  return (
    <div style={containerStyle}>
      <article style={{ margin: 0, padding: 0 }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "28px",
            fontWeight: "600",
            fontFamily: "var(--font-display), Georgia, serif",
            fontStyle: "italic",
          }}
        >
          {content.title}
        </h1>

        {sections
          ? sections.map((section, index) => (
              <section key={index} style={{ marginBottom: 28 }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: 12,
                    color: "#1A1612",
                  }}
                >
                  {section.heading}
                </h2>
                <p
                  style={{
                    lineHeight: 1.7,
                    color: "#3C3832",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {section.body}
                </p>
              </section>
            ))
          : null}

        {!sections && content.text1 ? (
          <p
            style={{
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              color: "#37474f",
            }}
          >
            {content.text1}
          </p>
        ) : null}
      </article>
    </div>
  );
}
