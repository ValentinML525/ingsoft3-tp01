import { GET } from '../app/api/seed/route';

async function main() {
	console.log('Seeding database...');
	const res = await GET({} as any);
	const data = await res.json();
	console.log('Seed completed successfully:', data);
}

main().catch((err) => {
	console.error('Seed error:', err);
	process.exit(1);
});
