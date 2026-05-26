// ABOUTME: Creates an admin user account
// ABOUTME: Script to create admin user for Blake

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'blake@blakepetersen.io'
  const password = 'admin123' // Change this after first login!

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`User ${email} already exists with role: ${existingUser.role}`)

    // Update to admin if not already
    if (existingUser.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      })
      console.log(`✅ Updated ${email} to ADMIN role`)
    } else {
      console.log('User is already an admin')
    }
    return
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(password, 10)
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Blake Petersen',
      role: 'ADMIN',
    },
  })

  console.log(`✅ Created admin user: ${admin.email}`)
  console.log(`\nAdmin Login:`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`\n⚠️  IMPORTANT: Change this password after first login!`)
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
