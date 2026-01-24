import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  console.log("Nueva consulta recibida para prompts_v2");
  try {
    const body = await request.json();
    const { fase, rama, etapa, hechos, regimen } = body;

    // Buscamos en el modelo PlantillaPrompt (que ahora apunta a prompts_v2)
    const plantilla = await prisma.plantillaPrompt.findFirst({
      where: {
        faseId: parseInt(fase),
        rama: rama,
        etapa: etapa,
        activo: true
      }
    });

    if (!plantilla) {
      return NextResponse.json({ 
        success: false, 
        error: "No se encontró una plantilla para esta fase." 
      }, { status: 404 });
    }

    // ENSAMBLAJE: Aquí unimos la base de la DB con los hechos del usuario
    const promptFinal = `
${plantilla.promptSistema}

TAREA:
${plantilla.bloqueTarea}

RÉGIMEN SELECCIONADO: ${regimen}
HECHOS DEL CASO:
"${hechos}"

MARCO LEGAL DE REFERENCIA:
${plantilla.bloqueDerecho}

IMPORTANTE: Responde en formato profesional, citando la base legal proporcionada.
    `.trim();

    return NextResponse.json({
      success: true,
      data: {
        bloqueTarea: promptFinal, // Enviamos el prompt ya armado
        bloqueDerecho: plantilla.bloqueDerecho
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}