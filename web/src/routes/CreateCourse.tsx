import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../api';

type SubjectOption = { id: string; name: string; category: string };

export default function CreateCourse() {
  const navigate = useNavigate();

  const [defaults, setDefaults] = useState<SubjectOption[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  const [title, setTitle] = useState('A1');
  const [code, setCode] = useState('A1');
  const [description, setDescription] = useState('A1');
  const [startDate, setStartDate] = useState('2025-08-20'); // ISO (YYYY-MM-DD)
  const [endDate, setEndDate] = useState('2025-08-29');
  const [baseSubjectId, setBaseSubjectId] = useState<string>('');
  const [secondarySubjectName, setSecondarySubjectName] = useState('A1');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingDefaults(true);
        const res = await fetch(`${baseUrl}/api/subjects/defaults`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data: SubjectOption[] = await res.json();
        if (!alive) return;
        setDefaults(data);
        if (data.length && !baseSubjectId) setBaseSubjectId(data[0].id);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || 'Failed to load default subjects');
      } finally {
        if (alive) setLoadingDefaults(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!title || !code || !baseSubjectId) {
      setErr('Title, Code, and Base Subject are required.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title,
        code,
        description: description || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        baseSubjectId,
        secondarySubjectName: secondarySubjectName || null,
      };

      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const ejson = await res.json().catch(() => ({}));
        throw new Error(ejson?.error || `${res.status} ${res.statusText}`);
      }

      // success: go home or to courses list
      navigate('/');
    } catch (e: any) {
      setErr(e?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: 8 }}>Create Course</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        Fill the details, pick a base subject, and optionally add a secondary subject.
      </p>

      {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <TextField label="Title" value={title} onChange={setTitle} required />
        <TextField label="Code" value={code} onChange={setCode} required />
        <TextField label="Description" value={description} onChange={setDescription} textarea />

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={setStartDate}
          />
          <TextField label="End Date" type="date" value={endDate} onChange={setEndDate} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Base Subject *
          </label>
          {loadingDefaults ? (
            <div>Loading subjects…</div>
          ) : (
            <select
              value={baseSubjectId}
              onChange={(e) => setBaseSubjectId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #ddd',
              }}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {defaults.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          )}
        </div>

        <TextField
          label="Secondary Subject (optional)"
          value={secondarySubjectName}
          onChange={setSecondarySubjectName}
          placeholder="e.g., Robotics"
        />

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
            {submitting ? 'Creating…' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
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

function TextField({
  label,
  value,
  onChange,
  textarea,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
        {label} {required ? '*' : ''}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
          required={required}
        />
      )}
    </div>
  );
}
