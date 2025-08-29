import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db';
import { prisma } from './prisma';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/students', async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        course: { include: { subjects: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(students);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/courses', async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        students: true,
        subjects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/subjects', async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { courses: true },
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});
app.get('/api/subjects/defaults', async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { name: { in: ['Mathematics', 'Science', 'History'] } },
      include: { courses: true },
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.post('/api/courses', async (req, res) => {
  const {
    title,
    code,
    description,
    startDate,
    endDate,
    baseSubjectId,
    secondarySubjectName,
  } = (req.body ?? {}) as {
    title?: string;
    code?: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    baseSubjectId?: string;
    secondarySubjectName?: string | null;
  };

  if (!title || !code || !baseSubjectId) {
    return res.status(400).json({
      error: 'title, code, and baseSubjectId are required',
    });
  }

  const connectSubjects = [{ id: baseSubjectId }];

  const createSecondary =
    secondarySubjectName && String(secondarySubjectName).trim()
      ? [{ name: String(secondarySubjectName).trim(), category: 'Custom' }]
      : [];

  try {
    const course = await prisma.course.create({
      data: {
        title,
        code,
        description: description ?? null,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        subjects: {
          connect: connectSubjects,
          ...(createSecondary.length ? { create: createSecondary } : {}),
        },
      },
      include: { subjects: true },
    });

    res.status(201).json(course);
  } catch (e: any) {
    console.error(e);
    if (e?.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint failed (code or subject name)' });
    }
    if (e?.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid foreign key (baseSubjectId)' });
    }
    res.status(500).json({ error: e?.message || 'Failed to create course' });
  }
});
app.post('/api/students', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    isActive,
    enrolledAt,
    courseId,
  } = (req.body ?? {}) as {
    firstName?: string;
    lastName?: string | null;
    email?: string;
    phone?: string | null;
    isActive?: boolean;
    enrolledAt?: string | null; // ISO date string (YYYY-MM-DD or full ISO)
    courseId: string | null;
  };

  if (!firstName || !email || !courseId) {
    return res.status(400).json({ error: 'firstName, email, and course are required' });
  }

  try {
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName: lastName ?? null,
        email,
        phone: phone ?? null,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        ...(enrolledAt ? { enrolledAt: new Date(enrolledAt) } : {}),
        course: { connect: { id: courseId } }
      },
      include: {
        course: { include: { subjects: true } },
      },
    });
    res.status(201).json(student);
  } catch (e: any) {
    console.error(e);
    if (e?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    if (e?.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid courseId' });
    }
    res.status(500).json({ error: e?.message || 'Failed to create student' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
