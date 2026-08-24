import type { Config } from 'tailwindcss';

const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontSize: { display: 'text-lg' },
			colors: {
				verdeOscuro: '#2D4A1A',
				verdeIntermedio: '#699B2C',
				verdeClaro: '#B8CE69',
				oscuro: '#151C15',
				marron: '#7D5244',
				naranja: '#FF944C',
			},
		},
	},
}) as Config;
