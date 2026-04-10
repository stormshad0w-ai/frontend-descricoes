import { DescricaoForm } from '@/components/DescricaoForm'

export default function App() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Criador de Descrições</h1>
          <p className="mt-1 text-muted-foreground">
            Preencha o formulário e envie para o workflow n8n.
          </p>
        </header>
        <DescricaoForm />
      </div>
    </div>
  )
}
