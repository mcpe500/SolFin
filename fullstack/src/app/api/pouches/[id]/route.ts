import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pouch = await db.pouch.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 10
        },
        goals: true
      }
    })

    if (!pouch) {
      return NextResponse.json({ error: "Pouch not found" }, { status: 404 })
    }

    return NextResponse.json(pouch)
  } catch (error) {
    console.error("Error fetching pouch:", error)
    return NextResponse.json({ error: "Failed to fetch pouch" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, type, targetAmount, balance } = body

    const pouch = await db.pouch.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(balance !== undefined && { balance })
      }
    })

    return NextResponse.json(pouch)
  } catch (error) {
    console.error("Error updating pouch:", error)
    return NextResponse.json({ error: "Failed to update pouch" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.pouch.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Pouch deleted successfully" })
  } catch (error) {
    console.error("Error deleting pouch:", error)
    return NextResponse.json({ error: "Failed to delete pouch" }, { status: 500 })
  }
}