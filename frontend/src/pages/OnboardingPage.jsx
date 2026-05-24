import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OnboardingPage.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
const EDUCATIONS = ['High School', 'Some College', "Bachelor's Degree", "Master's Degree", 'PhD / Doctorate', 'Vocational / Trade', 'Other']
const PROFESSIONS = ['Student', 'Engineer / Tech', 'Healthcare', 'Education / Teaching', 'Arts / Creative', 'Business / Finance', 'Science / Research', 'Law / Government', 'Skilled Trades', 'Other']

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function OnboardingPage({ onComplete }) {
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({
    username: '', email: '', nickname: '', age: '', gender: '',
    education: '', profession: '', field_of_study: '', country: '', bio: ''
  })

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
    setError('')
  }

  const validateStep1 = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) errs.username = 'Only letters, numbers, underscores'

    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!validateEmail(form.email.trim())) errs.email = 'Please enter a valid email address'

    if (!form.nickname.trim()) errs.nickname = 'Nickname is required'

    const age = parseInt(form.age)
    if (!form.age) errs.age = 'Age is required'
    else if (isNaN(age) || age < 10 || age > 120) errs.age = 'Enter a valid age (10–120)'

    if (!form.gender) errs.gender = 'Please select a gender'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => {
    if (validateStep1()) setStep(2)
  }

  const submit = async () => {
    if (!validateStep1()) { setStep(1); return }
    setLoading(true)
    setError('')

    // Build payload — only send optional fields if non-empty
    const payload = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      nickname: form.nickname.trim(),
      age: parseInt(form.age),
      gender: form.gender,
      education: form.education || null,
      profession: form.profession || null,
      field_of_study: form.field_of_study.trim() || null,
      country: form.country.trim() || null,
      bio: form.bio.trim() || null,
    }

    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create account')
      }
      onComplete(data)
      nav('/test/mbti')
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.back} onClick={() => step === 2 ? setStep(1) : nav('/')}>
            ← {step === 2 ? 'Back' : 'Home'}
          </button>
          <div className={styles.stepIndicator}>
            <span className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`} />
            <span className={styles.stepLine} />
            <span className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`} />
          </div>
        </div>

        {step === 1 && (
          <div className={styles.form} key="step1">
            <div className={styles.formHeader}>
              <p className={styles.eyebrow}>Step 1 of 2</p>
              <h2 className={styles.formTitle}>Create your profile</h2>
              <p className={styles.formSub}>All fields on this page are required</p>
            </div>

            <div className={styles.fields}>
              <Field label="Username" required error={fieldErrors.username}>
                <input className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
                  placeholder="e.g. stargazer42 (letters, numbers, _)"
                  value={form.username}
                  onChange={e => set('username', e.target.value)} />
              </Field>

              <Field label="Display Nickname" required error={fieldErrors.nickname}>
                <input className={`${styles.input} ${fieldErrors.nickname ? styles.inputError : ''}`}
                  placeholder="What should we call you?"
                  value={form.nickname}
                  onChange={e => set('nickname', e.target.value)} />
              </Field>

              <Field label="Email Address" required error={fieldErrors.email}>
                <input className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                  type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </Field>

              <div className={styles.row}>
                <Field label="Age" required error={fieldErrors.age}>
                  <input className={`${styles.input} ${fieldErrors.age ? styles.inputError : ''}`}
                    type="number" min="10" max="120" placeholder="Age"
                    value={form.age}
                    onChange={e => set('age', e.target.value)} />
                </Field>

                <Field label="Gender" required error={fieldErrors.gender}>
                  <select className={`${styles.select} ${fieldErrors.gender ? styles.inputError : ''}`}
                    value={form.gender}
                    onChange={e => set('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.btn} onClick={handleContinue}>
              Continue <span>→</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.form} key="step2">
            <div className={styles.formHeader}>
              <p className={styles.eyebrow}>Step 2 of 2 · Optional</p>
              <h2 className={styles.formTitle}>Tell us more</h2>
              <p className={styles.formSub}>These help us give richer insights — skip any you prefer</p>
            </div>

            <div className={styles.fields}>
              <Field label="Education Level">
                <select className={styles.select} value={form.education} onChange={e => set('education', e.target.value)}>
                  <option value="">Select education (optional)</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>

              <Field label="Field of Study">
                <input className={styles.input} placeholder="e.g. Psychology, Computer Science (optional)"
                  value={form.field_of_study} onChange={e => set('field_of_study', e.target.value)} />
              </Field>

              <Field label="Profession">
                <select className={styles.select} value={form.profession} onChange={e => set('profession', e.target.value)}>
                  <option value="">Select profession (optional)</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="Country">
                <input className={styles.input} placeholder="Where are you from? (optional)"
                  value={form.country} onChange={e => set('country', e.target.value)} />
              </Field>

              <Field label="Short Bio">
                <textarea className={styles.textarea} placeholder="Anything you'd like to share... (optional)"
                  rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} />
              </Field>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.btn} disabled={loading} onClick={submit}>
              {loading
                ? <><span className={styles.spinner} /> Creating profile...</>
                : <>Start Assessment →</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: '0.05em' }}>
        {label}
        {required && <span style={{ color: 'var(--rose)', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--rose)', marginTop: 2 }}>{error}</span>}
    </div>
  )
}
