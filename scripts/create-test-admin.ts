// ABOUTME: Script to create test admin user for E2E tests
// ABOUTME: Creates admin@example.com with password 'password'

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const hash = await bcrypt.hash('password', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hash },
    create: {
      email: 'admin@example.com',
      password: hash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Test admin user created:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
