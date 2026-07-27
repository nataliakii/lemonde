/**
 * companyData.js
 * 
 * ⚠️ DEPRECATED: Этот файл существует только для обратной совместимости.
 * 
 * Реальные данные компании берутся из MongoDB через Context.
 * Используйте useMainContext().company в компонентах.
 * 
 * Эти значения — FALLBACK для случаев, когда Context недоступен.
 */

import { COMPANY_ID } from "@config/company";

/**
 * Season date ranges for pricing tiers
 * Используется в: PricingTiers, car model
 */
export const seasons = {
  NoSeason: { start: "01/10", end: "24/05" },
  LowSeason: { start: "25/05", end: "30/06" },
  LowUpSeason: { start: "01/09", end: "30/09" },
  MiddleSeason: { start: "01/07", end: "31/07" },
  HighSeason: { start: "01/08", end: "31/08" },
};

/**
 * @deprecated Используйте useMainContext().company
 * Fallback данные компании
 */
export const companyData = {
  companyId: COMPANY_ID,
  name: "V Luxury Suites",
  tel: "+353 85 270 96 05",
  tel2: "",
  email: "admin@bbqr.site",
  address: "Xoris Odo 0, Pefkochori, Kassandra, Halkidiki, Greece",
  slogan: "Suites · Pefkohori · Kassandra · Halkidiki",
  coords: { lat: "39.982398", lon: "23.635154" },
  defaultStart: "15:00",
  defaultEnd: "10:00",
  hoursDiffForStart: 1,
  hoursDiffForEnd: -1,
  seasons,
  locations: [
    { name: "Pefkohori", coords: { lat: "39.982398", lon: "23.635154" } },
  ],
};
