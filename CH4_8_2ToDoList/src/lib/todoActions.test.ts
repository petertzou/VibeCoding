import { describe, expect, it } from 'vitest'
import {
  addTodo,
  createTodo,
  deleteTodo,
  partitionTodos,
  selectMainTodos,
  toggleTodoComplete,
  updateTodo,
} from './todoActions'
import { isCompletedTodo } from '../utils/todoGuards'

describe('todoActions', () => {
  it('新增待辦項目', () => {
    const todos = addTodo([], { title: '買牛奶' })
    expect(todos).toHaveLength(1)
    expect(todos[0]?.title).toBe('買牛奶')
    expect(todos[0]?.completed).toBe(false)
  })

  it('刪除待辦項目', () => {
    const created = createTodo({ title: '運動' })
    const todos = deleteTodo([created], created.id)
    expect(todos).toHaveLength(0)
  })

  it('修改待辦項目', () => {
    const created = createTodo({ title: '讀書' })
    const todos = updateTodo([created], created.id, { title: '讀完一章' })
    expect(todos[0]?.title).toBe('讀完一章')
  })

  it('標記完成並記錄完成時間', () => {
    const created = createTodo({ title: '繳費' })
    const now = 1_700_000_000_000
    const todos = toggleTodoComplete([created], created.id, now)
    const done = todos[0]
    expect(isCompletedTodo(done!)).toBe(true)
    expect(done?.completedAt).toBe(now)
  })

  it('隱藏已完成時主列表僅顯示進行中，完成列表仍可取得資料', () => {
    const active = createTodo({ title: '寫報告' })
    const pending = createTodo({ title: '回信' })
    const done = toggleTodoComplete([pending], pending.id, 1000)
    const all = [active, ...done]
    const { completed } = partitionTodos(all)
    const main = selectMainTodos(all, true)

    expect(main).toHaveLength(1)
    expect(main[0]?.title).toBe('寫報告')
    expect(completed).toHaveLength(1)
    expect(completed[0]?.title).toBe('回信')
  })

  it('取消隱藏時主列表包含全部項目', () => {
    const active = createTodo({ title: 'A' })
    const pending = createTodo({ title: 'B' })
    const completed = toggleTodoComplete([pending], pending.id, 1)
    const all = [active, ...completed]
    expect(selectMainTodos(all, false)).toHaveLength(2)
  })
})
