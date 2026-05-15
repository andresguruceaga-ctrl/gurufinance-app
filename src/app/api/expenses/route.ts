import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } })
  return NextResponse.json(expenses)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { description, amount, category, frequency } = body
  const expense = await prisma.expense.create({
    data: { description, amount: parseFloat(amount), category, frequency, userId: "clxampleuserid123" }
  })
  return NextResponse.json(expense)
}
