import exifr from "exifr";

/**
 * EXIF fields we extract and persist.
 * GPS data is intentionally excluded per agents.md policy.
 */
export type ExifData = {
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  aperture?: number;
  shutter?: string;
  iso?: number;
  takenAt?: string; // ISO 8601
};

/**
 * Extract safe EXIF fields from a File. GPS is never read.
 */
export async function extractExif(file: File): Promise<ExifData> {
  try {
    const raw = await exifr.parse(file, {
      // Only pick needed tags, GPS explicitly excluded
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
      ],
      gps: false,
    });

    if (!raw) {
      return {};
    }

    return {
      cameraMake: raw.Make ?? undefined,
      cameraModel: raw.Model ?? undefined,
      lensModel: raw.LensModel ?? undefined,
      focalLength: raw.FocalLength ?? undefined,
      aperture: raw.FNumber ?? undefined,
      shutter: raw.ExposureTime
        ? formatShutter(raw.ExposureTime)
        : undefined,
      iso: raw.ISO ?? undefined,
      takenAt: raw.DateTimeOriginal
        ? new Date(raw.DateTimeOriginal).toISOString()
        : undefined,
    };
  }
  catch {
    return {};
  }
}

function formatShutter(seconds: number): string {
  if (seconds >= 1) {
    return `${seconds}s`;
  }
  return `1/${Math.round(1 / seconds)}`;
}
