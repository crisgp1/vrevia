import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@clerk/nextjs/server"
import connectDB from "@/lib/db/connection"
import { User } from "@/lib/db/models"

const f = createUploadthing()

async function getUser() {
  const { userId } = await auth()
  if (!userId) return null

  await connectDB()
  const user = await User.findOne({ clerkId: userId }).lean()
  return user
}

export const ourFileRouter = {
  materialUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getUser()

      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized")
      }

      return { userId: user._id.toString() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.ufsUrl)

      return { url: file.ufsUrl, name: file.name }
    }),

  assignmentUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getUser()

      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized")
      }

      return { userId: user._id.toString() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Assignment upload complete for userId:", metadata.userId)
      return { url: file.ufsUrl, name: file.name }
    }),

  submissionUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getUser()

      if (!user) {
        throw new Error("Unauthorized")
      }

      return { userId: user._id.toString() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Submission upload complete for userId:", metadata.userId)
      return { url: file.ufsUrl, name: file.name }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
