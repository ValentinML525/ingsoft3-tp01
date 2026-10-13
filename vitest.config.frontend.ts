import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		include: ['tests/frontend/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov', 'json-summary'],
			reportsDirectory: process.env.COVERAGE_DIR || 'coverage/frontend',
			include: [
				'src/actions/funciones-globales/**/*.ts',
				'src/lib/validaciones-usuario.ts',
				'src/actions/auth/register.ts',
			],
			exclude: ['**/*.d.ts'],
			thresholds: {
				lines: 80,
				branches: 80,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
