import { useState } from 'react'
import { Check, Copy, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react'
import type { DescricaoResponse, DescricaoFinal } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HtmlPreview } from '@/components/HtmlPreview'

interface Props {
  result: DescricaoResponse
  onReset: () => void
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* noop */
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : label}
    </Button>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildCombinedHtml(d: DescricaoFinal): string {
  const parts: string[] = []

  if (d.descricao_curta?.trim()) {
    parts.push(`<p>${escapeHtml(d.descricao_curta.trim())}</p>`)
  }

  if (d.descricao_longa_html?.trim()) {
    parts.push(d.descricao_longa_html.trim())
  }

  if (d.bullets_beneficios?.length) {
    parts.push('<h2>Principais benefícios</h2>')
    parts.push(
      '<ul>\n' +
        d.bullets_beneficios.map((b) => `  <li>${escapeHtml(b)}</li>`).join('\n') +
        '\n</ul>',
    )
  }

  if (d.faq?.length) {
    parts.push('<h2>Perguntas frequentes</h2>')
    for (const item of d.faq) {
      parts.push(
        `<h3>${escapeHtml(item.pergunta)}</h3>\n<p>${escapeHtml(item.resposta)}</p>`,
      )
    }
  }

  return parts.join('\n\n')
}

export function DescricaoResultado({ result, onReset }: Props) {
  const { descricao_final: d, status, problemas_encontrados } = result
  const temProblemas = problemas_encontrados && problemas_encontrados.length > 0
  const combinedHtml = buildCombinedHtml(d)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Descrição gerada</h2>
          {status && (
            <Badge variant={status === 'aprovado' ? 'default' : 'secondary'}>
              {status.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Criar nova descrição
        </Button>
      </div>

      {/* Problemas detectados pelo QA */}
      {temProblemas && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Observações do QA ({problemas_encontrados!.length})
            </CardTitle>
            <CardDescription className="text-amber-800/80">
              Pontos revisados automaticamente. Verifique antes de publicar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-amber-900">
              {problemas_encontrados!.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* H1 e meta description — separados */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>H1 e meta description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="H1" value={d.h1} />
          <Field label="Meta description" value={d.meta_description} multiline />
        </CardContent>
      </Card>

      {/* Bloco único com tudo junto */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Descrição completa (HTML)</CardTitle>
            <CardDescription>
              Descrição curta + longa + benefícios + FAQ num único bloco, pronto pra colar.
            </CardDescription>
          </div>
          <CopyButton text={combinedHtml} label="Copiar HTML" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border bg-white p-4 overflow-auto">
              <HtmlPreview html={combinedHtml} />
            </div>
            <pre className="max-h-[520px] overflow-auto rounded-md border bg-muted/40 p-4 text-xs leading-relaxed">
              <code>{combinedHtml}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <p className={`text-sm ${multiline ? 'leading-relaxed' : 'font-medium'}`}>{value}</p>
    </div>
  )
}
