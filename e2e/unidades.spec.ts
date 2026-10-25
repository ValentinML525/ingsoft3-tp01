import { expect, Page, test } from '@playwright/test';

// e2e: un navegador de verdad usando el front desplegado, que a su vez le habla a la api y a la base.
const EMAIL = process.env.E2E_EMAIL || 'vmoyano@gmail.com';
const PASSWORD = process.env.E2E_PASSWORD || '123456';

async function ingresar(page: Page, password = PASSWORD) {
	await page.goto('/auth/login');
	await page.getByLabel('Correo electrónico').fill(EMAIL);
	await page.getByLabel('Contraseña').fill(password);
	await page.getByRole('button', { name: 'Ingresar' }).click();
}

// Entra y abre las unidades de la primera propiedad del usuario.
async function irAUnidades(page: Page) {
	await ingresar(page);
	await expect(page).toHaveURL(/\/dashboard/);
	await page.goto('/dashboard/propiedades');
	await page.getByRole('button', { name: /^Ver unidades de / }).first().click();
	await expect(page.getByRole('button', { name: 'Registrar Unidad' })).toBeVisible();
}

// La tabla está paginada y lo nuevo cae en la última página: se recarga y se va hasta ahí,
// así lo que se afirma es lo que el servidor devuelve y no un estado a medio refrescar.
async function irALaUltimaPagina(page: Page) {
	await page.reload();
	await expect(page.getByRole('button', { name: 'Registrar Unidad' })).toBeVisible();
	const hrefs = await page.locator('a[href*="pagina="]').evaluateAll((as) => as.map((a) => a.getAttribute('href') || ''));
	const numero = (h: string) => Number(new URL(h, 'http://x').searchParams.get('pagina'));
	const ultima = hrefs.sort((x, y) => numero(y) - numero(x))[0];
	if (ultima) {
		await page.goto(ultima);
	}
}

test('crear una unidad la muestra en la lista, y borrarla la saca', async ({ page }) => {
	await irAUnidades(page);
	const nombre = `e2e ${Date.now()}`; // único: no choca con otra corrida

	await page.getByRole('button', { name: 'Registrar Unidad' }).click();
	await page.getByLabel('Nombre de la unidad').fill(nombre);
	await page.getByLabel('Capacidad de la unidad').fill('3');
	await page.getByLabel('Descripción de la unidad').fill('creada por el e2e');
	await page.getByRole('button', { name: 'Registrar', exact: true }).click();
	await page.getByRole('button', { name: 'Aceptar' }).click();
	await irALaUltimaPagina(page);
	await expect(page.getByText(nombre)).toBeVisible(); // el dato que ESTE test creó, sin sleeps

	await page.getByRole('button', { name: `Eliminar ${nombre}` }).click();
	await page.getByRole('button', { name: 'Confirmar' }).click();
	await page.getByRole('button', { name: 'Aceptar' }).click();
	await irALaUltimaPagina(page);
	await expect(page.getByText(nombre)).toHaveCount(0); // y el borrado, comprobado
});

test('una unidad sin capacidad muestra el error y no crea nada', async ({ page }) => {
	await irAUnidades(page);
	const nombre = `e2e invalida ${Date.now()}`;

	await page.getByRole('button', { name: 'Registrar Unidad' }).click();
	await page.getByLabel('Nombre de la unidad').fill(nombre);
	await page.getByLabel('Descripción de la unidad').fill('sin capacidad');
	await page.getByRole('button', { name: 'Registrar', exact: true }).click();
	await expect(page.getByRole('alert').filter({ hasText: 'obligatorio' })).toBeVisible(); // el usuario ve el error…

	await page.getByRole('button', { name: 'Registrar', exact: true }).waitFor({ state: 'visible' });
	await page.keyboard.press('Escape'); // …cierra el formulario…
	await irALaUltimaPagina(page);
	await expect(page.getByText(nombre)).toHaveCount(0); // …y en la lista no apareció nada
});

test('el login: una clave incorrecta muestra el error, la correcta entra y ve sus propiedades', async ({ page }) => {
	await ingresar(page, `mala-${Date.now()}`);
	// (Next.js también marca con role=alert su anunciador de rutas: se filtra por el texto)
	await expect(page.getByRole('alert').filter({ hasText: 'Usuario o contraseña incorrecta' })).toBeVisible();
	await expect(page).toHaveURL(/\/auth\/login/);

	await ingresar(page);
	await expect(page).toHaveURL(/\/dashboard/);
	await page.goto('/dashboard/propiedades');
	await expect(page.getByRole('button', { name: /^Ver unidades de / }).first()).toBeVisible(); // viene de la base
});
