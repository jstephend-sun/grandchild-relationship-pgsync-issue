import React, { useEffect, useState } from 'react';
import { baseUrl } from '../api';

type Course = {
  id: string;
  title: string;
  code: string;
};

export default function CreateStudent() {
  const [firstName, setFirstName] = useState('S1');
  const [lastName, setLastName] = useState('S1');
  const [email, setEmail] = useState('s1@mail.com');
  const [phone, setPhone] = useState('112211');
  const [isActive, setIsActive] = useState(true);
  const [enrolledAt, setEnrolledAt] = useState('2025-08-29'); // YYYY-MM-DD
  const [courseId, setCourseId] = useState<string>('');

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch(`${baseUrl}/api/courses`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!alive) return;
        const flat: Course[] = (data ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          code: c.code,
        }));
        setCourses(flat);
        if (flat.length && !courseId) setCourseId(flat[0].id);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || 'Failed to load courses');
      } finally {
        if (alive) setLoadingCourses(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName || !email) {
      setErr('First name and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        isActive,
        enrolledAt: enrolledAt ? new Date(enrolledAt).toISOString() : null,
        courseId: courseId || null, // optional
      };

      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const ejson = await res.json().catch(() => ({}));
        throw new Error(ejson?.error || `${res.status} ${res.statusText}`);
      }

      // success — go back home or wherever
      window.location.href = '/';
    } catch (e: any) {
      setErr(e?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: 8 }}>Create Student</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        Add a new student and optionally enroll them in a course.
      </p>

      {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <Field label="First Name *">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Field>

        <Field label="Last Name">
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>

        <Field label="Email *">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>

        <Field label="Is Active">
          <label style={{ display: 'flex', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 'auto' }}
            />
            Active
          </label>
        </Field>

        <Field label="Enrolled At">
          <input
            type="date"
            value={enrolledAt}
            onChange={(e) => setEnrolledAt(e.target.value)}
          />
        </Field>

        <Field label="Course *">
          {loadingCourses ? (
            <div>Loading courses…</div>
          ) : courses.length ? (
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
              <option value="">— No course —</option>
            </select>
          ) : (
            <div style={{ color: '#666' }}>No courses available</div>
          )}
        </Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #0a7',
              background: submitting ? '#afe' : '#0c8',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Creating…' : 'Create Student'}
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      <div
        style={{
          display: 'grid',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
      <style>{`
        input, select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
}
