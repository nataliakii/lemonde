"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateTotalPrice } from "@utils/action";
import { buildBookingPriceSummary } from "@/domain/orders/bookingPriceSummary";

/**
 * Async stay totals for catalog cards. Availability stays sync elsewhere;
 * this only loads prices for the given apartments + date range.
 */
export function useStayCatalogPricing(apartments, checkIn, checkOut) {
  const [pricesById, setPricesById] = useState({});
  const [loading, setLoading] = useState(false);
  const apartmentsRef = useRef(apartments);
  apartmentsRef.current = apartments;

  const apartmentKey = useMemo(() => {
    if (!Array.isArray(apartments) || apartments.length === 0) return "";
    return apartments
      .map((apt) => String(apt?._id || ""))
      .filter(Boolean)
      .join("|");
  }, [apartments]);

  useEffect(() => {
    if (!checkIn || !checkOut || !apartmentKey) {
      setPricesById({});
      setLoading(false);
      return undefined;
    }

    const list = Array.isArray(apartmentsRef.current)
      ? apartmentsRef.current
      : [];
    if (list.length === 0) {
      setPricesById({});
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setPricesById({});

    (async () => {
      const entries = await Promise.all(
        list.map(async (apt) => {
          const id = String(apt?._id || "");
          if (!id) return null;
          const carId =
            apt?._id?.toString?.() || apt?.carNumber || apt?.regNumber || "";
          if (!carId) return [id, null];
          const result = await calculateTotalPrice(
            carId,
            checkIn,
            checkOut,
            "TPL",
            0,
            { signal: controller.signal }
          );
          if (!result?.ok) return [id, null];
          return [id, buildBookingPriceSummary(result)];
        })
      );

      if (cancelled || controller.signal.aborted) return;

      const next = {};
      for (const entry of entries) {
        if (!entry) continue;
        const [id, summary] = entry;
        next[id] = summary;
      }
      setPricesById(next);
      setLoading(false);
    })().catch(() => {
      if (!cancelled && !controller.signal.aborted) {
        setPricesById({});
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apartmentKey, checkIn, checkOut]);

  return { pricesById, loading };
}
