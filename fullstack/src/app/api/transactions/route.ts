import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { TransactionType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const accountId = searchParams.get("accountId")
    const pouchId = searchParams.get("pouchId")
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const where: any = { userId, isDeleted: false }
    if (accountId) where.accountId = accountId
    if (pouchId) where.pouchId = pouchId
    if (type) where.type = type as TransactionType

    const transactions = await db.transaction.findMany({
      where,
      include: {
        account: true,
        pouch: true,
        splits: {
          include: {
            pouch: true
          }
        }
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset
    })

    const total = await db.transaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency, 
      description, 
      category, 
      tags, 
      date, 
      type, 
      isRecurring, 
      recurringPattern, 
      isAsset, 
      gpsLocation, 
      images, 
      userId, 
      accountId, 
      pouchId,
      splits 
    } = body

    if (!amount || !type || !userId || !accountId) {
      return NextResponse.json({ 
        error: "Amount, type, userId, and accountId are required" 
      }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        amount,
        currency: currency || "USD",
        description,
        category,
        tags: tags ? JSON.stringify(tags) : "[]",
        date: date ? new Date(date) : new Date(),
        type: type as TransactionType,
        isRecurring: isRecurring || false,
        recurringPattern,
        isAsset: isAsset || false,
        gpsLocation,
        images: images ? JSON.stringify(images) : "[]",
        userId,
        accountId,
        pouchId
      }
    })

    // Handle transaction splits if provided
    if (splits && splits.length > 0) {
      for (const split of splits) {
        await db.transactionSplit.create({
          data: {
            amount: split.amount,
            transactionId: transaction.id,
            pouchId: split.pouchId
          }
        })
      }
    }

    // Update account balance
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (account) {
      const balanceChange = type === TransactionType.INCOME ? amount : -amount
      await db.account.update({
        where: { id: accountId },
        data: { currentBalance: account.currentBalance + balanceChange }
      })
    }

    // Update pouch balance if pouch is specified
    if (pouchId) {
      const pouch = await db.pouch.findUnique({ where: { id: pouchId } })
      if (pouch) {
        const balanceChange = type === TransactionType.INCOME ? amount : -amount
        await db.pouch.update({
          where: { id: pouchId },
          data: { balance: pouch.balance + balanceChange }
        })
      }
    }

    const fullTransaction = await db.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        account: true,
        pouch: true,
        splits: {
          include: {
            pouch: true
          }
        }
      }
    })

    return NextResponse.json(fullTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}