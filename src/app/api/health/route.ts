import { NextResponse } from 'next/server';

// Sin esto Next.js renderiza la ruta UNA vez en el build y devuelve siempre ese JSON congelado.
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Healthcheck endpoint — usado por Docker y por el smoke test del pipeline.
 * Devuelve el commit que está corriendo: el pipeline lo hornea en la imagen (build-arg
 * GIT_COMMIT), así que sirve igual donde sea que se ejecute. RENDER_GIT_COMMIT queda sólo como
 * respaldo para un servicio que Render construya desde el repo. Así el smoke compara contra el
 * commit que verificó y no da verde contra la versión vieja.
 * No requiere API key.
 */
export async function GET() {
	return NextResponse.json({
		status: 'ok',
		commit: process.env.GIT_COMMIT ?? process.env.RENDER_GIT_COMMIT ?? 'desconocido',
		timestamp: new Date().toISOString(),
	});
}
