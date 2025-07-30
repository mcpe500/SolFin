import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const goals = await db.goal.findMany({
      where: { userId, isActive: true },
      include: {
        pouch: true
      },
      orderBy: { targetDate: "asc" }
    })

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
      isBehindSchedule: new Date() > goal.targetDate && goal.currentAmount < goal.targetAmount
    }))

    return NextResponse.json(goalsWithProgress)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, targetAmount, targetDate, userId, pouchId } = body

    if (!title || !targetAmount || !targetDate || !userId || !pouchId) {
      return NextResponse.json({ 
        error: "Title, targetAmount, targetDate, userId, and pouchId are required" 
      }, { status: 400 })
    }

    // Calculate monthly contribution needed
    const startDate = new Date()
    const endDate = new Date(targetDate)
    const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const monthlyContribution = (targetAmount - (body.currentAmount || 0)) / monthsDiff

    const goal = await db.goal.create({
      data: {
        title,
        description,
        targetAmount,
        currentAmount: body.currentAmount || 0,
        targetDate: new Date(targetDate),
        monthlyContribution,
        userId,
        pouchId
      }
    })

    const goalWithPouch = await db.goal.findUnique({
      where: { id: goal.id },
      include: {
        pouch: true
      }
    })

    return NextResponse.json(goalWithPouch, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}