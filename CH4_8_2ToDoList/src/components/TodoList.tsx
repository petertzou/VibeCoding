import type { Todo, TodoId } from '../types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  title: string
  emptyMessage: string
  todos: Todo[]
  editingId: TodoId | null
  draft: string
  onDraftChange: (value: string) => void
  onStartEdit: (id: TodoId, title: string) => void
  onSaveEdit: (id: TodoId) => void
  onCancelEdit: () => void
  onToggleComplete: (id: TodoId) => void
  onDelete: (id: TodoId) => void
}

export default function TodoList({
  title,
  emptyMessage,
  todos,
  editingId,
  draft,
  onDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
}: TodoListProps) {
  return (
    <section aria-labelledby={`${title}-heading`} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id={`${title}-heading`} className="text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-600">
          {todos.length}
        </span>
      </div>

      {todos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={editingId === todo.id}
              draft={draft}
              onDraftChange={onDraftChange}
              onStartEdit={() => onStartEdit(todo.id, todo.title)}
              onSaveEdit={() => onSaveEdit(todo.id)}
              onCancelEdit={onCancelEdit}
              onToggleComplete={() => onToggleComplete(todo.id)}
              onDelete={() => onDelete(todo.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
