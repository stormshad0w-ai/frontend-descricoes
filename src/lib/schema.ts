import { z } from 'zod'

export const imagemSchema = z.object({
  nome: z.string(),
  tipo: z.string(),
  dados: z.string(), // base64 data URL
  alt: z.string().default(''),
})

export const descricaoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  descricao_curta: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  descricao_longa_html: z
    .string()
    .min(20, 'Descrição muito curta'),
  imagens: z
    .array(imagemSchema)
    .min(1, 'Adicione pelo menos uma imagem'),
  categoria: z.string().optional(),
  preco: z.string().optional(),
  sku: z.string().optional(),
})

export type DescricaoFormData = z.infer<typeof descricaoSchema>
export type Imagem = z.infer<typeof imagemSchema>
