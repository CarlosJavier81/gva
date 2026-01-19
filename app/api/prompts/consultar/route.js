import { PrismaClient } from '@prisma/client'

// Este truco evita que se abran demasiadas conexiones en Vercel
const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export async function POST(request) {
  try {
    const { etapa, nivel } = await request.json()
    
    const plantilla = await prisma.plantillaPrompt.findFirst({
      where: { 
        etapa: etapa, 
        nivel: nivel,
        activo: true 
      }
    })

    if (!plantilla) {
      return new Response(JSON.stringify({ success: false, error: "Plantilla no encontrada" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data: plantilla }), {
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