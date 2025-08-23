import { PrismaClient, Role, LeaveStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if data already exists
  const existingUsers = await prisma.user.count()

  if (existingUsers > 0) {
    console.log('Database already seeded with', existingUsers, 'users')
    return
  }

  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      employeeId: 'ADMIN001',
      email: 'admin@company.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // Create supervisors
  const supervisorData = [
    {
      name: 'Sarah Johnson',
      employeeId: 'SUP001',
      email: 'sarah.johnson@company.com',
      password: await bcrypt.hash('sarah123', 12),
      role: Role.SUPERVISOR,
    },
    {
      name: 'Michael Chen',
      employeeId: 'SUP002',
      email: 'michael.chen@company.com',
      password: await bcrypt.hash('michael123', 12),
      role: Role.SUPERVISOR,
    },
    {
      name: 'Emily Rodriguez',
      employeeId: 'SUP003',
      email: 'emily.rodriguez@company.com',
      password: await bcrypt.hash('emily123', 12),
      role: Role.SUPERVISOR,
    },
  ]

  const supervisors: any[] = []
  for (const supervisor of supervisorData) {
    const createdSupervisor = await prisma.user.create({
      data: supervisor,
    })
    supervisors.push(createdSupervisor)
  }

  // Create employees
  const employeeData = [
    {
      name: 'John Smith',
      employeeId: 'EMP001',
      email: 'john.smith@company.com',
      password: await bcrypt.hash('john123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[0].id, // Sarah Johnson
    },
    {
      name: 'Lisa Wong',
      employeeId: 'EMP002',
      email: 'lisa.wong@company.com',
      password: await bcrypt.hash('lisa123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[0].id, // Sarah Johnson
    },
    {
      name: 'David Miller',
      employeeId: 'EMP003',
      email: 'david.miller@company.com',
      password: await bcrypt.hash('david123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[1].id, // Michael Chen
    },
    {
      name: 'Jessica Brown',
      employeeId: 'EMP004',
      email: 'jessica.brown@company.com',
      password: await bcrypt.hash('jessica123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[1].id, // Michael Chen
    },
    {
      name: 'Robert Taylor',
      employeeId: 'EMP005',
      email: 'robert.taylor@company.com',
      password: await bcrypt.hash('robert123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[2].id, // Emily Rodriguez
    },
    {
      name: 'Amanda Davis',
      employeeId: 'EMP006',
      email: 'amanda.davis@company.com',
      password: await bcrypt.hash('amanda123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[2].id, // Emily Rodriguez
    },
    {
      name: 'James Wilson',
      employeeId: 'EMP007',
      email: 'james.wilson@company.com',
      password: await bcrypt.hash('james123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[0].id, // Sarah Johnson
    },
    {
      name: 'Maria Garcia',
      employeeId: 'EMP008',
      email: 'maria.garcia@company.com',
      password: await bcrypt.hash('maria123', 12),
      role: Role.EMPLOYEE,
      supervisorId: supervisors[1].id, // Michael Chen
    },
  ]

  const employees: any[] = []
  for (const employee of employeeData) {
    const createdEmployee = await prisma.user.create({
      data: employee,
    })
    employees.push(createdEmployee)
  }

  // Create some sample leave requests
  const leaveRequests = [
    {
      userId: employees[0].id, // John Smith
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-03'),
      reason: 'Family vacation',
      status: LeaveStatus.PENDING,
    },
    {
      userId: employees[1].id, // Lisa Wong
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-16'),
      reason: 'Medical appointment',
      status: LeaveStatus.APPROVED,
    },
    {
      userId: employees[2].id, // David Miller
      startDate: new Date('2025-08-20'),
      endDate: new Date('2025-08-22'),
      reason: 'Personal emergency',
      status: LeaveStatus.REJECTED,
    },
    {
      userId: employees[3].id, // Jessica Brown
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-12'),
      reason: 'Wedding ceremony',
      status: LeaveStatus.PENDING,
    },
    {
      userId: employees[4].id, // Robert Taylor
      startDate: new Date('2025-08-25'),
      endDate: new Date('2025-08-25'),
      reason: 'Sick leave',
      status: LeaveStatus.APPROVED,
    },
  ]

  for (const request of leaveRequests) {
    await prisma.leaveRequest.create({
      data: request,
    })
  }

  console.log('Database seeded successfully!')
  console.log('\n=== SEEDED USERS ===')
  console.log('Admin:', {
    employeeId: 'ADMIN001',
    password: 'admin123',
    name: 'System Administrator'
  })
  
  console.log('\nSupervisors:')
  console.log('- Sarah Johnson (SUP001) - Password: sarah123')
  console.log('- Michael Chen (SUP002) - Password: michael123')
  console.log('- Emily Rodriguez (SUP003) - Password: emily123')
  
  console.log('\nEmployees:')
  console.log('- John Smith (EMP001) - Password: john123 - Supervisor: Sarah Johnson')
  console.log('- Lisa Wong (EMP002) - Password: lisa123 - Supervisor: Sarah Johnson')
  console.log('- David Miller (EMP003) - Password: david123 - Supervisor: Michael Chen')
  console.log('- Jessica Brown (EMP004) - Password: jessica123 - Supervisor: Michael Chen')
  console.log('- Robert Taylor (EMP005) - Password: robert123 - Supervisor: Emily Rodriguez')
  console.log('- Amanda Davis (EMP006) - Password: amanda123 - Supervisor: Emily Rodriguez')
  console.log('- James Wilson (EMP007) - Password: james123 - Supervisor: Sarah Johnson')
  console.log('- Maria Garcia (EMP008) - Password: maria123 - Supervisor: Michael Chen')
  
  console.log(`\nCreated ${leaveRequests.length} sample leave requests`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
