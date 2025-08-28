import { prisma } from '../src/prisma.js';

async function main() {
  // Subjects
  const [math, science, history] = await Promise.all([
    prisma.subject.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: { name: 'Mathematics', category: 'STEM', description: 'Numbers, algebra, geometry' },
    }),
    prisma.subject.upsert({
      where: { name: 'Science' },
      update: {},
      create: { name: 'Science', category: 'STEM', description: 'Physics, chemistry, biology' },
    }),
    prisma.subject.upsert({
      where: { name: 'History' },
      update: {},
      create: { name: 'History', category: 'Humanities', description: 'World & regional history' },
    }),
  ]);
  
  // One course for Alice with Math + Science
  const course = await prisma.course.create({
    data: {
      title: 'Foundations',
      code: 'C-FOUND',
      description: 'Introductory curriculum',
      subjects: {
        connect: [{ id: math.id }, { id: science.id }]
      },
    },
  });

  // Students
  const alice = await prisma.student.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice@example.com',
      phone: '555-1010',
      courseId: course.id
    },
  });

  const bob = await prisma.student.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob@example.com',
      phone: '555-2020',
      courseId: course.id
    },
  });

  console.log({ subjects: [math.name, science.name, history.name], students: [alice.email, bob.email], course: course.code });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
