"use client";

/**
 * General (property) photos — company.assets.galleryImages.
 * Shown in homepage PropertyGallery. Optionally one URL → assets.heroLeadImage
 * as the first SuitesHero slide.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useMainContext } from "@app/Context";
import { isDirectImageSrc } from "@/domain/media/imageSrc";
import { CldImage } from "next-cloudinary";

function Thumb({ src }) {
  if (!src) return null;
  if (isDirectImageSrc(src)) {
    return (
      <Box
        component="img"
        src={src}
        alt=""
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
        alt=""
        fill
        crop="fill"
        sizes="160px"
        style={{ objectFit: "cover" }}
      />
    </Box>
  );
}

export default function GeneralImagesModal({ open, onClose }) {
  const { company, updateCompanyInContext } = useMainContext();
  const inputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [heroLead, setHeroLead] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fromDb = Array.isArray(company?.assets?.galleryImages)
      ? company.assets.galleryImages.filter(
          (u) => typeof u === "string" && u.trim()
        )
      : [];
    const lead = String(company?.assets?.heroLeadImage || "").trim();
    setImages(fromDb);
    setHeroLead(lead && fromDb.includes(lead) ? lead : "");
    setError("");
    setSavedOk(false);
  }, [open, company?.assets?.galleryImages, company?.assets?.heroLeadImage]);

  const persist = useCallback(
    async ({ nextImages, nextLead }) => {
      setSaving(true);
      setError("");
      setSavedOk(false);
      const gallery = Array.isArray(nextImages) ? nextImages : images;
      let lead =
        nextLead !== undefined ? String(nextLead || "").trim() : heroLead;
      if (lead && !gallery.includes(lead)) lead = "";
      try {
        const response = await fetch("/api/company", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "assets.galleryImages": gallery,
            "assets.heroLeadImage": lead,
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || "Failed to save General photos");
        }
        if (company?._id) {
          await updateCompanyInContext(company._id, data);
        }
        setImages(gallery);
        setHeroLead(lead);
        setSavedOk(true);
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [company?._id, heroLead, images, updateCompanyInContext]
  );

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      String(f.type || "").startsWith("image/")
    );
    if (!files.length) return;

    setUploading(true);
    setError("");
    setSavedOk(false);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("purpose", "general");
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
      const merged = [...images];
      uploaded.forEach((url) => {
        if (url && !merged.includes(url)) merged.push(url);
      });
      await persist({ nextImages: merged });
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = async (idx) => {
    const removed = images[idx];
    const next = images.filter((_, i) => i !== idx);
    const nextLead = heroLead === removed ? "" : heroLead;
    await persist({ nextImages: next, nextLead });
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    await persist({ nextImages: next });
  };

  const toggleLead = async (src) => {
    const nextLead = heroLead === src ? "" : src;
    await persist({ nextLead });
  };

  const busy = uploading || saving;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>General photos (homepage gallery)</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These photos appear in the homepage “The property” gallery. Optionally
          mark one as the first hero slide (star). Dedicated hero carousel photos
          are managed separately.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        {savedOk ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Saved to Mongo — live homepage gallery uses these images.
          </Alert>
        ) : null}

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {images.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                bgcolor: "grey.100",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No General photos yet — homepage gallery falls back to suite
                photos if any.
              </Typography>
            </Box>
          ) : (
            images.map((src, idx) => {
              const isLead = heroLead === src;
              return (
                <Stack
                  key={`${src}-${idx}`}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: isLead ? "primary.main" : "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 96,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 0.5,
                      overflow: "hidden",
                      bgcolor: "grey.200",
                      position: "relative",
                    }}
                  >
                    <Thumb src={src} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isLead ? "First hero · " : `${idx + 1} · `}
                    {src}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={
                      isLead ? "Clear first hero" : "Use as first hero"
                    }
                    title={isLead ? "Clear first hero" : "Use as first hero"}
                    disabled={busy}
                    color={isLead ? "primary" : "default"}
                    onClick={() => toggleLead(src)}
                  >
                    {isLead ? (
                      <StarIcon fontSize="small" />
                    ) : (
                      <StarBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Move up"
                    disabled={busy || idx === 0}
                    onClick={() => move(idx, -1)}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Move down"
                    disabled={busy || idx === images.length - 1}
                    onClick={() => move(idx, 1)}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Remove"
                    disabled={busy}
                    onClick={() => removeAt(idx)}
                    color="error"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              );
            })
          )}
        </Stack>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <Button
          variant="contained"
          startIcon={
            busy ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PhotoCameraOutlinedIcon />
            )
          }
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload General photos"}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
