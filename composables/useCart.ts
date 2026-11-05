export interface CartProduct {
  id: number
  description?: string
  sku: string
  slug: string
  name: string
  subtitle?: string
  price: number
  compareAtPrice?: number | null
  stock: number
  imageKey: string
  imageUrl?: string
  category?: string
}
export interface CartLine { product: CartProduct; quantity: number }

export function useCart() {
  const lines = useState<CartLine[]>('anchalee-cart', () => [])
  const hydrated = useState('anchalee-cart-hydrated', () => false)
  const attached = useState('anchalee-cart-persistence-attached', () => false)

  if (import.meta.client && !attached.value) {
    attached.value = true
    onMounted(() => {
      if (!hydrated.value) {
        try {
          const stored = localStorage.getItem('anchalee-cart')
          if (stored) lines.value = JSON.parse(stored) as CartLine[]
        } catch {
          localStorage.removeItem('anchalee-cart')
        }
        hydrated.value = true
      }
    })
    watch(lines, (value) => {
      if (hydrated.value) localStorage.setItem('anchalee-cart', JSON.stringify(value))
    }, { deep: true })
  }

  const count = computed(() => lines.value.reduce((total, line) => total + line.quantity, 0))
  const subtotal = computed(() => lines.value.reduce((total, line) => total + Number(line.product.price) * line.quantity, 0))
  const shippingFee = computed(() => subtotal.value === 0 ? 0 : 80)
  const total = computed(() => subtotal.value + shippingFee.value)

  function add(product: CartProduct, amount = 1) {
    if (product.stock < 1) return false
    const existing = lines.value.find((line) => line.product.id === product.id)
    if (existing) existing.quantity = Math.min(Math.min(product.stock, 20), existing.quantity + amount)
    else lines.value.push({ product: { ...product }, quantity: Math.max(1, Math.min(Math.min(product.stock, 20), amount)) })
    return true
  }
  function setQuantity(productId: number, quantity: number) {
    const line = lines.value.find((item) => item.product.id === productId)
    if (!line) return
    if (quantity <= 0) remove(productId)
    else line.quantity = Math.min(Math.min(line.product.stock, 20), Math.floor(quantity))
  }
  function remove(productId: number) {
    lines.value = lines.value.filter((line) => line.product.id !== productId)
  }
  function clear() { lines.value = [] }

  return { lines, count, subtotal, shippingFee, total, add, setQuantity, remove, clear }
}
