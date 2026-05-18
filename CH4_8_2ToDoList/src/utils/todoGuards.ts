import type { CompletedTodo, Todo, TodoId } from '../types/todo'

export function isCompletedTodo(todo: Todo): todo is CompletedTodo {
  return todo.completed === true && typeof todo.completedAt === 'number'
}

export function isValidTodoId(value: unknown): value is TodoId {
  return typeof value === 'string' && value.trim().length > 0
}

export function isPersistedTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return false
  if (typeof record.createdAt !== 'number') return false
  if (record.completed === true) {
    return typeof record.completedAt === 'number'
  }
  return record.completed === false
}
