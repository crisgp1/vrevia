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

    // Check if user exists by email (might have been created manually)
    user = await User.findOne({ email })

    if (user) {
      // User exists with this email, update their clerkId
      user.clerkId = clerkUser.id
      user.name = name
      await user.save()
    } else {
      // Check if this is the first user (make them admin)
      const userCount = await User.countDocuments()

      const newUser = await User.create({
        clerkId: clerkUser.id,
        email,
        name,
        role: userCount === 0 ? "admin" : "student",
        isActive: true,
      })

      user = newUser
    }

    const finalUser = user!

    return {
      id: finalUser._id.toString(),
      clerkId: finalUser.clerkId,
      email: finalUser.email,
      name: finalUser.name,
      role: finalUser.role,
      phone: finalUser.phone,
      level: finalUser.level,
      currentLesson: finalUser.currentLesson || 1,
      group: finalUser.group?.toString(),
      classType: finalUser.classType,
      startDate: finalUser.startDate,
      isActive: finalUser.isActive,
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

  let user = await User.findOne({
    $or: [
      { clerkId: clerkUser.id },
      { email }
    ]
  })

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
    // Update clerkId, email, and name if changed
    user.clerkId = clerkUser.id
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
