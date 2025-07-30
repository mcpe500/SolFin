import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PouchType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const pouches = await db.pouch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        goals: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    return NextResponse.json(pouches)
  } catch (error) {
    console.error("Error fetching pouches:", error)
    return NextResponse.json({ error: "Failed to fetch pouches" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, targetAmount, userId } = body

    if (!name || !userId) {
      return NextResponse.json({ error: "Name and userId are required" }, { status: 400 })
    }

    const pouch = await db.pouch.create({
      data: {
        name,
        description,
        type: type as PouchType || PouchType.PRIVATE,
        targetAmount,
        userId
      }
    })

    return NextResponse.json(pouch, { status: 201 })
  } catch (error) {
    console.error("Error creating pouch:", error)
    return NextResponse.json({ error: "Failed to create pouch" }, { status: 500 })
  }
}