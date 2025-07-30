import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AccountType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const accounts = await db.account.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, currency, initialBalance, userId } = body

    if (!name || !type || !userId) {
      return NextResponse.json({ error: "Name, type, and userId are required" }, { status: 400 })
    }

    const account = await db.account.create({
      data: {
        name,
        type: type as AccountType,
        currency: currency || "USD",
        initialBalance: initialBalance || 0,
        currentBalance: initialBalance || 0,
        userId
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}