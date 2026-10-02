export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

/** Tantiya ng haba ng video kung binabasa sa ~130 words kada minuto. */
export function estimateSpeakingTime(words: number): string {
  if (words === 0) return '0 sec'
  const seconds = Math.round((words / 130) * 60)
  if (seconds < 60) return `${seconds} sec`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m} min ${s} sec` : `${m} min`
}
