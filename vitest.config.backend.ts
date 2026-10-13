import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		include: ['tests/backend/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov', 'json-summary'],
			reportsDirectory: process.env.COVERAGE_DIR || 'coverage/backend',
			include: ['src/lib/reservas/**/*.ts'],
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
