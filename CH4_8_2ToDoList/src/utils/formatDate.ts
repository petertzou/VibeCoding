const formatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCompletedAt(timestamp: number): string {
  return formatter.format(new Date(timestamp))
}
