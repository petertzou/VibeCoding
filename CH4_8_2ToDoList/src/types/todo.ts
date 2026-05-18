export type TodoId = string

export interface TodoBase {
  id: TodoId
  title: string
  createdAt: number
}

export interface ActiveTodo extends TodoBase {
  completed: false
  completedAt?: undefined
}

export interface CompletedTodo extends TodoBase {
  completed: true
  completedAt: number
}

export type Todo = ActiveTodo | CompletedTodo

export type TodoInput = Pick<TodoBase, 'title'>

export type TodoUpdate = Partial<Pick<TodoBase, 'title'>>

export type TodoListFilter = 'active' | 'completed' | 'all'
