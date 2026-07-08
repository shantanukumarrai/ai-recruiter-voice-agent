import { prisma } from "@/lib/prisma";

export async function listNotesForApplication(applicationId: string, recruiterId: string) {
  // Ownership check happens via the where-clause itself: the note's
  // parent application must belong to a job this recruiter created.
  return prisma.recruiterNote.findMany({
    where: { applicationId, application: { job: { createdById: recruiterId } } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(applicationId: string, authorId: string, content: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { createdById: authorId } },
    select: { id: true },
  });
  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");
  }

  return prisma.recruiterNote.create({
    data: { applicationId, authorId, content },
    include: { author: true },
  });
}

export async function deleteNote(noteId: string, authorId: string) {
  // Only the author can delete their own note — not just any recruiter on the job.
  const result = await prisma.recruiterNote.deleteMany({
    where: { id: noteId, authorId },
  });
  return result.count > 0;
}
