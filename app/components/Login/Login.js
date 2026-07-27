"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import styles from "./loginForm.module.css";
import { useMainContext } from "@app/Context";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";

const isDev = process.env.NODE_ENV === "development";

const LoginForm = ({ company: companyFromServer = null }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { company: companyFromContext } = useMainContext();
  // Prefer SSR company so logo/name are correct on first paint (login has no Feed).
  const company = companyFromServer || companyFromContext;
  const brand = resolveBrandConfig(company);
  const logoSrc =
    typeof brand.assets.logoMark === "string" ? brand.assets.logoMark.trim() : "";
  const brandName = brand.name || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError(
            "Access Denied: Invalid Email or Password. Give It Another Shot."
          );
        } else {
          setError(result.error || "An error occurred during login");
        }
      } else if (result?.ok) {
        window.location.href = "/admin";
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Login exception:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.brand}>
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={brandName || "Logo"}
            width={56}
            height={56}
            className={styles.logo}
            priority
            unoptimized
          />
        ) : null}
        {brandName ? <h1 className={styles.title}>{brandName}</h1> : null}
        <p className={styles.subtitle}>Staff login</p>
      </div>
      <input
        type={isDev ? "text" : "email"}
        placeholder={isDev ? "email (empty = superadmin)" : "email"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required={!isDev}
        autoComplete="username"
      />
      <input
        type="password"
        placeholder={isDev ? "password (empty = superadmin)" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={!isDev}
        autoComplete="current-password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default LoginForm;
