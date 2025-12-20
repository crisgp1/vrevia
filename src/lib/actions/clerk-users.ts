"use server"

import { clerkClient } from "@clerk/nextjs/server"

export async function searchClerkUsers(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: false, error: "Query must be at least 2 characters" }
    }

    const client = await clerkClient()

    // Search users by email or name
    const users = await client.users.getUserList({
      query: query.trim(),
      limit: 20,
    })

    const formattedUsers = users.data.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sin nombre",
      imageUrl: user.imageUrl,
    }))

    return { success: true, data: formattedUsers }
  } catch (error) {
    console.error("Error searching Clerk users:", error)
    return { success: false, error: "Error al buscar usuarios" }
  }
}

export async function getClerkUser(userId: string) {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    return {
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sin nombre",
        imageUrl: user.imageUrl,
      },
    }
  } catch (error) {
    console.error("Error getting Clerk user:", error)
    return { success: false, error: "Usuario no encontrado" }
  }
}
