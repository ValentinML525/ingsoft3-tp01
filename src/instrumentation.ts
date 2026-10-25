// Next.js llama a register() al arrancar el servidor. Cada runtime carga su propia config de Sentry:
// la api y las server actions corren en Node; el middleware de NextAuth corre en edge.
export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('../sentry.server.config');
	}
	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('../sentry.edge.config');
	}
}
