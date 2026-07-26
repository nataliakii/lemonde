import React from "react";
import Login from "../components/Login/Login";
import styles from "../components/Login/loginForm.module.css";

export const metadata = {
  robots: { index: false, follow: true },
  title: "Staff login | Le Monde Suites",
};

const LoginPage = () => {
  return (
    <div className={styles.page}>
      <Login />
    </div>
  );
};

export default LoginPage;
