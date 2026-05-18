import { useCallback, useState } from 'react'
import type { TodoId } from '../types/todo'

export function useTodoEditor() {
  const [editingId, setEditingId] = useState<TodoId | null>(null)
  const [draft, setDraft] = useState('')

  const startEdit = useCallback((id: TodoId, title: string) => {
    setEditingId(id)
    setDraft(title)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setDraft('')
  }, [])

  return {
    editingId,
    draft,
    setDraft,
    startEdit,
    cancelEdit,
    clearEditing: cancelEdit,
  }
}

export type UseTodoEditorReturn = ReturnType<typeof useTodoEditor>
