import multer from "multer";
import { MAX_FONT_FILE_BYTES, MAX_UPLOAD_IMAGE_BYTES } from "@d-shirtak/shared";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_IMAGE_BYTES },
});

export const fontUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FONT_FILE_BYTES },
});
