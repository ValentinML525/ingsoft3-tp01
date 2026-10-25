import { APIRequestContext, expect, test } from '@playwright/test';

// Pruebas de integración: la API desplegada con su base de verdad, sin navegador y sin dobles.
// La api tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:4000';
const headers = { 'x-api-key': process.env.BACKEND_API_KEY || '' };
const EMAIL = process.env.E2E_EMAIL || 'vmoyano@gmail.com';
const PASSWORD = process.env.E2E_PASSWORD || '123456';

// Una propiedad del usuario e2e: ningún id queda escrito en el código.
async function propiedadDelUsuario(request: APIRequestContext) {
	const login = await request.post(`${API}/api/auth/verify`, { headers, data: { email: EMAIL, password: PASSWORD } });
	expect(login.status()).toBe(200);
	const usuario = await login.json();
	const r = await request.get(`${API}/api/propiedades?all=true&usuarioId=${usuario.id}`, { headers });
	expect(r.status()).toBe(200);
	const propiedades = await r.json();
	expect(propiedades.length).toBeGreaterThan(0);
	return propiedades[0].id as number;
}

// Pide las unidades de la propiedad a la base y las devuelve ya convertidas.
async function listar(request: APIRequestContext, propiedadId: number) {
	const r = await request.get(`${API}/api/unidades?propiedadId=${propiedadId}&take=1000`, { headers });
	expect(r.status()).toBe(200);
	return (await r.json()).unidades as { id: number; nombre: string }[];
}

test('el alta guarda en la base de verdad, y el borrado la saca', async ({ request }) => {
	const propiedadId = await propiedadDelUsuario(request);
	const nombre = `api ${Date.now()}`; // único: no choca con otra corrida

	const alta = await request.put(`${API}/api/unidades/0`, {
		headers,
		data: { nombre, capacidad: 2, descripcion: 'creada por la integración', servicios: [], propiedadId },
	});
	expect(alta.status()).toBe(200);
	const creada = await alta.json();

	const lista = await listar(request, propiedadId); // y la BASE la devuelve: no es un doble
	expect(lista.some((u) => u.nombre === nombre)).toBe(true);

	const borrado = await request.delete(`${API}/api/unidades/${creada.id}`, { headers });
	expect(borrado.status()).toBe(200);

	const despues = await listar(request, propiedadId); // y el borrado, comprobado
	expect(despues.some((u) => u.nombre === nombre)).toBe(false);
});

test('un nombre vacío lo rechaza la api, y no crea nada', async ({ request }) => {
	const propiedadId = await propiedadDelUsuario(request);
	const antes = await listar(request, propiedadId);

	const alta = await request.put(`${API}/api/unidades/0`, {
		headers,
		data: { nombre: '', capacidad: 2, descripcion: 'x', servicios: [], propiedadId },
	});
	expect(alta.status()).toBe(400); // el contrato del error

	const despues = await listar(request, propiedadId);
	expect(despues.length).toBe(antes.length); // y de verdad no se creó nada
});

test('el login valida contra la base: acepta la clave correcta y rechaza la incorrecta', async ({ request }) => {
	const ok = await request.post(`${API}/api/auth/verify`, { headers, data: { email: EMAIL, password: PASSWORD } });
	expect(ok.status()).toBe(200);
	const usuario = await ok.json();
	expect(usuario.email).toBe(EMAIL); // el usuario sale de la base
	expect(usuario).not.toHaveProperty('password'); // y el hash nunca viaja

	const mal = await request.post(`${API}/api/auth/verify`, {
		headers,
		data: { email: EMAIL, password: `mala-${Date.now()}` },
	});
	expect(mal.status()).toBe(401);
});
