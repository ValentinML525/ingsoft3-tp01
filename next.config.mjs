/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
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

export default nextConfig;
