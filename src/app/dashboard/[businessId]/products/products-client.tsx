'use client'

import { useState } from 'react'
import { Edit3, Loader2, Package, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createProduct, deleteProduct, updateProduct } from '@/lib/actions/products'

type OfferingType = 'product' | 'service'

interface Product {
  id: string
  type: OfferingType
  name: string
  description: string | null
  price_info: string | null
  url: string | null
}

interface ProductsClientProps {
  businessId: string
  initialProducts: Product[]
}

const emptyForm = {
  type: 'product' as OfferingType,
  name: '',
  description: '',
  priceInfo: '',
  url: ''
}

export function ProductsClient({ businessId, initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      type: product.type,
      name: product.name,
      description: product.description || '',
      priceInfo: product.price_info || '',
      url: product.url || ''
    })
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      if (editingId) {
        await updateProduct(businessId, editingId, form.type, form.name, form.description, form.priceInfo, form.url)
        setProducts((current) => current.map((product) => product.id === editingId ? {
          ...product,
          type: form.type,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price_info: form.priceInfo.trim() || null,
          url: form.url.trim() || null
        } : product))
        toast.success('Penawaran berhasil diperbarui.')
      } else {
        await createProduct(businessId, form.type, form.name, form.description, form.priceInfo, form.url)
        toast.success('Penawaran berhasil ditambahkan.')
        window.location.reload()
        return
      }
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan penawaran.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Hapus penawaran ini?')) return
    try {
      await deleteProduct(businessId, productId)
      setProducts((current) => current.filter((product) => product.id !== productId))
      if (editingId === productId) resetForm()
      toast.success('Penawaran berhasil dihapus.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus penawaran.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground bg-card">
            <Package className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p>Belum ada produk atau layanan.</p>
            <p className="mt-1 text-xs">Tambahkan penawaran agar AI dapat memahami apa yang Anda tawarkan.</p>
          </div>
        ) : products.map((product) => (
          <div key={product.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{product.type}</span>
                  {product.price_info && <span className="text-xs text-muted-foreground">{product.price_info}</span>}
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                {product.description && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{product.description}</p>}
                {product.url && <p className="mt-2 truncate text-xs text-primary">{product.url}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(product)} aria-label="Edit penawaran">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} aria-label="Hapus penawaran" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSave} className="h-fit space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{editingId ? 'Edit Penawaran' : 'Tambah Penawaran'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Dipakai sebagai konteks untuk AI Content Studio.</p>
          </div>
          {editingId && <Button type="button" variant="ghost" size="icon" onClick={resetForm} aria-label="Batal edit"><X className="h-4 w-4" /></Button>}
        </div>
        <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as OfferingType })}>
          <option value="product">Produk</option>
          <option value="service">Layanan</option>
        </select>
        <input required maxLength={200} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Nama produk atau layanan" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <textarea maxLength={4000} className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Deskripsi singkat" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input maxLength={200} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Harga, contoh: Mulai Rp500.000" value={form.priceInfo} onChange={(event) => setForm({ ...form, priceInfo: event.target.value })} />
        <input type="url" maxLength={500} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="URL (opsional)" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
        <Button type="submit" disabled={isSaving} className="w-full gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editingId ? 'Simpan Perubahan' : 'Tambah Penawaran'}
        </Button>
      </form>
    </div>
  )
}
