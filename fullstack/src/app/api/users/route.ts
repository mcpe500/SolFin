import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    
    if (email) {
      // Find user by email
      const user = await db.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
          },
          pouches: {
            orderBy: { createdAt: "desc" }
          },
          goals: {
            where: { isActive: true },
            orderBy: { targetDate: "asc" }
          }
        }
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json(user)
    } else {
      // Return all users (admin functionality)
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: "desc" }
      })

      return NextResponse.json(users)
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email,
        name
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}