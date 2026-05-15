import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } })
    return NextResponse.json(user)
  } catch (error) { return NextResponse.json({ error: "Error interno" }, { status: 500 }) }
}
