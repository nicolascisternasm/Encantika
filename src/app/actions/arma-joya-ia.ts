'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { Componente } from '@/features/arma-joya/types'

const client = new Anthropic()

type InputIA = {
  tipoJoya: string
  componentes: Componente[]
  nombreReceptor: string
  esRegalo: boolean
  intencionTexto: string
}

type ResultadoIA = {
  significadoIA: string
  tarjetaTexto: string
}

export async function generarSignificadoIA(input: InputIA): Promise<ResultadoIA> {
  const { tipoJoya, componentes, nombreReceptor, esRegalo, intencionTexto } = input

  // Construir lista de componentes con sus cualidades
  const listaComps = componentes
    .map((c) => {
      const partes = [c.nombre]
      if (c.desc_holistica) partes.push(`"${c.desc_holistica}"`)
      if (c.estilo_energia && c.estilo_energia !== 'neutro') partes.push(`energía ${c.estilo_energia}`)
      return `- ${partes.join(' — ')}`
    })
    .join('\n')

  const contextoReceptor = esRegalo
    ? `Esta joya es un regalo para ${nombreReceptor || 'una persona especial'}.`
    : nombreReceptor
      ? `Esta joya la lleva ${nombreReceptor}.`
      : 'Esta joya es para quien la crea.'

  const intencion = intencionTexto
    ? `Intención declarada: "${intencionTexto}".`
    : ''

  const prompt = `Eres la voz poética de Encantika, una joyería chilena de joyas con significado simbólico y holístico. Tu estilo es cálido, íntimo y lírico — nunca médico ni esotérico exagerado.

Se ha creado un ${tipoJoya} con estos componentes:
${listaComps}

${contextoReceptor} ${intencion}

Responde en JSON con exactamente dos campos:

{
  "significadoIA": "Un párrafo de 3-4 oraciones sobre el significado simbólico de la combinación. Empieza con la sinergía entre los elementos. Usa lenguaje poético pero terrenal. Menciona qué cualidades se amplifican juntas. Sin afirmaciones médicas ni garantías.",
  "tarjetaTexto": "Un mensaje personal de 2-3 oraciones ${esRegalo ? `para incluir en la tarjeta de regalo dirigida a ${nombreReceptor || 'la persona'}` : 'que la portadora puede guardar como recordatorio de su intención'}. Cálido, personal, breve. Puede incluir la intención si fue declarada."
}

Solo devuelve el JSON, sin markdown, sin texto adicional.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const texto = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  try {
    const resultado = JSON.parse(texto) as ResultadoIA
    return {
      significadoIA: resultado.significadoIA ?? '',
      tarjetaTexto: resultado.tarjetaTexto ?? '',
    }
  } catch {
    // Fallback si el JSON viene malformado
    return {
      significadoIA: texto,
      tarjetaTexto: '',
    }
  }
}

// ── Descripción del diseño (sin personalización) ───────────────────────────

export async function describirDisenoIA(input: {
  tipoJoya: string
  componentes: Componente[]
}): Promise<string> {
  const { tipoJoya, componentes } = input

  const lista = componentes
    .map((c) => {
      const partes = [c.nombre]
      if (c.material) partes.push(c.material)
      if (c.descripcion) partes.push(c.descripcion)
      if (c.desc_holistica) partes.push(`significado: "${c.desc_holistica}"`)
      return `- ${partes.join(' · ')}`
    })
    .join('\n')

  const prompt = `Eres la voz poética de Encantika, una joyería chilena de joyas con significado simbólico. Tu estilo es cálido y lírico.

Se ha diseñado un ${tipoJoya} con:
${lista}

Escribe una descripción de 3-5 oraciones del conjunto: qué materiales lo componen, qué emociones o cualidades evoca la combinación y por qué esta joya es especial. Usa lenguaje poético pero comprensible. Sin afirmaciones médicas.

Devuelve solo el texto de la descripción, sin JSON, sin encabezados.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}
