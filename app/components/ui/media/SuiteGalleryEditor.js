"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { useTranslation } from "react-i18next";

function isHttp(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function isPlaceholder(id) {
  return (
    !id ||
    id === CLOUDINARY_PLACEHOLDER_PUBLIC_ID ||
    String(id).endsWith("/NO_PHOTO")
  );
}

function buildPhotoList(photoUrl, gallery) {
  const list = [];
  if (photoUrl && !isPlaceholder(photoUrl)) list.push(photoUrl);
  if (Array.isArray(gallery)) {
    gallery.forEach((u) => {
      if (u && !isPlaceholder(u) && !list.includes(u)) list.push(u);
    });
  }
  return list;
}

function SuitePhoto({ src, alt, sizes = "200px" }) {
  if (!src || isPlaceholder(src)) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No photo
        </Typography>
      </Box>
    );
  }

  if (isHttp(src)) {
    return (
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <CldImage
        src={src}
        alt={alt}
        fill
        crop="fill"
        sizes={sizes}
        style={{ objectFit: "cover" }}
      />
    </Box>
  );
}

/**
 * Admin suite/car gallery: upload, carousel preview, set cover, remove.
 *
 * @param {string} photoUrl — cover (Cloudinary public_id or https URL)
 * @param {string[]} gallery — extra images
 * @param {(next: { photoUrl: string, gallery: string[] }) => void | Promise<void>} onChange
 * @param {boolean} [disabled]
 * @param {boolean} [compact] — smaller preview (add modal)
 */
export default function SuiteGalleryEditor({
  photoUrl,
  gallery = [],
  onChange,
  disabled = false,
  compact = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const photos = useMemo(
    () => buildPhotoList(photoUrl, gallery),
    [photoUrl, gallery]
  );

  const safeIndex = photos.length
    ? Math.min(index, photos.length - 1)
    : 0;
  const current = photos[safeIndex] || null;
  const cover = photos[0] || photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID;

  const emit = useCallback(
    async (nextCover, nextGallery) => {
      setError("");
      await onChange({
        photoUrl: nextCover || CLOUDINARY_PLACEHOLDER_PUBLIC_ID,
        gallery: nextGallery.filter(
          (u) => u && u !== nextCover && !isPlaceholder(u)
        ),
      });
    },
    [onChange]
  );

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      String(f.type || "").startsWith("image/")
    );
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch("/api/order/update/image", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data?.success || !data?.data) {
          throw new Error(data?.message || "Upload failed");
        }
        uploaded.push(data.data);
      }

      const existing = buildPhotoList(photoUrl, gallery);
      const merged = [...existing];
      uploaded.forEach((id) => {
        if (id && !merged.includes(id)) merged.push(id);
      });
      const nextCover = merged[0] || CLOUDINARY_PLACEHOLDER_PUBLIC_ID;
      const nextGallery = merged.slice(1);
      await emit(nextCover, nextGallery);
      setIndex(Math.max(0, merged.length - uploaded.length));
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSetCover = async (src) => {
    if (!src || src === cover) return;
    const rest = photos.filter((p) => p !== src);
    await emit(src, rest);
    setIndex(0);
  };

  const handleRemove = async (src) => {
    if (!src) return;
    const rest = photos.filter((p) => p !== src);
    if (!rest.length) {
      await emit(CLOUDINARY_PLACEHOLDER_PUBLIC_ID, []);
      setIndex(0);
      return;
    }
    const nextCover = rest[0];
    await emit(nextCover, rest.slice(1));
    setIndex((i) => Math.min(i, rest.length - 1));
  };

  const go = (dir) => {
    if (photos.length < 2) return;
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {t("suites.photosTitle")}
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: compact ? "3 / 2" : "16 / 10",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "grey.100",
          border: "1px solid",
          borderColor: "divider",
          mb: 1.5,
        }}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          <SuitePhoto
            src={current}
            alt="Suite preview"
            sizes={compact ? "400px" : "720px"}
          />
        </Box>

        {photos.length > 1 && (
          <>
            <IconButton
              size="small"
              onClick={() => go(-1)}
              disabled={disabled || uploading}
              aria-label={t("suites.prevPhoto")}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => go(1)}
              disabled={disabled || uploading}
              aria-label={t("suites.nextPhoto")}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Chip
              size="small"
              label={`${safeIndex + 1} / ${photos.length}`}
              sx={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0,0,0,0.55)",
                color: "#fff",
              }}
            />
          </>
        )}

        {uploading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={36} sx={{ color: "#fff" }} />
          </Box>
        )}
      </Box>

      {photos.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: 1,
            mb: 1,
            "&::-webkit-scrollbar": { height: 6 },
          }}
        >
          {photos.map((src, i) => {
            const isCover = i === 0;
            const selected = i === safeIndex;
            return (
              <Box
                key={`${src}-${i}`}
                sx={{
                  position: "relative",
                  flex: "0 0 auto",
                  width: 72,
                  height: 56,
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "2px solid",
                  borderColor: selected
                    ? "primary.main"
                    : isCover
                      ? "warning.main"
                      : "divider",
                  cursor: "pointer",
                }}
                onClick={() => setIndex(i)}
              >
                <SuitePhoto src={src} alt={`Thumb ${i + 1}`} sizes="72px" />
                {isCover && (
                  <Chip
                    label={t("suites.coverBadge")}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      height: 18,
                      fontSize: 10,
                      bgcolor: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      "& .MuiChip-label": { px: 0.5 },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<PhotoCameraOutlinedIcon />}
          disabled={disabled || uploading}
          sx={{ textTransform: "none" }}
        >
          {t("suites.addPhoto")}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            multiple
            hidden
            disabled={disabled || uploading}
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </Button>

        {current && !isPlaceholder(current) && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                current === cover ? <StarIcon /> : <StarBorderIcon />
              }
              disabled={disabled || uploading || current === cover}
              onClick={() => handleSetCover(current)}
              sx={{ textTransform: "none" }}
            >
              {current === cover
                ? t("suites.coverBadge")
                : t("suites.setAsCover")}
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              disabled={disabled || uploading}
              onClick={() => handleRemove(current)}
              sx={{ textTransform: "none" }}
            >
              {t("suites.deletePhoto")}
            </Button>
          </>
        )}
      </Stack>

      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {t("suites.photosHint")}
        </Typography>
      )}
    </Box>
  );
}
