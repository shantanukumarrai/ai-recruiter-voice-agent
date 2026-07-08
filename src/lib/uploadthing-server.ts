import { UTApi } from "uploadthing/server";

/** Server-side UploadThing client — used for uploads we generate ourselves
 * (PDF/Markdown reports), as opposed to `ourFileRouter` which handles
 * uploads initiated directly from the browser (resumes). */
export const utapi = new UTApi();
