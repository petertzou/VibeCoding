import { useCallback, useMemo, useState } from 'react'
import {
  addTodo as addTodoAction,
  deleteTodo as deleteTodoAction,
  partitionTodos,
  selectMainTodos,
  toggleTodoComplete,
  updateTodo as updateTodoAction,
} from '../lib/todoActions'
import type { Todo, TodoId, TodoInput, TodoUpdate } from '../types/todo'
import { isPersistedTodo } from '../utils/todoGuards'

const STORAGE_KEY = 'todo-list:v1'

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPersistedTodo)
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [hideCompleted, setHideCompleted] = useState(false)

  const persist = useCallback((next: Todo[]) => {
    setTodos(next)
    saveTodos(next)
  }, [])

  const addTodo = useCallback(
    (input: TodoInput) => {
      persist(addTodoAction(todos, input))
    },
    [persist, todos],
  )

  const deleteTodo = useCallback(
    (id: TodoId) => {
      persist(deleteTodoAction(todos, id))
    },
    [persist, todos],
  )

  const updateTodo = useCallback(
    (id: TodoId, patch: TodoUpdate) => {
      persist(updateTodoAction(todos, id, patch))
    },
    [persist, todos],
  )

  const toggleComplete = useCallback(
    (id: TodoId) => {
      persist(toggleTodoComplete(todos, id))
    },
    [persist, todos],
  )

  const { active, completed } = useMemo(() => partitionTodos(todos), [todos])
  const mainTodos = useMemo(() => selectMainTodos(todos, hideCompleted), [todos, hideCompleted])

  return {
    todos,
    mainTodos,
    activeTodos: active,
    completedTodos: completed,
    hideCompleted,
    setHideCompleted,
    addTodo,
    deleteTodo,
    updateTodo,
    toggleComplete,
  }
}

export type UseTodosReturn = ReturnType<typeof useTodos>
