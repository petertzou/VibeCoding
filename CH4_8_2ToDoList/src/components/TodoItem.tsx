import type { Todo } from '../types/todo'
import { formatCompletedAt } from '../utils/formatDate'
import { isCompletedTodo } from '../utils/todoGuards'

interface TodoItemProps {
  todo: Todo
  isEditing: boolean
  draft: string
  onDraftChange: (value: string) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleComplete: () => void
  onDelete: () => void
}

export default function TodoItem({
  todo,
  isEditing,
  draft,
  onDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
}: TodoItemProps) {
  const completed = isCompletedTodo(todo)

  return (
    <li className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <button
          type="button"
          onClick={onToggleComplete}
          aria-label={completed ? '標記為未完成' : '標記完成'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition sm:mt-0 ${
            completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-transparent hover:border-violet-400'
          }`}
        >
          {completed ? '✓' : ''}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-violet-200 px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-violet-100"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className={`min-w-0 flex-1 text-left text-base transition ${
              completed ? 'text-slate-400 line-through' : 'text-slate-800 hover:text-violet-700'
            }`}
          >
            {todo.title}
          </button>
        )}

        {completed && todo.completedAt !== undefined && !isEditing && (
          <time
            dateTime={new Date(todo.completedAt).toISOString()}
            className="shrink-0 text-xs text-slate-400 sm:ml-2"
          >
            完成於 {formatCompletedAt(todo.completedAt)}
          </time>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onSaveEdit}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              修改
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onDelete}
            aria-label="刪除待辦"
            className="rounded-lg px-3 py-1.5 text-sm text-rose-600 opacity-80 transition hover:bg-rose-50 hover:opacity-100"
          >
            刪除
          </button>
        )}
      </div>
    </li>
  )
}
