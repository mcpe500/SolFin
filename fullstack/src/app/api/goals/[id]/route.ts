import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const goal = await db.goal.findUnique({
      where: { id: params.id },
      include: {
        pouch: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Calculate progress and status
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100
    const isBehindSchedule = new Date() > goal.targetDate && goal.currentAmount < goal.targetAmount
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      ...goal,
      progressPercentage,
      isBehindSchedule,
      daysRemaining: Math.max(0, daysRemaining)
    })
  } catch (error) {
    console.error("Error fetching goal:", error)
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, targetAmount, currentAmount, targetDate, isActive } = body

    const existingGoal = await db.goal.findUnique({
      where: { id: params.id },
      include: { pouch: true }
    })

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Recalculate monthly contribution if target amount or date changed
    let monthlyContribution = existingGoal.monthlyContribution
    if (targetAmount !== undefined || targetDate !== undefined) {
      const newTargetAmount = targetAmount || existingGoal.targetAmount
      const newTargetDate = targetDate ? new Date(targetDate) : existingGoal.targetDate
      const newCurrentAmount = currentAmount !== undefined ? currentAmount : existingGoal.currentAmount
      
      const startDate = new Date()
      const endDate = newTargetDate
      const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      monthlyContribution = (newTargetAmount - newCurrentAmount) / monthsDiff
    }

    const goal = await db.goal.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(currentAmount !== undefined && { currentAmount }),
        ...(targetDate !== undefined && { targetDate: new Date(targetDate) }),
        ...(isActive !== undefined && { isActive }),
        monthlyContribution
      }
    })

    const goalWithDetails = await db.goal.findUnique({
      where: { id: goal.id },
      include: {
        pouch: true
      }
    })

    return NextResponse.json(goalWithDetails)
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.goal.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Goal deleted successfully" })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}