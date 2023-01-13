export function getEnv(name: string) {
  if (!process.env[name]) throw new Error(`Param ${name} missing during execution`)
  return process.env[name]!
}

export function range(n: number) {
  return [...Array(n).keys()]
}

export function round(n: number, decimals = 0) {
  const dec = Math.pow(10, decimals)
  return Math.round(n * dec) / dec
}

export function sum(list: number[]) {
  return list.reduce((a, b) => a + b, 0)
}

export function chunk<T>(arr: T[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
