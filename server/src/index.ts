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

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
