import DOMPurify from 'dompurify'

interface HtmlPreviewProps {
  html: string
}

export function HtmlPreview({ html }: HtmlPreviewProps) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'b', 'em', 'i', 'u', 's',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption',
      'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  })

  if (!clean.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
        O preview aparecerá aqui conforme você digita...
      </div>
    )
  }

  return (
    <div
      className="prose-preview text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
