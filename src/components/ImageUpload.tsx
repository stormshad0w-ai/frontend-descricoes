import { useRef, useState } from 'react'
import { X, Upload, ImageIcon } from 'lucide-react'
import type { Imagem } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value: Imagem[]
  onChange: (images: Imagem[]) => void
  error?: string
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setLocalError(null)

    const valid = Array.from(files).filter((f) => {
      if (!ACCEPTED.includes(f.type)) {
        setLocalError('Formato não suportado. Use JPEG, PNG, WebP ou GIF.')
        return false
      }
      if (f.size > MAX_SIZE) {
        setLocalError('Arquivo muito grande. Máximo 5 MB por imagem.')
        return false
      }
      return true
    })

    if (valid.length === 0) return

    setLoading(true)
    try {
      const novas: Imagem[] = await Promise.all(
        valid.map(async (f) => ({
          nome: f.name,
          tipo: f.type,
          dados: await fileToBase64(f),
          alt: '',
        })),
      )
      onChange([...value, ...novas])
    } catch {
      setLocalError('Erro ao processar imagem. Tente novamente.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function updateAlt(index: number, alt: string) {
    onChange(value.map((img, i) => (i === index ? { ...img, alt } : img)))
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          dragOver ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50 hover:bg-muted/30',
          error && 'border-destructive',
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void handleFiles(e.dataTransfer.files)
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {loading ? 'Processando…' : 'Arraste imagens aqui ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF · máx. 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {(localError || error) && (
        <p className="text-xs text-destructive">{localError ?? error}</p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <div key={i} className="group relative space-y-1">
              <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                {img.dados ? (
                  <img
                    src={img.dados}
                    alt={img.alt || img.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <input
                type="text"
                placeholder="Texto alternativo"
                value={img.alt}
                onChange={(e) => updateAlt(i, e.target.value)}
                className="w-full rounded border border-input px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="truncate text-xs text-muted-foreground">{img.nome}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
