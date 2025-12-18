"use server"

import connectDB from "@/lib/db/connection"
import { User, Group, Assignment, Submission, Payment } from "@/lib/db/models"

export async function getDashboardStats() {
  await connectDB()

  const [
    totalStudents,
    activeStudents,
    totalGroups,
    activeGroups,
    pendingSubmissions,
    pendingPayments,
    recentSubmissions,
    studentsByLevel,
    recentStudents,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "student", isActive: true }),
    Group.countDocuments(),
    Group.countDocuments({ isActive: true }),
    Submission.countDocuments({ grade: null }),
    Payment.countDocuments({ status: "pending" }),
    Submission.find({ grade: null })
      .populate("student", "name email")
      .populate("assignment", "title")
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean(),
    User.aggregate([
      { $match: { role: "student", level: { $exists: true } } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]),
    User.find({ role: "student" })
      .select("name email level currentLesson isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  // Get upcoming assignments (due in the next 7 days)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingAssignments = await Assignment.find({
    dueDate: { $gte: new Date(), $lte: nextWeek },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .lean()

  // Get groups with student count
  const groups = await Group.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const groupsWithCount = await Promise.all(
    groups.map(async (group) => {
      const studentCount = await User.countDocuments({
        role: "student",
        group: group._id,
        isActive: true,
      })
      return {
        id: group._id.toString(),
        name: group.name,
        level: group.level,
        studentCount,
      }
    })
  )

  // Transform students by level to object
  const levelDistribution: Record<string, number> = {}
  for (const item of studentsByLevel) {
    levelDistribution[item._id] = item.count
  }

  return {
    totalStudents,
    activeStudents,
    totalGroups,
    activeGroups,
    pendingSubmissions,
    pendingPayments,
    levelDistribution,
    recentStudents: recentStudents.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      level: s.level,
      currentLesson: s.currentLesson || 1,
      isActive: s.isActive,
    })),
    recentGroups: groupsWithCount,
    recentSubmissions: recentSubmissions.map((s) => {
      const student = s.student as unknown as { name: string } | null
      const assignment = s.assignment as unknown as { title: string } | null
      return {
        id: s._id.toString(),
        studentName: student?.name || "Desconocido",
        assignmentTitle: assignment?.title || "Sin título",
        submittedAt: s.submittedAt,
      }
    }),
    upcomingAssignments: upcomingAssignments.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      dueDate: a.dueDate,
    })),
  }
}
