export function encodeBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      (_match, p1) => String.fromCharCode(Number(`0x${p1}`)),
    ),
  )
}

export function decodeBase64(str: string) {
  return decodeURIComponent(
    Array.prototype.map.call(
      atob(str),
      c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`,
    ).join(''),
  )
}
