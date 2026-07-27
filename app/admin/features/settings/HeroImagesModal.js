"use client";

/**
 * Homepage hero photos — company.assets.heroImages in Mongo.
 * These are the ONLY images used by SuitesHero carousel (never suite photos).
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
import { useMainContext } from "@app/Context";
import { isDirectImageSrc } from "@/domain/media/imageSrc";
import { CldImage } from "next-cloudinary";

function HeroThumb({ src }) {
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

export default function HeroImagesModal({ open, onClose }) {
  const { company, updateCompanyInContext } = useMainContext();
  const inputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fromDb = Array.isArray(company?.assets?.heroImages)
      ? company.assets.heroImages.filter(
          (u) => typeof u === "string" && u.trim()
        )
      : [];
    setImages(fromDb);
    setError("");
    setSavedOk(false);
  }, [open, company?.assets?.heroImages]);

  const persist = useCallback(
    async (nextImages) => {
      setSaving(true);
      setError("");
      setSavedOk(false);
      try {
        const response = await fetch("/api/company", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "assets.heroImages": nextImages }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || "Failed to save hero photos");
        }
        if (company?._id) {
          await updateCompanyInContext(company._id, data);
        }
        setImages(nextImages);
        setSavedOk(true);
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [company?._id, updateCompanyInContext]
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
        formData.append("purpose", "hero");
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
      await persist(merged);
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = async (idx) => {
    const next = images.filter((_, i) => i !== idx);
    await persist(next);
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    await persist(next);
  };

  const busy = uploading || saving;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Homepage hero photos</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These photos power the homepage hero carousel only. Suite / room
          photos are never used here. Upload pool, exterior, and atmosphere
          shots — not room interiors unless you want them on the hero.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        {savedOk ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Saved to Mongo — live site uses these images.
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
                No hero photos yet — homepage shows the branded gradient.
              </Typography>
            </Box>
          ) : (
            images.map((src, idx) => (
              <Stack
                key={`${src}-${idx}`}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
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
                  <HeroThumb src={src} />
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
                  {idx === 0 ? "1st (first slide) · " : `${idx + 1} · `}
                  {src}
                </Typography>
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
            ))
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
          {uploading ? "Uploading…" : "Upload hero photos"}
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
