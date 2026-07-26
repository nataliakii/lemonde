"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ROLE } from "@models/user";
import Loading from "../loading";
import "@styles/globals.css";
import "antd/dist/reset.css";

function AdminContent({ children }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // выполняем редиректы только после загрузки
  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.replace("/login");
      } else if (!session.user?.isAdmin) {
        router.replace("/");
      }
    }
  }, [session, status, router]);

  // показываем лоадер пока идёт загрузка или редирект
  if (status === "loading" || !session || !session.user?.isAdmin) {
    return <Loading />;
  }

  const viewingAsAdmin =
    Boolean(session.user?.viewAsAdmin) &&
    Number(session.user?.realRole) === ROLE.SUPERADMIN;

  const exitAdminPreview = async () => {
    await update({ viewAsAdmin: false });
    window.location.reload();
  };

  return (
    <>
      {viewingAsAdmin ? (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            flexWrap: "wrap",
            px: 2,
            py: 0.75,
            bgcolor: "#1A1612",
            color: "#E8D5A3",
            borderBottom: "1px solid rgba(201,162,39,0.45)",
          }}
        >
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            Viewing as Admin — Superadmin powers are hidden
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={exitAdminPreview}
            sx={{
              color: "#E8D5A3",
              borderColor: "rgba(201,162,39,0.7)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#C9A227",
                bgcolor: "rgba(201,162,39,0.12)",
              },
            }}
          >
            Back to Superadmin
          </Button>
        </Box>
      ) : null}
      {children}
    </>
  );
}

export default function AdminLayoutClient({ children }) {
  return (
    <SessionProvider>
      <AdminContent>{children}</AdminContent>
    </SessionProvider>
  );
}
