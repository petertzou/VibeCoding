import { useTodoEditor } from '../hooks/useTodoEditor'
import { useTodos } from '../hooks/useTodos'
import type { TodoId } from '../types/todo'
import TodoForm from './TodoForm'
import TodoList from './TodoList'

export default function TodoApp() {
  const {
    mainTodos,
    completedTodos,
    hideCompleted,
    setHideCompleted,
    addTodo,
    deleteTodo,
    updateTodo,
    toggleComplete,
  } = useTodos()

  const { editingId, draft, setDraft, startEdit, cancelEdit, clearEditing } = useTodoEditor()

  const handleSaveEdit = (id: TodoId) => {
    const trimmed = draft.trim()
    if (!trimmed) return
    updateTodo(id, { title: trimmed })
    clearEditing()
  }

  const listProps = {
    editingId,
    draft,
    onDraftChange: setDraft,
    onStartEdit: startEdit,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: cancelEdit,
    onToggleComplete: toggleComplete,
    onDelete: deleteTodo,
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-violet-100/50 backdrop-blur sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">待辦事項</h1>
        <p className="mt-1 text-sm text-slate-500">快速新增、完成與管理你的任務</p>
      </header>

      <TodoForm onAdd={(title) => addTodo({ title })} />

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
        <input
          id="hide-completed"
          type="checkbox"
          checked={hideCompleted}
          onChange={(event) => setHideCompleted(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />
        <label htmlFor="hide-completed" className="text-sm text-slate-700">
          在主列表隱藏已完成項目
        </label>
      </div>

      <div className="mt-8 space-y-10">
        <TodoList
          title={hideCompleted ? '進行中' : '全部待辦'}
          emptyMessage={
            hideCompleted
              ? '目前沒有進行中的待辦，新增一筆開始吧！'
              : '尚無待辦事項，新增一筆開始吧！'
          }
          todos={mainTodos}
          {...listProps}
        />

        <TodoList
          title="已完成"
          emptyMessage="尚無已完成的待辦。"
          todos={completedTodos}
          {...listProps}
        />
      </div>
    </div>
  )
}
