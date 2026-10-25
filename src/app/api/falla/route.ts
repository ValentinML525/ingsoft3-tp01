// TEMPORAL (TP9 §3.5): endpoint que falla a propósito para ver un error llegar a Sentry.
// Se saca del repo al terminar el práctico.
export const dynamic = 'force-dynamic';

export async function GET() {
	throw new Error('Falla de prueba del TP9');
}
