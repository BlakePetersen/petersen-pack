// ABOUTME: Seeds the booking calendar with sample availability slots for testing
// ABOUTME: Creates slots for the next few weeks with various time ranges

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAvailability() {
  console.log('\n📅 Seeding Booking Calendar with Availability Slots\n');
  console.log('='.repeat(60));

  const today = new Date();
  const slots = [];

  // Helper to create a date string in YYYY-MM-DD format
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper to add days to a date
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Create availability slots for the next 4 weeks
  // Saturdays and Sundays with various time slots
  for (let week = 0; week < 4; week++) {
    const startOfWeek = addDays(today, week * 7);

    // Find the next Saturday (day 6)
    const daysUntilSaturday = (6 - startOfWeek.getDay() + 7) % 7;
    const saturday = addDays(startOfWeek, daysUntilSaturday);
    const sunday = addDays(saturday, 1);

    // Saturday slots
    slots.push({
      date: new Date(formatDate(saturday)),
      startTime: '09:00',
      endTime: '13:00',
      notes: 'Morning session available',
      isAvailable: true,
    });

    slots.push({
      date: new Date(formatDate(saturday)),
      startTime: '14:00',
      endTime: '18:00',
      notes: 'Afternoon session available',
      isAvailable: true,
    });

    // Sunday slots
    slots.push({
      date: new Date(formatDate(sunday)),
      startTime: '10:00',
      endTime: '14:00',
      notes: 'Midday session available',
      isAvailable: true,
    });

    slots.push({
      date: new Date(formatDate(sunday)),
      startTime: '15:00',
      endTime: '19:00',
      notes: 'Late afternoon/golden hour session',
      isAvailable: true,
    });
  }

  // Add some weekday slots too (Fridays)
  for (let week = 1; week < 4; week++) {
    const startOfWeek = addDays(today, week * 7);
    const daysUntilFriday = (5 - startOfWeek.getDay() + 7) % 7;
    const friday = addDays(startOfWeek, daysUntilFriday);

    slots.push({
      date: new Date(formatDate(friday)),
      startTime: '16:00',
      endTime: '20:00',
      notes: 'Friday evening session',
      isAvailable: true,
    });
  }

  console.log(`\nCreating ${slots.length} availability slots...\n`);

  let created = 0;
  let skipped = 0;

  for (const slot of slots) {
    try {
      // Check if slot already exists
      const existing = await prisma.availabilitySlot.findFirst({
        where: {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });

      if (existing) {
        console.log(`  ⊘ Skipped: ${formatDate(slot.date)} ${slot.startTime}-${slot.endTime} (already exists)`);
        skipped++;
      } else {
        await prisma.availabilitySlot.create({
          data: slot,
        });
        console.log(`  ✓ Created: ${formatDate(slot.date)} ${slot.startTime}-${slot.endTime}`);
        created++;
      }
    } catch (error) {
      console.error(`  ✗ Failed to create slot for ${formatDate(slot.date)}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`  Created: ${created} slots`);
  console.log(`  Skipped: ${skipped} slots (already existed)`);
  console.log('-'.repeat(60));

  // Show summary of what's in the calendar
  const allSlots = await prisma.availabilitySlot.findMany({
    where: {
      date: {
        gte: today,
      },
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });

  console.log(`\n📊 Total Available Slots in Calendar: ${allSlots.length}\n`);
  console.log('Next 5 upcoming slots:');
  console.log('-'.repeat(60));

  allSlots.slice(0, 5).forEach((slot) => {
    const dateStr = formatDate(slot.date);
    const dayOfWeek = slot.date.toLocaleDateString('en-US', { weekday: 'short' });
    const available = slot.isAvailable ? '✓' : '✗';
    console.log(`  ${available} ${dayOfWeek} ${dateStr} ${slot.startTime}-${slot.endTime}`);
    if (slot.notes) {
      console.log(`     ${slot.notes}`);
    }
  });

  console.log('\n✨ Booking calendar is ready for testing!\n');
  console.log('Visit: http://localhost:3000/book\n');
}

seedAvailability()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    prisma.$disconnect().then(() => process.exit(1));
  });
