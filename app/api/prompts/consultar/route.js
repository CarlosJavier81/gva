import { PrismaClient } from '@prisma/client'

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export async function POST(request) {
  try {
    // Recibimos los nuevos datos desde el WordPress
    const { fase, regimen, hechos, rama, etapa } = await request.json()
    
    // 1. Buscamos la plantilla usando la Fase y la Rama (Laboral)
    const plantilla = await prisma.plantillaPrompt.findFirst({
      where: { 
        faseId: parseInt(fase), // Ahora filtramos por el número de fase
        rama: rama,             // 'Laboral'
        etapa: etapa,           // 'Prelitigio'
        activo: true 
      }
    })

    if (!plantilla) {
      return new Response(JSON.stringify({ success: false, error: "Fase no configurada en la base de datos" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Definición de Límites de Seguridad (Blindaje)
    const limitesSeguridad = `
---
⚠️ RESTRICCIONES DE SEGURIDAD (PERÚ 2026):
- NO ALUCINAR: Si no existe jurisprudencia específica, usa principios generales. No inventes Casaciones.
- ACTUALIDAD: Solo normativa vigente al 2026.
- PRIVACIDAD: Usa [Nombre] para datos sensibles.
- FORMATO: Markdown estructurado.
---`;

    // 3. Ensamblaje Dinámico del Prompt
    // Combinamos la base de la DB con los hechos del abogado y los límites
    const promptFinal = `
${plantilla.promptSistema}

ESCENARIO:
- RÉGIMEN LABORAL: ${regimen}
- TAREA: ${plantilla.bloqueTarea}

MARCO JURÍDICO BASE:
${plantilla.bloqueDerecho}

HECHOS DEL CASO A ANALIZAR:
"""
${hechos}
"""

${limitesSeguridad}`;

    // 4. Retornamos el prompt listo para ser usado
    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        bloqueTarea: promptFinal,
        bloqueDerecho: "Verificado para régimen " + regimen
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}