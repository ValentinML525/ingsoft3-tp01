import * as Sentry from '@sentry/nextjs';

// Acá el DSN SÍ va escrito en el código, y no es un descuido: el DSN de un front no es un secreto,
// sólo sirve para ENVIAR datos (no para leerlos) y viaja en el JavaScript que baja el navegador.
Sentry.init({
	dsn: 'https://PLACEHOLDER@o0.ingest.sentry.io/0',
	environment: window.location.hostname, // de qué sitio vino: QA, producción o localhost
	integrations: [Sentry.browserTracingIntegration()],
	tracesSampleRate: 1.0,
	// Sólo manda desde los sitios desplegados: en localhost y en los tests no ensucia el proyecto.
	enabled: window.location.hostname.endsWith('.onrender.com'),
});
