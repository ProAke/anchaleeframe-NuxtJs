export function useToast() {
  const toast = useState<{ id: number; message: string; tone: 'success' | 'error' | 'info' } | null>('anchalee-toast', () => null)
  let timeout: ReturnType<typeof setTimeout> | undefined
  function show(message: string, tone: 'success' | 'error' | 'info' = 'success') {
    if (import.meta.client) {
      if (timeout) clearTimeout(timeout)
      toast.value = { id: Date.now(), message, tone }
      timeout = setTimeout(() => { toast.value = null }, 3200)
    }
  }
  return { toast, show }
}
