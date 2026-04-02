import { useRef, useEffect } from 'react'

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null)

  const getSignal = () => {
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()
    return controllerRef.current.signal
  }

  const abort = () => controllerRef.current?.abort()

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { getSignal, abort }
}
