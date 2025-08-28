import React, { useEffect, useMemo, useState } from 'react';
import { baseUrl } from '../api';

type Subject = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  isActive: boolean;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    code: string;
    subjects: Subject[];
  } | null;
};

type Course = {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  students: Pick<Student, 'id' | 'firstName' | 'lastName' | 'email'>[];
  subjects: Subject[];
};

const fetchJSON = async <T,>(url: string, signal?: AbortSignal): Promise<T> => {
  const res = await fetch(`${baseUrl}${url}`, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export default function Home() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setErr(null);

    Promise.allSettled([
      fetchJSON<Student[]>('/api/students', ac.signal),
      fetchJSON<Course[]>('/api/courses', ac.signal),
      fetchJSON<Subject[]>('/api/subjects', ac.signal),
    ])
      .then(([s, c, sub]) => {
        if (s.status === 'fulfilled') setStudents(s.value);
        else setErr(s.reason?.message ?? 'Failed to load students');

        if (c.status === 'fulfilled') setCourses(c.value);
        else setErr((prev) => prev ?? c.reason?.message ?? 'Failed to load courses');

        if (sub.status === 'fulfilled') setSubjects(sub.value);
        else setErr((prev) => prev ?? sub.reason?.message ?? 'Failed to load subjects');
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  const totalEnrolled = useMemo(
    () => courses?.reduce((sum, course) => sum + course.students.length, 0) ?? 0,
    [courses]
  );

  return (
    <div style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Home</h1>
        <p style={{ color: '#666', marginTop: 4 }}>
          Overview of Students, Courses, and Subjects
        </p>
      </header>

      {loading && <p>Loading…</p>}
      {err && !loading && (
        <p style={{ color: 'crimson', fontWeight: 600 }}>Error: {err}</p>
      )}

      {/* Quick stats */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Card title="Students" value={students?.length ?? 0} />
        <Card title="Courses" value={courses?.length ?? 0} />
        <Card title="Subjects" value={subjects?.length ?? 0} />
        <Card title="Total Enrollments" value={totalEnrolled} />
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 24,
        }}
      >
        {/* Students */}
        <section>
          <h2 style={{ margin: '0 0 8px' }}>Students</h2>
          <Table
            headers={['Name', 'Email', 'Course', 'Subjects']}
            rows={(students ?? []).map((s) => [
              `${s.firstName}${s.lastName ? ` ${s.lastName}` : ''}`,
              s.email,
              s.course ? `${s.course.title} (${s.course.code})` : '—',
              s.course && s.course.subjects.length
                ? s.course.subjects.map((sub) => sub.name).join(', ')
                : '—',
            ])}
            empty="No students"
          />
        </section>

        {/* Courses */}
        <section>
          <h2 style={{ margin: '0 0 8px' }}>Courses</h2>
          <Table
            headers={['Title', 'Code', 'Students', 'Subjects']}
            rows={(courses ?? []).map((c) => [
              c.title,
              c.code,
              c.students.length ? `${c.students.length}` : '0',
              c.subjects.length
                ? c.subjects.map((s) => s.name).join(', ')
                : '—',
            ])}
            empty="No courses"
          />
        </section>

        {/* Subjects */}
        <section>
          <h2 style={{ margin: '0 0 8px' }}>Subjects</h2>
          <Table
            headers={['Name', 'Category', 'Description']}
            rows={(subjects ?? []).map((s) => [
              s.name,
              s.category,
              s.description ?? '—',
            ])}
            empty="No subjects"
          />
        </section>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#777' }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: (string | number)[][];
  empty: string;
}) {
  if (!rows.length) {
    return <div style={{ color: '#666' }}>{empty}</div>;
  }
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  background: '#fafafa',
                  borderBottom: '1px solid #eee',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#444',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f2f2f2',
                    fontSize: 14,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
