import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	experimental: {
		instrumentationHook: true, // Next 14 no carga src/instrumentation.ts sin esto
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'tailus.io',
			},
			{
				protocol: 'https',
				hostname: 'www.altolasflores.com.ar',
			},
			{
				protocol: 'https',
				hostname: 'cf2.bstatic.com',
			},
		],
	},
};

// Sin token de Sentry no se suben source maps; el build no depende de la red de Sentry.
export default withSentryConfig(nextConfig, {
	silent: true,
	telemetry: false,
	sourcemaps: { disable: true },
});
