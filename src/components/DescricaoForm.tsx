import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { descricaoSchema, type DescricaoFormData } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import { HtmlPreview } from '@/components/HtmlPreview'

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string

type Status = 'idle' | 'loading' | 'success' | 'error'

export function DescricaoForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DescricaoFormData>({
    resolver: zodResolver(descricaoSchema),
    defaultValues: {
      titulo: '',
      descricao_curta: '',
      descricao_longa_html: '',
      imagens: [],
      categoria: '',
      preco: '',
      sku: '',
    },
  })

  const htmlValue = watch('descricao_longa_html')

  async function onSubmit(data: DescricaoFormData) {
    if (!WEBHOOK_URL) {
      setErrorMsg('VITE_N8N_WEBHOOK_URL não configurado.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setStatus('success')
      reset()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-semibold">Enviado com sucesso!</h2>
        <p className="text-muted-foreground">
          A descrição foi enviada para o n8n para processamento.
        </p>
        <Button onClick={() => setStatus('idle')}>Criar nova descrição</Button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Título e descrição curta do produto ou conteúdo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Nome do produto ou conteúdo"
              {...register('titulo')}
            />
            {errors.titulo && (
              <p className="text-xs text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao_curta">
              Descrição Curta <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descricao_curta"
              placeholder="Resumo em até 500 caracteres"
              rows={3}
              {...register('descricao_curta')}
            />
            {errors.descricao_curta && (
              <p className="text-xs text-destructive">{errors.descricao_curta.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Long HTML description + preview */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição Longa (HTML)</CardTitle>
          <CardDescription>
            Cole ou escreva HTML. O preview ao lado é sanitizado via DOMPurify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="descricao_longa_html">
                Código HTML <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descricao_longa_html"
                placeholder="<h2>Sobre o produto</h2><p>...</p>"
                className="min-h-[300px] font-mono text-xs"
                {...register('descricao_longa_html')}
              />
              {errors.descricao_longa_html && (
                <p className="text-xs text-destructive">{errors.descricao_longa_html.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Preview</Label>
              <div className="min-h-[300px] rounded-md border bg-white p-4 overflow-auto">
                <HtmlPreview html={htmlValue} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens</CardTitle>
          <CardDescription>
            Faça upload via Cloudinary. Pelo menos uma imagem é obrigatória.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="imagens"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                error={errors.imagens?.message ?? errors.imagens?.root?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Optional metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes Opcionais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Input id="categoria" placeholder="ex: Eletrônicos" {...register('categoria')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preco">Preço</Label>
            <Input id="preco" placeholder="ex: 299,90" {...register('preco')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="ex: PROD-001" {...register('sku')} />
          </div>
        </CardContent>
      </Card>

      {/* Error banner */}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg || 'Erro ao enviar. Tente novamente.'}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar para n8n
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
