import { auth, currentUser } from "@clerk/nextjs/server"
import connectDB from "@/lib/db/connection"
import { User } from "@/lib/db/models"

export interface CurrentUser {
  id: string
  clerkId: string
  email: string
  name: string
  role: "admin" | "student"
  phone?: string
  level?: string
  currentLesson: number
  group?: string
  classType?: string
  startDate?: Date
  isActive: boolean
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  await connectDB()

  let user = await User.findOne({ clerkId: userId }).lean()

  // Auto-sync: If user is authenticated with Clerk but not in MongoDB, create them
  if (!user) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Usuario"

    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments()

    const newUser = await User.create({
      clerkId: clerkUser.id,
      email,
      name,
      role: userCount === 0 ? "admin" : "student",
      isActive: true,
    })

    return {
      id: newUser._id.toString(),
      clerkId: newUser.clerkId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      level: newUser.level,
      currentLesson: newUser.currentLesson || 1,
      group: newUser.group?.toString(),
      classType: newUser.classType,
      startDate: newUser.startDate,
      isActive: newUser.isActive,
    }
  }

  return {
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    level: user.level,
    currentLesson: user.currentLesson || 1,
    group: user.group?.toString(),
    classType: user.classType,
    startDate: user.startDate,
    isActive: user.isActive,
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser()

  if (user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  return user
}

export async function requireStudent(): Promise<CurrentUser> {
  const user = await requireUser()

  if (user.role !== "student") {
    throw new Error("Unauthorized - Student access required")
  }

  return user
}

// Sync Clerk user with MongoDB (call this on sign-up or first login)
export async function syncClerkUser(clerkUser: {
  id: string
  emailAddresses: { emailAddress: string }[]
  firstName: string | null
  lastName: string | null
}): Promise<CurrentUser> {
  await connectDB()

  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Usuario"

  let user = await User.findOne({ clerkId: clerkUser.id })

  if (!user) {
    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments()

    user = await User.create({
      clerkId: clerkUser.id,
      email,
      name,
      role: userCount === 0 ? "admin" : "student",
      isActive: true,
    })
  } else {
    // Update email/name if changed
    user.email = email
    user.name = name
    await user.save()
  }

  return {
    id: user._id.toString(),
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    level: user.level,
    currentLesson: user.currentLesson || 1,
    group: user.group?.toString(),
    classType: user.classType,
    startDate: user.startDate,
    isActive: user.isActive,
  }
}
