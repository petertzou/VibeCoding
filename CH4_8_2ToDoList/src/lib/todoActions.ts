import type { ActiveTodo, CompletedTodo, Todo, TodoId, TodoInput, TodoUpdate } from '../types/todo'
import { isCompletedTodo } from '../utils/todoGuards'

export function createTodoId(): TodoId {
  return crypto.randomUUID()
}

export function createTodo(input: TodoInput, now = Date.now()): ActiveTodo {
  const title = input.title.trim()
  if (!title) {
    throw new Error('待辦標題不可為空')
  }
  return {
    id: createTodoId(),
    title,
    createdAt: now,
    completed: false,
  }
}

export function addTodo(todos: Todo[], input: TodoInput): Todo[] {
  return [...todos, createTodo(input)]
}

export function deleteTodo(todos: Todo[], id: TodoId): Todo[] {
  return todos.filter((todo) => todo.id !== id)
}

export function updateTodo(todos: Todo[], id: TodoId, patch: TodoUpdate): Todo[] {
  const title = patch.title?.trim()
  if (patch.title !== undefined && !title) {
    throw new Error('待辦標題不可為空')
  }
  return todos.map((todo) => {
    if (todo.id !== id) return todo
    if (title === undefined) return todo
    return { ...todo, title }
  })
}

export function toggleTodoComplete(todos: Todo[], id: TodoId, now = Date.now()): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== id) return todo
    if (isCompletedTodo(todo)) {
      const active: ActiveTodo = {
        id: todo.id,
        title: todo.title,
        createdAt: todo.createdAt,
        completed: false,
      }
      return active
    }
    const completed: CompletedTodo = {
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt,
      completed: true,
      completedAt: now,
    }
    return completed
  })
}

export function partitionTodos(todos: Todo[]) {
  const active: ActiveTodo[] = []
  const completed: CompletedTodo[] = []
  for (const todo of todos) {
    if (isCompletedTodo(todo)) completed.push(todo)
    else active.push(todo)
  }
  return { active, completed }
}

export function selectMainTodos(todos: Todo[], hideCompleted: boolean): Todo[] {
  if (!hideCompleted) return todos
  return partitionTodos(todos).active
}
