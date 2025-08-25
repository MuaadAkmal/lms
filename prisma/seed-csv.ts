import { PrismaClient, Role, GosiType } from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

// Function to parse CSV
function parseCSV(content: string) {
  const lines = content.split("\n")
  const headers = lines[0].split(",")
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue

    const values = lines[i].split(",")
    const row: any = {}

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ""
    })

    data.push(row)
  }

  return data
}

// Function to map nationality to GosiType
function getGosiType(gosiTypeStr: string): GosiType {
  if (gosiTypeStr.includes("Saudi")) {
    return GosiType.SAUDI
  }
  return GosiType.NON_SAUDI
}

// Function to clean and format names
function cleanName(name: string): string {
  if (!name || name === "NA" || name === "") return ""
  return name.trim()
}

// Function to generate email from name and employee ID
function generateEmail(
  firstName: string,
  lastName: string,
  empId: string
): string {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, "")
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, "")
  return `${cleanFirst}.${cleanLast}.${empId}@company.com`
}

async function seedCSVData() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), "data", "employees.csv")
    const csvContent = fs.readFileSync(csvPath, "utf-8")

    // Parse CSV data
    const employees = parseCSV(csvContent)

    console.log(`Found ${employees.length} employees in CSV`)

    // Filter only active employees
    const activeEmployees = employees.filter(
      (emp) => emp.Status && emp.Status.toLowerCase() === "active"
    )

    console.log(`Found ${activeEmployees.length} active employees`)

    // Check if data already exists
    const existingCount = await prisma.user.count()
    

    let successCount = 0
    let errorCount = 0

    for (const emp of activeEmployees) {
      try {
        const firstName = cleanName(emp["First Name"])
        const middleName = cleanName(emp["Middle Name"])
        const lastName = cleanName(emp["Last Name"])
        const iqamaNo = cleanName(emp["Iqama No./Saudi ID"])
        const storeCode = cleanName(emp["Store Code"])
        const nationality = cleanName(emp["Nationality"])
        const gosiType = getGosiType(emp["GOSI Type"] || "")
        const jobTitle = cleanName(emp["Job Title"])
        const empId = cleanName(emp["EMP_id."])

        // Skip if essential fields are missing
        if (!firstName || !lastName || !empId) {
          console.log(`Skipping employee ${empId} - missing essential fields`)
          errorCount++
          continue
        }

        // Generate email
        const email = generateEmail(firstName, lastName, empId)

        // Default password
        const password = await bcrypt.hash("Employee123", 12)

        // Create user data
        const userData = {
          employeeId: "HC"+empId,
          firstName: firstName,
          middleName: middleName || undefined,
          lastName: lastName,
          iqamaNo: iqamaNo === "NA" ? null : iqamaNo,
          storeCode: storeCode || undefined,
          nationality: nationality || undefined,
          gosiType: gosiType,
          jobTitle: jobTitle || undefined,
          email: email,
          password: password,
          role: Role.EMPLOYEE,
        }

        // Create user in database
        await prisma.user.create({
          data: userData,
        })

        successCount++
        console.log(`✓ Created employee: ${firstName} ${lastName} (${empId})`)
      } catch (error) {
        errorCount++
        console.error(`✗ Error creating employee ${emp["EMP_id."]}: ${error}`)
      }
    }

    console.log(`\n=== CSV Import Summary ===`)
    console.log(`Total active employees in CSV: ${activeEmployees.length}`)
    console.log(`Successfully created: ${successCount}`)
    console.log(`Errors: ${errorCount}`)

    // Create a default admin if none exists
    const adminExists = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    })

    if (!adminExists) {
      console.log("\nCreating default admin user...")
      const adminPassword = await bcrypt.hash("admin123", 12)
      await prisma.user.create({
        data: {
          employeeId: "ADMIN001",
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
      console.log("✓ Admin user created (ADMIN001 / admin123)")
    }

    // Create default supervisors if none exist
    const supervisorCount = await prisma.user.count({
      where: { role: Role.SUPERVISOR },
    })

    if (supervisorCount === 0) {
      console.log("\nCreating default supervisor users...")

      const supervisorData = [
        {
          employeeId: "SUP001",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@company.com",
          jobTitle: "Team Lead",
          nationality: "United States",
          storeCode: "ST001",
        },
        {
          employeeId: "SUP002",
          firstName: "Michael",
          lastName: "Chen",
          email: "michael.chen@company.com",
          jobTitle: "Department Manager",
          nationality: "Canada",
          storeCode: "ST002",
        },
      ]

      for (const sup of supervisorData) {
        const password = await bcrypt.hash("supervisor123", 12)
        await prisma.user.create({
          data: {
            ...sup,
            password,
            role: Role.SUPERVISOR,
            gosiType: GosiType.NON_SAUDI,
          },
        })
        console.log(
          `✓ Created supervisor: ${sup.firstName} ${sup.lastName} (${sup.employeeId})`
        )
      }
    }
  } catch (error) {
    console.error("Error reading or processing CSV file:", error)
  }
}

async function main() {
  console.log("Starting CSV data import...")
  await seedCSVData()
  console.log("CSV import completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
