import { z } from "zod";

export const commitPhotoSchema = z.object({
  originalKey: z.string().min(1),
  previewKey: z.string().min(1),
  thumbKey: z.string().min(1),

  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),

  // Camera / EXIF — all optional, GPS is intentionally excluded
  cameraMake: z.string().optional(),
  cameraModel: z.string().optional(),
  lensModel: z.string().optional(),
  focalLength: z.number().optional(),
  aperture: z.number().optional(),
  shutter: z.string().optional(),
  iso: z.number().int().optional(),
  takenAt: z.string().datetime().optional(),
});

export type CommitPhotoInput = z.infer<typeof commitPhotoSchema>;

export const updatePhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),

  cameraMake: z.string().optional(),
  cameraModel: z.string().optional(),
  lensModel: z.string().optional(),
  focalLength: z.number().optional(),
  aperture: z.number().optional(),
  shutter: z.string().optional(),
  iso: z.number().int().optional(),
  takenAt: z.string().datetime().optional(),
});

export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
