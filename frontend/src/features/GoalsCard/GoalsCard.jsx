import React, { useState, useCallback } from 'react'
import './GoalsCard.css'

const MAX_TASKS = 5
const DEFAULT_CATEGORY = 'Website'
const DEFAULT_PRIORITY = 'Low'

const generateId = () => Math.random().toString(36).slice(2, 11)

const CategoryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 7h12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const PriorityIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M8 2L4 6M8 2l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const TaskIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5L9.5 6.5M7 5l2-2 4 4-2 2M5 11l-2 2 4-4 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const PaperclipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M11 2H9.5a3 3 0 00-3 3v6a2 2 0 004 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 6v5a3 3 0 006 0V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H5l-3 3V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const initialGoals = [
  {
    id: generateId(),
    title: 'Moodboarding Homepage Design',
    project: 'Revenue Project',
    category: DEFAULT_CATEGORY,
    priority: DEFAULT_PRIORITY,
    tasks: [{ id: generateId(), label: 'Create moodboard', completed: false }],
    dueDate: 'Mar 10, 2025',
    attachmentsCount: 2,
    commentsCount: 1,
  },
]

const GoalsCard = () => {
  const [goals, setGoals] = useState(initialGoals)
  const [expandedId, setExpandedId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const addGoal = useCallback(() => {
    if (!newTitle.trim()) return
    setGoals((prev) => [
      ...prev,
      {
        id: generateId(),
        title: newTitle.trim(),
        project: 'Revenue Project',
        category: DEFAULT_CATEGORY,
        priority: DEFAULT_PRIORITY,
        tasks: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        attachmentsCount: 0,
        commentsCount: 0,
      },
    ])
    setNewTitle('')
    setShowAddForm(false)
  }, [newTitle])

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    if (expandedId === id) setExpandedId(null)
  }, [expandedId])

  const toggleTask = useCallback((goalId, taskId) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
          : g
      )
    )
  }, [])

  const addTask = useCallback((goalId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId || g.tasks.length >= MAX_TASKS) return g
        return { ...g, tasks: [...g.tasks, { id: generateId(), label: 'New task', completed: false }] }
      })
    )
  }, [])

  const updateTaskLabel = useCallback((goalId, taskId, label) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, label } : t)) }
          : g
      )
    )
  }, [])

  return (
    <div className="goals-card">
      <div className="goals-header">
        <h3 className="goals-title">Goals</h3>
        <span className="goals-count">{goals.length}</span>
        <button type="button" className="goals-add-btn" onClick={() => setShowAddForm(true)} aria-label="Add goal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showAddForm && (
        <div className="goals-add-form">
          <input
            type="text"
            className="goals-add-input"
            placeholder="Goal title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            autoFocus
          />
          <div className="goals-add-actions">
            <button type="button" className="goals-btn goals-btn--secondary" onClick={() => { setShowAddForm(false); setNewTitle('') }}>Cancel</button>
            <button type="button" className="goals-btn goals-btn--primary" onClick={addGoal}>Add</button>
          </div>
        </div>
      )}

      <div className="goals-list">
        {goals.map((goal) => {
          const expanded = expandedId === goal.id
          const completedTasks = goal.tasks.filter((t) => t.completed).length
          const taskLabel = `Task ${completedTasks}/${goal.tasks.length}`

          return (
            <div
              key={goal.id}
              className={`goal-item ${expanded ? 'goal-item--expanded' : ''}`}
              onClick={() => !expanded && setExpandedId(goal.id)}
            >
              <div className="goal-tags">
                <span className="goal-tag goal-tag--category">
                  <CategoryIcon />
                  {goal.category}
                </span>
                <span className="goal-tag goal-tag--priority">
                  <PriorityIcon />
                  {goal.priority}
                </span>
                <span className="goal-tag goal-tag--tasks">
                  <TaskIcon />
                  {taskLabel}
                </span>
              </div>
              <h4 className="goal-title">{goal.title}</h4>
              <div className="goal-project">
                <LinkIcon />
                <span>{goal.project}</span>
              </div>
              <div className="goal-meta">
                <div className="goal-avatars">
                  {[1, 2, 3].slice(0, 2).map((i) => (
                    <div key={i} className="goal-avatar" style={{ background: `hsl(${i * 120}, 60%, 50%)`, color: '#fff' }}>
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="goal-meta-item">
                  <CalendarIcon />
                  {goal.dueDate}
                </span>
                <span className="goal-meta-item">
                  <PaperclipIcon />
                  {goal.attachmentsCount}
                </span>
                <span className="goal-meta-item">
                  <CommentIcon />
                  {goal.commentsCount}
                </span>
              </div>

              {expanded && (
                <div className="goal-tasks" onClick={(e) => e.stopPropagation()}>
                  <div className="goal-tasks-header">
                    <span>Tasks</span>
                    {goal.tasks.length < MAX_TASKS && (
                      <button type="button" className="goals-btn goals-btn--small" onClick={() => addTask(goal.id)}>+ Add task</button>
                    )}
                  </div>
                  <ul className="goal-tasks-list">
                    {goal.tasks.map((t) => (
                      <li key={t.id} className="goal-task">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleTask(goal.id, t.id)}
                          className="goal-task-checkbox"
                        />
                        <input
                          type="text"
                          className="goal-task-input"
                          value={t.label}
                          onChange={(e) => updateTaskLabel(goal.id, t.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="goal-actions">
                    <button type="button" className="goals-btn goals-btn--danger" onClick={() => deleteGoal(goal.id)}>Delete goal</button>
                    <button type="button" className="goals-btn goals-btn--secondary" onClick={() => setExpandedId(null)}>Close</button>
                  </div>
                </div>
              )}

              {!expanded && (
                <button
                  type="button"
                  className="goal-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}
                  aria-label="Delete goal"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4h8v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4zM2 4h2M12 4h2M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GoalsCard
