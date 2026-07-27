import React, { useState, useMemo, useEffect } from "react";
import {
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import DialogLayout from "@/app/components/ui/modals/DialogLayout";
import { ConfirmButton, CancelButton } from "@/app/components/ui";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PricingTiers from "../PricingTiers";
import { useMainContext } from "@app/Context";
import {
  APARTMENT_TYPES,
  defaultPrices,
  apartmentHasAmenity,
  toggleApartmentAmenity,
} from "@models/enums";
import {
  RenderTextField,
} from "@/app/components/ui/inputs/Fields";
import SuiteGalleryEditor from "@/app/components/ui/media/SuiteGalleryEditor";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { ROLE } from "@/domain/orders/admin-rbac";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";

const AddCarModal = ({
  open,
  onClose,
  setUpdateStatus,
}) => {
  const { resubmitCars, company } = useMainContext();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === ROLE.SUPERADMIN;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [dbCarModels, setDbCarModels] = useState([]);
  const [carData, setCarData] = useState({
    model: "Suite",
    class: APARTMENT_TYPES.SUITE,
    transmission: "automatic",
    fueltype: "electric",
    seats: 2,
    registration: new Date().getFullYear(),
    regNumber: "S-01",
    color: "white",
    numberOfDoors: 1,
    airConditioning: true,
    enginePower: 0,
    engine: "0",
    pricingTiers: defaultPrices,
    photoUrl: CLOUDINARY_PLACEHOLDER_PUBLIC_ID,
    gallery: [],
    deposit: 0,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 45,
    floor: 1,
    transferPrice: 0,
    description: "",
    amenities: ["wifi", "kitchen", "air conditioning"],
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (carData[name] !== newValue) {
      setCarData((prevData) => ({ ...prevData, [name]: newValue }));
    }
  };

  const handleGalleryChange = async ({ photoUrl, gallery }) => {
    setCarData((prev) => ({
      ...prev,
      photoUrl: photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID,
      gallery: Array.isArray(gallery) ? gallery : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("model", carData.model);
      formData.append("class", carData.class);
      formData.append("regNumber", carData.regNumber || carData.model);
      formData.append("transmission", carData.transmission || "automatic");
      formData.append("fueltype", carData.fueltype || "electric");
      formData.append("seats", String(carData.seats));
      formData.append("numberOfDoors", String(carData.numberOfDoors ?? 1));
      formData.append(
        "airConditioning",
        carData.airConditioning ? "true" : "false"
      );
      formData.append("enginePower", String(carData.enginePower ?? 0));
      formData.append("engine", String(carData.engine ?? "0"));
      formData.append("color", String(carData.color || "white"));
      formData.append(
        "registration",
        String(carData.registration || new Date().getFullYear())
      );
      formData.append("deposit", String(carData.deposit ?? 0));
      formData.append("pricingTiers", JSON.stringify(carData.pricingTiers));
      formData.append("bathrooms", String(carData.bathrooms ?? 1));
      if (carData.sizeSqm != null) formData.append("sizeSqm", String(carData.sizeSqm));
      if (carData.floor != null) formData.append("floor", String(carData.floor));
      if (carData.beds != null) formData.append("beds", String(carData.beds));
      formData.append("transferPrice", String(carData.transferPrice ?? 0));
      formData.append("description", carData.description || "");
      formData.append("amenities", JSON.stringify(carData.amenities || []));
      formData.append("photoUrl", carData.photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID);
      formData.append("gallery", JSON.stringify(carData.gallery || []));

      if (isSuperAdmin && ownerId && !SINGLE_PROPERTY_MODE) {
        formData.append("ownerId", ownerId);
      }

      const response = await fetch("/api/apartment/addOne", {
        method: "POST",
        body: formData,
      });
      const contentType = response.headers.get("content-type") || "";
      let result;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `Unexpected non-JSON response (status ${response.status})`
        );
      }

      if (!response.ok || result?.success === false) {
        const details = result?.details ? ` — ${result.details}` : "";
        throw new Error(
          `${result?.message || response.statusText || "Failed"}${details}`
        );
      }

      setUpdateStatus({ message: result.message || "OK", type: 200 });
      await resubmitCars();
      onClose();
    } catch (error) {
      setUpdateStatus({
        message: error?.message || "Unknown error",
        type: 400,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apartment/all", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const models = Array.from(
          new Set(
            data
              .map((c) => c.model)
              .filter((m) => typeof m === "string" && m.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        if (!cancelled) setDbCarModels(models);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isSuperAdmin || SINGLE_PROPERTY_MODE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/owners");
        if (!res.ok) return;
        const body = await res.json();
        if (!cancelled && body?.success && Array.isArray(body.companies)) {
          setCompanies(body.companies);
          if (!ownerId && body.companies[0]?._id) {
            setOwnerId(String(body.companies[0]._id));
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isSuperAdmin]);

  const autoCompleteOptions = useMemo(() => dbCarModels, [dbCarModels]);

  const modalActions = (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
      <CancelButton onClick={onClose} disabled={loading} label={t("basic.cancel")} />
      <ConfirmButton
        type="submit"
        form="add-car-form"
        loading={loading}
        label={t("carPark.addCar") || "Add apartment"}
      />
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DialogLayout
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        title={t("carPark.addNewCar") || "Add apartment"}
        showCloseButton
        closeOnBackdropClick={false}
        closeOnEscape={false}
        actions={modalActions}
        contentSx={{
          position: "relative",
          opacity: loading ? 0.3 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <form id="add-car-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSuperAdmin && !SINGLE_PROPERTY_MODE && (
              <Grid item xs={12}>
                <FormControl fullWidth required size="small">
                  <InputLabel id="add-car-company">{t("car.company")}</InputLabel>
                  <Select
                    labelId="add-car-company"
                    label={t("car.company")}
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    {companies.map((c) => (
                      <MenuItem key={String(c._id)} value={String(c._id)}>
                        {c.name || String(c._id)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <Stack spacing={2}>
                <Autocomplete
                  freeSolo
                  options={autoCompleteOptions}
                  value={carData.model || ""}
                  onChange={(_, newValue) =>
                    handleChange({ target: { name: "model", value: newValue || "" } })
                  }
                  onInputChange={(_, inputValue, reason) => {
                    if (reason !== "input" && reason !== "clear") return;
                    handleChange({
                      target: { name: "model", value: inputValue },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("car.model") || "Suite name"}
                      name="model"
                      required
                    />
                  )}
                />
                <RenderTextField
                  type="number"
                  name="seats"
                  label={t("car.seats") || "Max guests"}
                  defaultValue="2"
                  updatedCar={carData}
                  handleChange={handleChange}
                />
                <RenderTextField
                  type="number"
                  name="numberOfDoors"
                  label={t("car.doors") || "Bedrooms"}
                  defaultValue={carData.numberOfDoors}
                  updatedCar={carData}
                  handleChange={handleChange}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={2}>
                <RenderTextField
                  type="number"
                  name="bathrooms"
                  label={t("car.bathrooms")}
                  defaultValue={carData.bathrooms}
                  updatedCar={carData}
                  handleChange={handleChange}
                />
                <RenderTextField
                  type="number"
                  name="beds"
                  label={t("car.beds")}
                  defaultValue={carData.beds}
                  updatedCar={carData}
                  handleChange={handleChange}
                />
                <RenderTextField
                  type="number"
                  name="sizeSqm"
                  label={t("car.sizeSqm")}
                  defaultValue={carData.sizeSqm}
                  updatedCar={carData}
                  handleChange={handleChange}
                />
                <RenderTextField
                  type="number"
                  name="floor"
                  label={t("car.floor")}
                  defaultValue={carData.floor}
                  updatedCar={carData}
                  handleChange={handleChange}
                />
                {SINGLE_PROPERTY_MODE ? (
                  <RenderTextField
                    type="number"
                    name="transferPrice"
                    label={t("car.transferPrice")}
                    defaultValue={carData.transferPrice ?? 0}
                    updatedCar={carData}
                    handleChange={handleChange}
                  />
                ) : (
                  <RenderTextField
                    type="number"
                    name="deposit"
                    label={t("car.deposit") || "Deposit, €"}
                    defaultValue={carData.deposit || 0}
                    updatedCar={carData}
                    handleChange={handleChange}
                  />
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!carData.airConditioning}
                      onChange={handleChange}
                      name="airConditioning"
                    />
                  }
                  label={t("car.air") || "Air conditioning"}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={apartmentHasAmenity(carData.amenities, "balcony")}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          amenities: toggleApartmentAmenity(
                            prev.amenities,
                            "balcony",
                            e.target.checked
                          ),
                        }))
                      }
                    />
                  }
                  label={t("car.balcony")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={apartmentHasAmenity(carData.amenities, "terrace")}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          amenities: toggleApartmentAmenity(
                            prev.amenities,
                            "terrace",
                            e.target.checked
                          ),
                        }))
                      }
                    />
                  }
                  label={t("car.terrace")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={apartmentHasAmenity(carData.amenities, "sea view")}
                      onChange={(e) =>
                        setCarData((prev) => ({
                          ...prev,
                          amenities: toggleApartmentAmenity(
                            prev.amenities,
                            "sea view",
                            e.target.checked
                          ),
                        }))
                      }
                    />
                  }
                  label={t("car.seaView")}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={2}>
                <TextField
                  name="description"
                  label={t("car.shortDescription")}
                  multiline
                  minRows={3}
                  value={carData.description || ""}
                  onChange={handleChange}
                  fullWidth
                />
                <SuiteGalleryEditor
                  photoUrl={carData.photoUrl}
                  gallery={carData.gallery}
                  onChange={handleGalleryChange}
                  disabled={loading}
                  compact
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <PricingTiers
                car={carData}
                open={open}
                handleChange={handleChange}
                setUpdatedCar={resubmitCars}
                isAddcar={true}
                defaultPrices={defaultPrices}
                mirrorAllSeasonsFromNoSeason={company?.useSeasons === false}
              />
            </Grid>
          </Grid>
        </form>
      </DialogLayout>
    </LocalizationProvider>
  );
};

export default AddCarModal;
