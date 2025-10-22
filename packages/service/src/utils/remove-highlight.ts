export function removeHighlight(txt: string) {
  return txt.replace(/<em>/g, '').replace(/<\/em>/g, '')
}
