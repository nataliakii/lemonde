"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dayjs from "dayjs";
import {
  getCarAvailability,
  isOrderCompatible,
  isOrderOnCar,
} from "@/domain/calendar";
import {
  buildOrderDateRange,
  calendarDayDelta,
  shiftOrderByDays,
} from "./calendarDays";
import { moveOrderToCar, changeRentalDates } from "@utils/action";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";
import { useTranslation } from "react-i18next";

const ORDER_DRAG_MIME = "application/x-car-calendar-order-id";
const BUSINESS_TZ = "Europe/Athens";

function formatRangeRu(startStr, endStr) {
  const fmt = (s) => dayjs.tz(s, "YYYY-MM-DD", BUSINESS_TZ).format("DD.MM.YYYY");
  return `${fmt(startStr)} – ${fmt(endStr)}`;
}

/**
 * Hook for calendar move mode: car-to-car drag + same-car date shift.
 */
export function useCalendarMoveMode({
  cars,
  ordersByCarId,
  fetchAndUpdateOrders,
  showSingleSnackbar,
  scrollContainerRef,
}) {
  const { t } = useTranslation();
  const [moveMode, setMoveMode] = useState(false);
  const [selectedMoveOrder, setSelectedMoveOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    kind: null, // 'car' | 'dates'
    newCar: null,
    oldCar: null,
    dayDelta: 0,
    fromRange: null,
    toRange: null,
  });

  const [isDraggingOrder, setIsDraggingOrder] = useState(false);
  const [dragOverCarId, setDragOverCarId] = useState(null);
  const [dragSourceDate, setDragSourceDate] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [draggingOrderId, setDraggingOrderId] = useState(null);
  const dropHandledRef = useRef(false);
  const lastPointerXRef = useRef(null);
  const moveModeRef = useRef(false);
  /** Sync flags for HTML5 DnD — React state is too late for dragover/drop */
  const isDraggingOrderRef = useRef(false);
  const selectedMoveOrderRef = useRef(null);
  const dragSourceDateRef = useRef(null);

  useEffect(() => {
    moveModeRef.current = moveMode;
  }, [moveMode]);

  const activeDayDelta = useMemo(() => {
    if (!isDraggingOrder || !dragSourceDate || !dragOverDate) return 0;
    if (!selectedMoveOrder || !dragOverCarId) return 0;
    if (!isOrderOnCar(selectedMoveOrder, dragOverCarId)) return 0;
    return calendarDayDelta(dragSourceDate, dragOverDate);
  }, [
    isDraggingOrder,
    dragSourceDate,
    dragOverDate,
    selectedMoveOrder,
    dragOverCarId,
  ]);

  const dateShiftPreview = useMemo(() => {
    if (!selectedMoveOrder || activeDayDelta === 0) return null;
    return shiftOrderByDays(selectedMoveOrder, activeDayDelta);
  }, [selectedMoveOrder, activeDayDelta]);

  const selectedOrderDates = useMemo(() => {
    if ((!moveMode && !isDraggingOrder) || !selectedMoveOrder) return [];
    if (dateShiftPreview) {
      return buildOrderDateRange({
        rentalStartDate: dateShiftPreview.rentalStartDate,
        rentalEndDate: dateShiftPreview.rentalEndDate,
      });
    }
    return buildOrderDateRange(selectedMoveOrder);
  }, [moveMode, isDraggingOrder, selectedMoveOrder, dateShiftPreview]);

  const moveTargetHighlightActive = moveMode || isDraggingOrder;

  const isDateShiftCompatible = useCallback(
    (order, dayDelta, carId) => {
      const shifted = shiftOrderByDays(order, dayDelta);
      if (!shifted) return false;
      const today = dayjs().tz(BUSINESS_TZ).startOf("day");
      const newStart = dayjs.tz(
        shifted.rentalStartDate,
        "YYYY-MM-DD",
        BUSINESS_TZ
      );
      if (newStart.isBefore(today, "day")) return false;

      const hypothetical = {
        ...order,
        rentalStartDate: shifted.rentalStartDate,
        rentalEndDate: shifted.rentalEndDate,
        timeIn: shifted.timeIn,
        timeOut: shifted.timeOut,
      };
      const carOrders = ordersByCarId(carId);
      return isOrderCompatible(hypothetical, carOrders);
    },
    [ordersByCarId]
  );

  const isCarCompatibleForMove = useCallback(
    (carId) => {
      if (!moveTargetHighlightActive || !selectedMoveOrder) return true;

      if (isOrderOnCar(selectedMoveOrder, carId)) {
        // Same car: yellow/green only while previewing a valid date shift
        if (!isDraggingOrder) return false;
        if (activeDayDelta === 0) return false;
        return isDateShiftCompatible(
          selectedMoveOrder,
          activeDayDelta,
          carId
        );
      }

      const carOrders = ordersByCarId(carId);
      return isOrderCompatible(selectedMoveOrder, carOrders);
    },
    [
      moveTargetHighlightActive,
      selectedMoveOrder,
      isDraggingOrder,
      activeDayDelta,
      isDateShiftCompatible,
      ordersByCarId,
    ]
  );

  const handleLongPress = useCallback(
    (order) => {
      // Moves are drag-and-drop only — long-press no longer enters click-to-move mode.
      if (!order?._id) return;
      showSingleSnackbar(
        SINGLE_PROPERTY_MODE
          ? t("suites.dragToApartmentOrDay")
          : t("suites.dragToCarOrDay"),
        { variant: "info", autoHideDuration: 5000 }
      );
    },
    [showSingleSnackbar, t]
  );

  const handleOrderDragStart = useCallback((e, order, dateStr) => {
    if (!order?._id) return;
    dropHandledRef.current = false;
    isDraggingOrderRef.current = true;
    selectedMoveOrderRef.current = order;
    dragSourceDateRef.current = dateStr || null;
    setSelectedMoveOrder(order);
    setIsDraggingOrder(true);
    setDraggingOrderId(order._id);
    setDragSourceDate(dateStr || null);
    setDragOverDate(dateStr || null);
    try {
      // text/plain is required in Chromium for reliable DnD; setData before setDragImage
      e.dataTransfer.setData(ORDER_DRAG_MIME, String(order._id));
      e.dataTransfer.setData("text/plain", String(order._id));
      e.dataTransfer.effectAllowed = "move";
      const el = e.currentTarget;
      if (el && typeof e.dataTransfer.setDragImage === "function") {
        e.dataTransfer.setDragImage(el, 12, 12);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOrderDragEnd = useCallback(() => {
    // Visual reset immediately; keep refs until after drop (some browsers fire
    // dragend before drop — clearing refs sync would make handleRowDrop a no-op).
    setIsDraggingOrder(false);
    setDragOverCarId(null);
    setDragSourceDate(null);
    setDragOverDate(null);
    setDraggingOrderId(null);
    lastPointerXRef.current = null;

    window.setTimeout(() => {
      isDraggingOrderRef.current = false;
      dragSourceDateRef.current = null;
      if (!dropHandledRef.current) {
        selectedMoveOrderRef.current = null;
        setSelectedMoveOrder(null);
      }
    }, 0);
  }, []);

  const handleRowDragOver = useCallback(
    (e, car, dateStr) => {
      const dragging = isDraggingOrderRef.current;
      const order = selectedMoveOrderRef.current;
      if (!dragging || !order) return;

      // Must call preventDefault synchronously or the browser won't allow drop
      e.preventDefault();
      e.stopPropagation();
      lastPointerXRef.current = e.clientX;
      const carId = car?._id;
      const sameCar = isOrderOnCar(order, carId);
      const sourceDate = dragSourceDateRef.current;

      if (dateStr) {
        setDragOverDate(dateStr);
      }

      let canDrop = false;
      if (sameCar) {
        const delta =
          sourceDate && dateStr ? calendarDayDelta(sourceDate, dateStr) : 0;
        canDrop =
          delta !== 0 && isDateShiftCompatible(order, delta, carId);
      } else {
        const carOrders = ordersByCarId(carId);
        canDrop = getCarAvailability(order, carOrders).available;
      }

      try {
        e.dataTransfer.dropEffect = canDrop ? "move" : "none";
      } catch {
        // ignore
      }
      setDragOverCarId(carId);
    },
    [ordersByCarId, isDateShiftCompatible]
  );

  const handleRowDragLeave = useCallback((e) => {
    const tr = e.currentTarget?.closest?.("tr");
    if (tr && e.relatedTarget && tr.contains(e.relatedTarget)) return;
    setDragOverCarId(null);
    setDragOverDate(null);
  }, []);

  const handleCarSelectForMove = useCallback(
    (selectedCar) => {
      const order = selectedMoveOrderRef.current || selectedMoveOrder;
      if (!order) return;

      const oldCar = cars.find((car) => isOrderOnCar(order, car._id));

      setConfirmModal({
        open: true,
        kind: "car",
        newCar: selectedCar,
        oldCar: oldCar,
        dayDelta: 0,
        fromRange: null,
        toRange: null,
      });
    },
    [selectedMoveOrder, cars]
  );

  const openDateShiftConfirm = useCallback(
    (dayDelta) => {
      const order = selectedMoveOrderRef.current || selectedMoveOrder;
      if (!order) return;
      const shifted = shiftOrderByDays(order, dayDelta);
      if (!shifted) return;

      const fromStart = dayjs
        .utc(order.rentalStartDate)
        .tz(BUSINESS_TZ)
        .format("YYYY-MM-DD");
      const fromEnd = dayjs
        .utc(order.rentalEndDate)
        .tz(BUSINESS_TZ)
        .format("YYYY-MM-DD");

      setConfirmModal({
        open: true,
        kind: "dates",
        newCar: null,
        oldCar: null,
        dayDelta: shifted.dayDelta,
        fromRange: formatRangeRu(fromStart, fromEnd),
        toRange: formatRangeRu(
          shifted.rentalStartDate,
          shifted.rentalEndDate
        ),
        shifted,
      });
    },
    [selectedMoveOrder]
  );

  const handleRowDrop = useCallback(
    (e, car, dateStr) => {
      e.preventDefault();
      e.stopPropagation();

      const order = selectedMoveOrderRef.current;
      const sourceDate = dragSourceDateRef.current;
      // Accept drop if refs still set (even if dragend already cleared the visual flag)
      if (!order) return;

      const carId = car?._id;
      const sameCar = isOrderOnCar(order, carId);

      if (sameCar) {
        if (!dateStr || !sourceDate) return;
        const delta = calendarDayDelta(sourceDate, dateStr);
        if (delta === 0) return;
        if (!isDateShiftCompatible(order, delta, carId)) {
          showSingleSnackbar(t("suites.cannotMoveDates"), {
            variant: "warning",
            autoHideDuration: 4000,
          });
          return;
        }

        dropHandledRef.current = true;
        isDraggingOrderRef.current = false;
        setIsDraggingOrder(false);
        setDragOverCarId(null);
        setDragOverDate(null);
        setDraggingOrderId(null);
        lastPointerXRef.current = null;
        setSelectedMoveOrder(order);
        openDateShiftConfirm(delta);
        return;
      }

      const carOrders = ordersByCarId(carId);
      if (!isOrderCompatible(order, carOrders)) {
        showSingleSnackbar(t("suites.conflictConfirmedNoMove"), {
          variant: "warning",
          autoHideDuration: 4000,
        });
        return;
      }

      dropHandledRef.current = true;
      isDraggingOrderRef.current = false;
      setIsDraggingOrder(false);
      setDragOverCarId(null);
      setDragOverDate(null);
      setDraggingOrderId(null);
      lastPointerXRef.current = null;
      setSelectedMoveOrder(order);

      handleCarSelectForMove({
        _id: car._id,
        carNumber: car.carNumber,
        model: car.model,
        regNumber: car.regNumber,
      });
    },
    [
      ordersByCarId,
      handleCarSelectForMove,
      isDateShiftCompatible,
      openDateShiftConfirm,
      showSingleSnackbar,
      t,
    ]
  );

  const exitMoveMode = useCallback(() => {
    const wasLongPressMode = moveModeRef.current;
    setMoveMode(false);
    selectedMoveOrderRef.current = null;
    dragSourceDateRef.current = null;
    isDraggingOrderRef.current = false;
    setSelectedMoveOrder(null);
    setDragSourceDate(null);
    setDragOverDate(null);
    if (wasLongPressMode) {
      showSingleSnackbar(t("suites.moveModeOff"), { variant: "info" });
    }
  }, [showSingleSnackbar, t]);

  const cancelDragOnly = useCallback(() => {
    dropHandledRef.current = false;
    isDraggingOrderRef.current = false;
    selectedMoveOrderRef.current = null;
    dragSourceDateRef.current = null;
    setIsDraggingOrder(false);
    setDragOverCarId(null);
    setDragSourceDate(null);
    setDragOverDate(null);
    setDraggingOrderId(null);
    lastPointerXRef.current = null;
    setSelectedMoveOrder(null);
  }, []);

  useEffect(() => {
    if (!moveMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitMoveMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveMode, exitMoveMode]);

  useEffect(() => {
    if (!isDraggingOrder || moveMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelDragOnly();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDraggingOrder, moveMode, cancelDragOnly]);

  useEffect(() => {
    if (!isDraggingOrder) return;
    const onMove = (e) => {
      // Keep drop allowed while React re-renders mid-drag (state lags behind refs)
      if (isDraggingOrderRef.current) {
        e.preventDefault();
      }
      lastPointerXRef.current = e.clientX;
    };
    document.addEventListener("dragover", onMove);
    return () => document.removeEventListener("dragover", onMove);
  }, [isDraggingOrder]);

  useEffect(() => {
    if (!isDraggingOrder) return;
    const EDGE = 56;
    const SPEED = 14;
    let raf = 0;

    const tick = () => {
      const el = scrollContainerRef?.current;
      const x = lastPointerXRef.current;
      if (
        el != null &&
        x != null &&
        typeof el.getBoundingClientRect === "function"
      ) {
        const rect = el.getBoundingClientRect();
        if (x < rect.left + EDGE) {
          el.scrollLeft -= SPEED;
        } else if (x > rect.right - EDGE) {
          el.scrollLeft += SPEED;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isDraggingOrder, scrollContainerRef]);

  const handleConfirmMove = useCallback(async () => {
    const kind = confirmModal.kind;
    const newCar = confirmModal.newCar;
    const order = selectedMoveOrder;
    const shifted = confirmModal.shifted;

    if (!order?._id) {
      showSingleSnackbar(t("suites.noMoveData"), { variant: "error" });
      exitMoveMode();
      setConfirmModal({
        open: false,
        kind: null,
        newCar: null,
        oldCar: null,
        dayDelta: 0,
        fromRange: null,
        toRange: null,
      });
      return;
    }

    setConfirmModal({
      open: false,
      kind: null,
      newCar: null,
      oldCar: null,
      dayDelta: 0,
      fromRange: null,
      toRange: null,
    });

    try {
      if (kind === "dates") {
        if (!shifted) {
          showSingleSnackbar(t("suites.invalidDateShift"), { variant: "error" });
          return;
        }

        const result = await changeRentalDates(
          order._id,
          shifted.rentalStartDate,
          shifted.rentalEndDate,
          shifted.timeIn,
          shifted.timeOut,
          order.placeIn || "",
          order.placeOut || "",
          order.car?._id || order.car,
          order.carNumber
        );

        if (result?.status === 201 || result?.status === 202) {
          await fetchAndUpdateOrders();
          const conflictMsg =
            result.conflicts?.length > 0
              ? t("suites.pendingConflictsHint")
              : "";
          showSingleSnackbar(
            t("suites.orderShiftedTo", {
              range: formatRangeRu(
                shifted.rentalStartDate,
                shifted.rentalEndDate
              ),
            }) + conflictMsg,
            { variant: "success" }
          );
        } else if (result?.status === 409) {
          showSingleSnackbar(
            result.message ||
              t("suites.conflictConfirmedNoMove"),
            { variant: "error", autoHideDuration: 5000 }
          );
        } else if (result?.status === 403) {
          showSingleSnackbar(
            result.message || t("suites.noPermissionChangeDates"),
            { variant: "error", autoHideDuration: 5000 }
          );
        } else {
          showSingleSnackbar(result.message || t("suites.dateMoveError"), {
            variant: "error",
          });
        }
        return;
      }

      // kind === 'car'
      if (!newCar?._id) {
        showSingleSnackbar(t("suites.noMoveData"), {
          variant: "error",
        });
        return;
      }

      const result = await moveOrderToCar(
        order._id,
        newCar._id,
        newCar.carNumber
      );

      if (result?.status === 201 || result?.status === 202) {
        await fetchAndUpdateOrders();
        const conflictMsg =
          result.conflicts?.length > 0
            ? t("suites.pendingConflictsHint")
            : "";
        showSingleSnackbar(
          t("suites.orderMovedTo", { model: newCar.model }) + conflictMsg,
          { variant: "success" }
        );
      } else if (result?.status === 409) {
        showSingleSnackbar(
          result.message ||
            t("suites.conflictConfirmedNoMove"),
          { variant: "error", autoHideDuration: 5000 }
        );
      } else {
        showSingleSnackbar(result.message || t("suites.orderMoveError"), {
          variant: "error",
        });
      }
    } catch (error) {
      showSingleSnackbar(t("suites.moveErrorWithMsg", { message: error.message }), {
        variant: "error",
      });
    } finally {
      exitMoveMode();
    }
  }, [
    confirmModal,
    selectedMoveOrder,
    fetchAndUpdateOrders,
    showSingleSnackbar,
    exitMoveMode,
    t,
  ]);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModal({
      open: false,
      kind: null,
      newCar: null,
      oldCar: null,
      dayDelta: 0,
      fromRange: null,
      toRange: null,
    });
    exitMoveMode();
  }, [exitMoveMode]);

  const orderToMove = selectedMoveOrder;

  return {
    moveMode,
    selectedMoveOrder,
    orderToMove,
    confirmModal,
    isDraggingOrder,
    dragOverCarId,
    draggingOrderId,
    selectedOrderDates,
    isCarCompatibleForMove,
    handleLongPress,
    handleCarSelectForMove,
    exitMoveMode,
    handleConfirmMove,
    handleCloseConfirmModal,
    handleOrderDragStart,
    handleOrderDragEnd,
    handleRowDragOver,
    handleRowDragLeave,
    handleRowDrop,
  };
}
