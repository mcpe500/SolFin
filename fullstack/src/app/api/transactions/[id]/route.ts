import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        pouch: true,
        splits: {
          include: {
            pouch: true
          }
        },
        transfer: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      pouchId 
    } = body

    const existingTransaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: { account: true, pouch: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Calculate balance changes
    let accountBalanceChange = 0
    let pouchBalanceChange = 0

    if (amount !== existingTransaction.amount || type !== existingTransaction.type) {
      // Reverse old transaction effect
      const oldEffect = existingTransaction.type === "INCOME" ? 
        -existingTransaction.amount : existingTransaction.amount
      
      // Apply new transaction effect
      const newEffect = type === "INCOME" ? -amount : amount
      
      accountBalanceChange = oldEffect + newEffect
      pouchBalanceChange = oldEffect + newEffect
    }

    const transaction = await db.transaction.update({
      where: { id: params.id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(currency && { currency }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringPattern !== undefined && { recurringPattern }),
        ...(isAsset !== undefined && { isAsset }),
        ...(gpsLocation !== undefined && { gpsLocation }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(pouchId !== undefined && { pouchId })
      }
    })

    // Update account balance if needed
    if (accountBalanceChange !== 0) {
      await db.account.update({
        where: { id: existingTransaction.accountId },
        data: { 
          currentBalance: existingTransaction.account.currentBalance + accountBalanceChange 
        }
      })
    }

    // Update pouch balances if needed
    if (pouchBalanceChange !== 0) {
      // Update old pouch if transaction was moved
      if (existingTransaction.pouchId && existingTransaction.pouchId !== pouchId) {
        await db.pouch.update({
          where: { id: existingTransaction.pouchId },
          data: { balance: existingTransaction.pouch.balance - pouchBalanceChange }
        })
      }
      
      // Update new pouch if assigned
      if (pouchId) {
        const newPouch = await db.pouch.findUnique({ where: { id: pouchId } })
        if (newPouch) {
          await db.pouch.update({
            where: { id: pouchId },
            data: { balance: newPouch.balance + pouchBalanceChange }
          })
        }
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

    return NextResponse.json(fullTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: { account: true, pouch: true }
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Soft delete
    await db.transaction.update({
      where: { id: params.id },
      data: { isDeleted: true }
    })

    // Reverse balance effects
    const balanceEffect = transaction.type === "INCOME" ? 
      -transaction.amount : transaction.amount

    await db.account.update({
      where: { id: transaction.accountId },
      data: { 
        currentBalance: transaction.account.currentBalance + balanceEffect 
      }
    })

    if (transaction.pouchId) {
      await db.pouch.update({
        where: { id: transaction.pouchId },
        data: { balance: transaction.pouch.balance + balanceEffect }
      })
    }

    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}