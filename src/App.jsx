import { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-blue-100 p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-900 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function App() {
  const [hello, setHello] = useState('')

  useEffect(() => {
    fetch(`${BACKEND}`)
      .then((r) => r.json())
      .then((d) => setHello(d.message))
      .catch(() => setHello(''))
  }, [])

  // Forms state
  const [score, setScore] = useState({ user_id: '', module: 'Reading', score: '6.5', note: '' })
  const [ideaTopic, setIdeaTopic] = useState('technology in education')
  const [ideas, setIdeas] = useState([])
  const [writing, setWriting] = useState({ user_id: '', task_type: 'Task1', prompt: '', content: '' })
  const [evalResult, setEvalResult] = useState(null)
  const [reminder, setReminder] = useState({ user_id: '', title: '', due_date: '', category: 'general' })
  const [reminders, setReminders] = useState([])
  const [weak, setWeak] = useState({ weak_modules: [], suggestions: [] })

  const saveScore = async () => {
    const res = await fetch(`${BACKEND}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...score, score: parseFloat(score.score) })
    })
    const data = await res.json()
    alert('Score saved! ID: ' + data.id)
  }

  const getWeaknesses = async () => {
    const url = new URL(`${BACKEND}/api/weaknesses`)
    if (score.user_id) url.searchParams.set('user_id', score.user_id)
    const res = await fetch(url)
    const data = await res.json()
    setWeak(data)
  }

  const generateIdeas = async () => {
    const res = await fetch(`${BACKEND}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: ideaTopic, count: 5 })
    })
    const data = await res.json()
    setIdeas(data.ideas || [])
  }

  const evaluateWriting = async () => {
    const res = await fetch(`${BACKEND}/api/writing/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(writing)
    })
    const data = await res.json()
    setEvalResult(data)
  }

  const addReminder = async () => {
    const res = await fetch(`${BACKEND}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder)
    })
    const data = await res.json()
    await loadReminders()
    alert('Reminder added: ' + data.id)
  }

  const loadReminders = async () => {
    const url = new URL(`${BACKEND}/api/reminders`)
    if (reminder.user_id) url.searchParams.set('user_id', reminder.user_id)
    const res = await fetch(url)
    const data = await res.json()
    setReminders(data.items || [])
  }

  useEffect(() => {
    loadReminders()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">IELTS Coach</h1>
            <p className="text-blue-700/80">Blue & white experience inspired by Engnovate</p>
          </div>
          <a href="/test" className="text-blue-700 underline">Test connection</a>
        </header>

        {hello && (
          <div className="mb-6 text-sm text-blue-900 bg-white/60 border border-blue-100 p-3 rounded">
            {hello}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Record a Score (tracks improvement e.g., 28 → 31)">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="User ID (optional)" value={score.user_id} onChange={e=>setScore({...score, user_id:e.target.value})} />
              <select className="input" value={score.module} onChange={e=>setScore({...score, module:e.target.value})}>
                {['Listening','Reading','Writing','Speaking','Overall'].map(m=> <option key={m}>{m}</option>)}
              </select>
              <input className="input" placeholder="Score (0-9)" value={score.score} onChange={e=>setScore({...score, score:e.target.value})} />
              <input className="input" placeholder="Note" value={score.note} onChange={e=>setScore({...score, note:e.target.value})} />
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={saveScore} className="btn-primary">Save</button>
              <button onClick={getWeaknesses} className="btn-outline">Analyze Weaknesses</button>
            </div>
            {weak.weak_modules.length>0 && (
              <div className="mt-3 text-sm text-blue-900">
                <p className="font-semibold">Weak modules: {weak.weak_modules.join(', ')}</p>
                <ul className="list-disc ml-5 mt-1">
                  {weak.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="Essay Ideas (IDP-style brainstorming)">
            <div className="flex gap-3">
              <input className="input flex-1" value={ideaTopic} onChange={e=>setIdeaTopic(e.target.value)} />
              <button onClick={generateIdeas} className="btn-primary">Generate</button>
            </div>
            <ul className="mt-3 space-y-2">
              {ideas.map((it,idx)=> (
                <li key={idx} className="text-blue-900 text-sm bg-white/80 p-2 rounded border border-blue-100">{it}</li>
              ))}
            </ul>
          </Section>

          <Section title="Writing Evaluation (Task 1 & 2)">
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-3">
                <input className="input" placeholder="User ID (optional)" value={writing.user_id} onChange={e=>setWriting({...writing, user_id:e.target.value})} />
                <select className="input" value={writing.task_type} onChange={e=>setWriting({...writing, task_type:e.target.value})}>
                  <option>Task1</option>
                  <option>Task2</option>
                </select>
                <input className="input" placeholder="Prompt (optional)" value={writing.prompt} onChange={e=>setWriting({...writing, prompt:e.target.value})} />
              </div>
              <textarea className="input min-h-[140px]" placeholder="Paste your writing here" value={writing.content} onChange={e=>setWriting({...writing, content:e.target.value})} />
              <button onClick={evaluateWriting} className="btn-primary w-fit">Evaluate</button>
            </div>
            {evalResult && (
              <div className="mt-3 text-sm text-blue-900">
                <p><span className="font-semibold">Estimated band:</span> {evalResult.estimated_band}</p>
                <p><span className="font-semibold">Feedback:</span> {evalResult.feedback}</p>
              </div>
            )}
          </Section>

          <Section title="Reading Passages (Cambridge-like)">
            <button className="btn-outline" onClick={async()=>{
              const res = await fetch(`${BACKEND}/api/reading/passages`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({level:'moderate', paragraphs:3})})
              const data = await res.json()
              alert('Sample: '+data.title+' with '+data.paragraphs.length+' paragraphs')
            }}>Create Sample</button>
          </Section>

          <Section title="Reminders & Deadlines">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="User ID (optional)" value={reminder.user_id} onChange={e=>setReminder({...reminder, user_id:e.target.value})} />
              <input className="input" type="datetime-local" value={reminder.due_date} onChange={e=>setReminder({...reminder, due_date:e.target.value})} />
              <input className="input" placeholder="Title" value={reminder.title} onChange={e=>setReminder({...reminder, title:e.target.value})} />
              <select className="input" value={reminder.category} onChange={e=>setReminder({...reminder, category:e.target.value})}>
                {['general','reading','listening','writing','speaking'].map(c=>(<option key={c}>{c}</option>))}
              </select>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={addReminder} className="btn-primary">Add</button>
              <button onClick={loadReminders} className="btn-outline">Refresh</button>
            </div>
            <ul className="mt-3 space-y-2">
              {reminders.map(r=> (
                <li key={r._id} className="text-sm text-blue-900 bg-white/80 p-2 rounded border border-blue-100">
                  <span className="font-semibold">{r.title}</span> • {r.category} • due {new Date(r.due_date).toLocaleString()}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="All IELTS Info">
            <button className="btn-outline" onClick={async()=>{
              const res = await fetch(`${BACKEND}/api/info`)
              const data = await res.json()
              alert(Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n'))
            }}>Show</button>
          </Section>
        </div>

        <footer className="mt-10 text-center text-blue-800/70 text-sm">
          Built for your IELTS journey. Integrations: Google Sheets + n8n guidance below.
        </footer>
      </div>

      <style>{`
        .input { @apply bg-white/80 border border-blue-200 rounded px-3 py-2 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400; }
        .btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded; }
        .btn-outline { @apply bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 font-semibold px-4 py-2 rounded; }
      `}</style>
    </div>
  )
}

export default App
