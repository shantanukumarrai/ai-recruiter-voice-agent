import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { requireCurrentUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Runs on the server before the upload is accepted — this is the
      // actual auth boundary, not just a UI gate. Only a signed-in
      // recruiter can obtain an upload URL at all.
      const user = await requireCurrentUser().catch(() => null);
      if (!user) {
        throw new UploadThingError("You must be signed in to upload a resume.");
      }
      return { recruiterId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.recruiterId, url: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
