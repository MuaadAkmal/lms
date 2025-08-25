import { PrismaClient, Role, LeaveStatus, GosiType } from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

const prisma = new PrismaClient()

async function main() {
  // Flush all data
  await prisma.leaveRequest.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      employeeId: "HCADMIN01",
      firstName: "System",
      lastName: "Administrator",
      email: "admin@company.com",
      password: adminPassword,
      role: Role.ADMIN,
      jobTitle: "System Administrator",
      nationality: "Saudi Arabia",
      gosiType: GosiType.SAUDI,
      storeCode: "HQ001",
    },
  })

  // Create supervisors
  const supervisorData = [
    {
      employeeId: "HCS001",
      firstName: "Kakkiya",
      lastName: "",
      email: "kakkiya@company.com",
      password: await bcrypt.hash("adminS001", 12),
      role: Role.SUPERVISOR,
      jobTitle: "Supervisor",
      nationality: "Saudi",
      gosiType: GosiType.SAUDI,
      storeCode: "S001",
    },
    {
      employeeId: "HCS003",
      firstName: "Jumum",
      lastName: "",
      email: "jumum@company.com",
      password: await bcrypt.hash("adminS003", 12),
      role: Role.SUPERVISOR,
      jobTitle: "Supervisor",
      nationality: "Saudi",
      gosiType: GosiType.SAUDI,
      storeCode: "S003",
    },
    {
      employeeId: "HCHO",
      firstName: "Zahidi",
      lastName: "",
      email: "zahidi@company.com",
      password: await bcrypt.hash("adminHO", 12),
      role: Role.SUPERVISOR,
      jobTitle: "Supervisor",
      nationality: "Saudi",
      gosiType: GosiType.SAUDI,
      storeCode: "HO",
    },
    {
      employeeId: "HCWH",
      firstName: "Jumia",
      lastName: "",
      email: "jumia@company.com",
      password: await bcrypt.hash("adminWH", 12),
      role: Role.SUPERVISOR,
      jobTitle: "Supervisor",
      nationality: "Saudi",
      gosiType: GosiType.SAUDI,
      storeCode: "Wholesale",
    },
  ]

  for (const supervisor of supervisorData) {
    await prisma.user.create({
      data: supervisor,
    })
  }
 

 
 
 
 
   
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
