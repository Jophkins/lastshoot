import { z } from "zod";

export const signUploadRequestSchema = z.object({
  files: z.array(
    z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1),
      variant: z.enum(["original", "preview", "thumb"]),
    }),
  ).min(1).max(30), // reasonable batch limit
});

export type SignUploadRequest = z.infer<typeof signUploadRequestSchema>;
