import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  Box,
  TextField,
  RadioGroup,
  Radio,
  InputAdornment,
  Stack,
  Autocomplete,
} from "@mui/material";
import DialogLayout from "@/app/components/ui/modals/DialogLayout";
import { ConfirmButton, CancelButton } from "@/app/components/ui";
import Snackbar from "@/app/components/ui/feedback/Snackbar";
import { styled } from "@mui/material/styles";
import PricingTiersTable from "../PricingTiers";
import { useMainContext } from "@app/Context";
import {
  CAR_CLASSES,
  APARTMENT_TYPES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  PREDEFINED_COLORS,
} from "@models/enums";
import {
  RenderTextField,
  RenderSelectField,
} from "@/app/components/ui/inputs/Fields";
import SuiteGalleryEditor from "@/app/components/ui/media/SuiteGalleryEditor";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { ROLE } from "@/domain/orders/admin-rbac";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";

/** Stable empty default — inline `companies = []` re-creates a new array every render and loops with useEffect. */
const EMPTY_COMPANIES = [];

const EditCarModal = ({
  open,
  onClose,
  updatedCar,
  handleChange,
  handleUpdate,
  handleCheckboxChange,
  setUpdatedCar,
  companies = EMPTY_COMPANIES,
}) => {

  const { updateCarInContext, setUpdateStatus, updateStatus, company } =
    useMainContext();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === ROLE.SUPERADMIN;

  const [isLoading, setIsLoading] = useState(false);
  const [localCompanies, setLocalCompanies] = useState(companies);

  const handleGalleryChange = async ({ photoUrl, gallery }) => {
    const next = {
      ...updatedCar,
      photoUrl: photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID,
      gallery: Array.isArray(gallery) ? gallery : [],
    };
    setUpdatedCar(next);
    try {
      setIsLoading(true);
      const response = await updateCarInContext(next);
      setUpdateStatus({
        type: response.type,
        message: response.message,
        data: response.data,
      });
      if (response?.data) {
        setUpdatedCar((prev) => ({
          ...prev,
          ...response.data,
          photoUrl: response.data.photoUrl ?? next.photoUrl,
          gallery: response.data.gallery ?? next.gallery,
        }));
      }
    } catch (error) {
      setUpdateStatus({
        type: 400,
        message: error?.message || "Failed to save photos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await handleUpdate();
    setIsLoading(false);
  };
  const { t } = useTranslation();
  // Динамические модели из базы
  const [dbCarModels, setDbCarModels] = useState([]);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchModels = async () => {
      try {
        // Получаем уже уникальные модели (API-level дедупликация)
        const res = await fetch("/api/apartment/models", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        // Поддержка как массива строк, так и массива объектов { model }
        const raw = data.map((item) =>
          typeof item === "string" ? item : item?.model
        );
        const models = Array.from(
          new Set(
            raw.filter((m) => typeof m === "string" && m.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        if (!cancelled) setDbCarModels(models);
      } catch (_) {
        // игнорируем ошибку, останутся статические модели
      }
    };
    fetchModels();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    setLocalCompanies(Array.isArray(companies) ? companies : EMPTY_COMPANIES);
  }, [companies]);

  useEffect(() => {
    if (!open || !isSuperAdmin || SINGLE_PROPERTY_MODE || localCompanies.length > 0) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/owners");
        if (!res.ok) return;
        const body = await res.json();
        if (!cancelled && body?.success && Array.isArray(body.companies)) {
          setLocalCompanies(body.companies);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isSuperAdmin, localCompanies.length]);

  const autoCompleteOptions = useMemo(() => {
    const fallbackModels = [
      "Audi",
      "BMW",
      "BYD",
      "Chevrolet",
      "Citroën",
      "Dacia",
      "Dodge",
      "Fiat",
      "Ford",
      "Honda",
      "Hyundai",
      "Isuzu",
      "Kia",
      "Mazda",
      "Mercedes-Benz",
      "MG",
      "Mini",
      "Mitsubishi",
      "Nissan",
      "Opel",
      "Peugeot",
      "Renault",
      "Seat",
      "Škoda",
      "Smart",
      "Suzuki",
      "Tesla",
      "Toyota",
      "Volkswagen",
      "Volvo",
    ];
    // Объединяем статический список, БД и текущую модель авто, убираем повторы и сортируем A→Z
    const lowerSeen = new Set();
    const merged = [];
    const add = (val) => {
      if (typeof val !== "string") return;
      const v = val.trim();
      if (!v) return;
      const key = v.toLowerCase();
      if (lowerSeen.has(key)) return;
      lowerSeen.add(key);
      merged.push(v);
    };
    fallbackModels.forEach(add);
    dbCarModels.forEach(add);
    add(updatedCar?.model);
    return merged.sort((a, b) => a.localeCompare(b));
  }, [dbCarModels, updatedCar?.model]);
  
  // Actions buttons for DialogLayout
  const modalActions = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CancelButton
        onClick={onClose}
        disabled={isLoading}
        label={t("basic.cancel")}
      />
      <ConfirmButton
        onClick={handleSave}
        loading={isLoading}
        label={t("basic.save")}
      />
    </Box>
  );

  return (
    <DialogLayout
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      title={t("carPark.updateCar")}
      showCloseButton={true}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      actions={modalActions}
      contentSx={{ opacity: isLoading ? 0.3 : 1, transition: "opacity 0.2s" }}
      >
        <Grid container spacing={3} sx={{ flexGrow: 1, pt: 4 }}>
          <Grid item xs={12} md={5}>
            <SuiteGalleryEditor
              photoUrl={updatedCar?.photoUrl}
              gallery={updatedCar?.gallery}
              onChange={handleGalleryChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
          {isSuperAdmin && !SINGLE_PROPERTY_MODE && (
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-car-company">Company</InputLabel>
                <Select
                  labelId="edit-car-company"
                  label="Company"
                  name="ownerId"
                  value={
                    updatedCar.ownerId
                      ? String(updatedCar.ownerId)
                      : ""
                  }
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {localCompanies.map((c) => (
                    <MenuItem key={String(c._id)} value={String(c._id)}>
                      {c.name || String(c._id)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {/* Column 1 */}
          <Grid item xs={12} sm={3}>
            <Stack spacing={3} >
              <Autocomplete
                freeSolo
                options={autoCompleteOptions}
                value={updatedCar.model || ""}
                onChange={(_, newValue) =>
                  handleChange({
                    target: { name: "model", value: newValue || "" },
                  })
                }
                onInputChange={(_, inputValue, reason) => {
                  // Ignore Autocomplete "reset"/"blur" — those re-fire on every parent render and loop.
                  if (reason !== "input" && reason !== "clear") return;
                  handleChange({
                    target: { name: "model", value: inputValue },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("car.model")}
                    name="model"
                    disabled={isLoading}
                    defaultValue="Toyota"
                  />
                )}
              />
              {!SINGLE_PROPERTY_MODE && (
                <RenderSelectField
                  name="transmission"
                  label={t("car.transmission")}
                  options={Object.values(TRANSMISSION_TYPES)}
                  required
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
              )}
              <RenderTextField
                type="number"
                name="seats"
                label={
                  SINGLE_PROPERTY_MODE
                    ? "Max guests"
                    : t("car.seats")
                }
                defaultValue={updatedCar.seats}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              {!SINGLE_PROPERTY_MODE && (
              <RenderTextField
                type="number"
                name="PriceKacko"
                label={t("car.KackoPrice") || "Цена КАСКО в день"}
                defaultValue={updatedCar.PriceKacko}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Stack spacing={3}>
              {!SINGLE_PROPERTY_MODE && (
                <>
                  <RenderTextField
                    name="registration"
                    label={t("car.reg-year")}
                    defaultValue={updatedCar.registration}
                    type="number"
                    updatedCar={updatedCar}
                    handleChange={handleChange}
                    isLoading={isLoading}
                  />
                  <RenderSelectField
                    name="fueltype"
                    label={t("car.fuel")}
                    options={Object.values(FUEL_TYPES)}
                    updatedCar={updatedCar}
                    handleChange={handleChange}
                    isLoading={isLoading}
                  />
                </>
              )}
              <RenderTextField
                type="number"
                name="numberOfDoors"
                label={SINGLE_PROPERTY_MODE ? "Bedrooms" : t("car.doors")}
                defaultValue={updatedCar.numberOfDoors}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              {!SINGLE_PROPERTY_MODE && (
                <RenderTextField
                  type="number"
                  name="franchise"
                  label={t("car.franchise") || "Франшиза"}
                  defaultValue={updatedCar.franchise}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
              )}
            </Stack>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={12} sm={3}>
            <Stack spacing={3}>
              <RenderTextField
                name="regNumber"
                label={SINGLE_PROPERTY_MODE ? "Unit code" : t("car.reg-numb")}
                defaultValue={updatedCar.regNumber}
                updatedCar={updatedCar}
                handleChange={handleChange}
                isLoading={isLoading}
              />
              {!SINGLE_PROPERTY_MODE && (
                <>
                  <RenderTextField
                    type="number"
                    name="engine"
                    label={t("car.engine")}
                    defaultValue={updatedCar.enginePower}
                    updatedCar={updatedCar}
                    handleChange={handleChange}
                    isLoading={isLoading}
                    adornment="c.c."
                  />
                  <Autocomplete
                    freeSolo
                    options={Object.values(PREDEFINED_COLORS)}
                    value={updatedCar.color || ""}
                    getOptionLabel={(option) =>
                      typeof option === "string" && option.length > 0
                        ? option.charAt(0).toUpperCase() + option.slice(1)
                        : option
                    }
                    onChange={(_, newValue) => {
                      handleChange({
                        target: {
                          name: "color",
                          value: (newValue || "").toLowerCase(),
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("car.color") || "Цвет"}
                        name="color"
                        disabled={isLoading}
                        onChange={(e) => {
                          handleChange({
                            target: {
                              name: "color",
                              value: e.target.value.toLowerCase(),
                            },
                          });
                        }}
                      />
                    )}
                  />
                  <RenderTextField
                    type="number"
                    name="deposit"
                    label={t("car.deposit") || "Залог, €"}
                    defaultValue={
                      typeof updatedCar.deposit !== "undefined"
                        ? updatedCar.deposit
                        : ""
                    }
                    updatedCar={updatedCar}
                    handleChange={handleChange}
                    isLoading={isLoading}
                  />
                </>
              )}
              {SINGLE_PROPERTY_MODE && (
                <RenderTextField
                  type="number"
                  name="beds"
                  label="Beds"
                  defaultValue={updatedCar.beds ?? ""}
                  updatedCar={updatedCar}
                  handleChange={handleChange}
                  isLoading={isLoading}
                />
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3}>
            <RenderSelectField
              name="class"
              label={t("car.class") || "Type"}
              options={[
                ...Object.values(APARTMENT_TYPES),
                ...Object.values(CAR_CLASSES).filter(
                  (v) => !Object.values(APARTMENT_TYPES).includes(v)
                ),
              ]}
              required
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
            />
            <RenderTextField
              type="number"
              name="bathrooms"
              label="Bathrooms"
              defaultValue={updatedCar.bathrooms ?? 1}
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
            />
            <RenderTextField
              type="number"
              name="sizeSqm"
              label="Size (m²)"
              defaultValue={updatedCar.sizeSqm ?? ""}
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
            />
            <RenderTextField
              type="number"
              name="floor"
              label="Floor"
              defaultValue={updatedCar.floor ?? ""}
              updatedCar={updatedCar}
              handleChange={handleChange}
              isLoading={isLoading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={updatedCar.airConditioning || false}
                  onChange={handleCheckboxChange}
                  name="airConditioning"
                  disabled={isLoading}
                />
              }
              label={t("car.air")}
              sx={{ my: 0.5 }}
            />
          </Grid>

          </Grid>
          </Grid>

          <Grid item xs={12}>
            <PricingTiersTable
              car={updatedCar}
              open={open}
              disabled={isLoading}
              handleChange={handleChange}
              setUpdatedCar={setUpdatedCar}
              mirrorAllSeasonsFromNoSeason={company?.useSeasons === false}
            />
          </Grid>
        </Grid>
    </DialogLayout>
  );
};

export default EditCarModal;
