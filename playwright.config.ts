import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e', // recoge los DOS archivos; cada job del pipeline corre el suyo por nombre
	timeout: 60_000, // tope de CADA test: generoso por el cold start del free tier
	expect: { timeout: 15_000 }, // tope de CADA aserción (el default es 5 s)
	use: {
		// El FRONT. La api tiene la suya: API_BASE_URL, que lee api.spec.ts
		baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
		trace: 'on-first-retry', // la traza se graba en el retry de un fallo
		screenshot: 'only-on-failure',
	},
	retries: 1, // 1 retry: absorbe una demora suelta; si un test pasa recién ahí, sale «flaky»
	reporter: [['html', { open: 'never' }], ['list']],
});
