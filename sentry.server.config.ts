import * as Sentry from '@sentry/nextjs';

// El DSN llega por el entorno (SENTRY_DSN en Render). Sin la variable el SDK queda apagado:
// en local, en los tests, en QA y en preprod no se manda nada.
Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
	tracesSampleRate: 1.0, // medir todos los pedidos
});
