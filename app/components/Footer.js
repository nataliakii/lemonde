"use client";

import React from "react";
import { Typography, Stack, Link as MuiLink, Box, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useMainContext } from "@app/Context";
import { withLocalePrefix } from "@domain/locationSeo/locationSeoService";
import BrandLogo from "@app/components/BrandLogo";
import { SINGLE_PROPERTY_MODE } from "@config/domain";

const CallIcon = dynamic(() => import("@mui/icons-material/Call"), { ssr: false });
const EmailIcon = dynamic(() => import("@mui/icons-material/Email"), { ssr: false });
const LocationOnIcon = dynamic(() => import("@mui/icons-material/LocationOn"), {
  ssr: false,
});
const CodeIcon = dynamic(() => import("@mui/icons-material/Code"), { ssr: false });
const LinkedInIcon = dynamic(() => import("@mui/icons-material/LinkedIn"), {
  ssr: false,
});

const Section = styled("footer")(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(6, 3, 4),
  textAlign: "center",
  overflow: "hidden",
  background: `
    radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,162,39,0.16) 0%, transparent 55%),
    linear-gradient(180deg, #1A1612 0%, #0E0C0A 100%)
  `,
  color: "#F5F0E6",
}));

const GoldRule = styled("div")(() => ({
  width: 72,
  height: 1,
  margin: "0 auto 20px",
  background:
    "linear-gradient(90deg, transparent, #C9A227 20%, #E8D5A3 50%, #C9A227 80%, transparent)",
}));

const Slogan = styled(Typography)(() => ({
  marginTop: 4,
  fontSize: "0.75rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(232,213,163,0.72)",
  fontFamily: "var(--font-body)",
}));

const ContactLink = styled("a")(() => ({
  color: "rgba(245,240,230,0.92)",
  textDecoration: "none",
  fontSize: "0.92rem",
  fontFamily: "var(--font-body)",
  "&:hover": {
    color: "#E8D5A3",
  },
}));

const LegalLink = styled(Link)(() => ({
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  textDecoration: "none",
  color: "rgba(232,213,163,0.55)",
  fontFamily: "var(--font-body)",
  "&:hover": {
    color: "#E8D5A3",
  },
}));

const CreditLink = styled(MuiLink)(() => ({
  color: "rgba(245,240,230,0.45)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.68rem",
  "&:hover": {
    color: "rgba(232,213,163,0.85)",
  },
}));

function Footer() {
  const { company, lang } = useMainContext();
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const name = SINGLE_PROPERTY_MODE
    ? "Le Monde Suites"
    : company?.name || "Le Monde Suites";
  const rawSlogan = company?.slogan || "";
  const slogan = SINGLE_PROPERTY_MODE
    ? rawSlogan && !/car rental|aggregator/i.test(rawSlogan)
      ? rawSlogan
      : "Apartment stays · Nea Kallikratia · Halkidiki"
    : rawSlogan || "Nea Kallikratia · Halkidiki";
  const tel = company?.tel || "";
  const tel2 = company?.tel2 || "";
  const email = company?.email || "lemonde@bbqr.site";
  const address = SINGLE_PROPERTY_MODE
    ? company?.address && !/Antonioy Kelesi/i.test(company.address)
      ? company.address
      : "Leoforos Nikis, Kato Galini, Nea Kallikratia 630 80, Greece"
    : company?.address ||
      "Leoforos Nikis, Kato Galini, Nea Kallikratia 630 80, Greece";

  const localeLink = (path) => withLocalePrefix(lang || "en", path);
  const homeHref = localeLink("/");

  return (
    <Section>
      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <BrandLogo
          href={homeHref}
          markSize={48}
          wordmarkSx={{ fontSize: { xs: "1.75rem", md: "2.15rem" } }}
        />

        <Slogan sx={{ mt: 2 }}>{slogan}</Slogan>
        <GoldRule sx={{ mt: 2.5 }} />

        <Stack spacing={1.25} alignItems="center" sx={{ mb: 3 }}>
          {(tel || tel2) && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CallIcon sx={{ fontSize: 16, color: "#C9A227" }} />
              {tel && <ContactLink href={`tel:${tel}`}>{tel}</ContactLink>}
              {tel && tel2 && (
                <Box component="span" sx={{ opacity: 0.35 }}>
                  ·
                </Box>
              )}
              {tel2 && <ContactLink href={`tel:${tel2}`}>{tel2}</ContactLink>}
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailIcon sx={{ fontSize: 16, color: "#C9A227" }} />
            <ContactLink href={`mailto:${email}`}>{email}</ContactLink>
          </Stack>
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1}
            sx={{ maxWidth: 420, px: 1 }}
          >
            <LocationOnIcon
              sx={{ fontSize: 16, color: "#C9A227", mt: "2px", flexShrink: 0 }}
            />
            <Typography
              sx={{
                color: "rgba(245,240,230,0.7)",
                fontSize: "0.82rem",
                lineHeight: 1.45,
                textAlign: "left",
              }}
            >
              {address}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 3 }}
        >
          <LegalLink href={localeLink("/apartments")}>
            {t("header.cars", { defaultValue: "Apartments" })}
          </LegalLink>
          <Box component="span" sx={{ opacity: 0.25 }}>
            ·
          </Box>
          <LegalLink href={localeLink("/privacy-policy")}>
            {t("footer.privacyPolicy", { defaultValue: "Privacy" })}
          </LegalLink>
          <Box component="span" sx={{ opacity: 0.25 }}>
            ·
          </Box>
          <LegalLink href={localeLink("/terms-of-service")}>
            {t("footer.termsOfService", { defaultValue: "Terms" })}
          </LegalLink>
          <Box component="span" sx={{ opacity: 0.25 }}>
            ·
          </Box>
          <LegalLink href={localeLink("/rental-terms")}>
            {t("footer.rentalTerms", { defaultValue: "Stay terms" })}
          </LegalLink>
          <Box component="span" sx={{ opacity: 0.25 }}>
            ·
          </Box>
          <LegalLink href="/login">
            {t("footer.adminLogin", { defaultValue: "Staff" })}
          </LegalLink>
        </Stack>

        <Divider
          sx={{
            width: "100%",
            maxWidth: 360,
            borderColor: "rgba(201,162,39,0.18)",
            mb: 2.5,
          }}
        />

        {/* <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1.5 }}
        >
          <CreditLink
            href="https://bbqr.site/me"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CodeIcon sx={{ fontSize: 16 }} />
            Developed by NataliaKi
          </CreditLink>
        </Stack> */}

        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "rgba(245,240,230,0.35)",
            letterSpacing: "0.06em",
          }}
        >
          © {currentYear} {name}
        </Typography>
      </Box>
    </Section>
  );
}

export default Footer;
