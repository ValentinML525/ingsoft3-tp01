import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	generarSlug,
	calcularCantidadNoches,
	prioridadDeReserva,
	clasificarTipoEstadia,
} from '../../src/actions/funciones-globales/funciones-globales';
import { validarDatosRegistro } from '../../src/lib/validaciones-usuario';
import { registerUser } from '../../src/actions/auth/register';

describe('Frontend - Lógica y Cliente de Servicios', () => {
	// =========================================================================
	// TÉCNICA 1: Test Parametrizado (it.each / test.each)
	// =========================================================================
	describe('generarSlug (Lógica Pura - Parametrizado)', () => {
		it.each([
			{ input: 'Cabaña en Las Sierras', esperado: 'cabana-en-las-sierras', desc: 'remueve tildes y eñes' },
			{ input: 'Depto  2  Ambientes   Centro', esperado: 'depto-2-ambientes-centro', desc: 'normaliza espacios múltiples' },
			{ input: '¡Habitación Premium #1!', esperado: 'habitacion-premium-1', desc: 'elimina signos y caracteres especiales' },
			{ input: 'CASA DEL LAGO', esperado: 'casa-del-lago', desc: 'convierte a minúsculas' },
		])('transforma correctamente "$input" a slug ($desc)', ({ input, esperado }) => {
			// Arrange & Act
			const resultado = generarSlug(input);

			// Assert
			expect(resultado).toBe(esperado);
		});
	});

	describe('calcularCantidadNoches (Frontend Helper)', () => {
		it('calcula correctamente la cantidad de noches entre dos fechas', () => {
			// Arrange
			const inicio = '2026-11-01';
			const fin = '2026-11-05';

			// Act
			const noches = calcularCantidadNoches(inicio, fin);

			// Assert
			expect(noches).toBe(4);
		});
	});

	describe('prioridadDeReserva (Lógica de Anticipación)', () => {
		it.each([
			{ dias: -2, esperado: 'invalida', desc: 'días negativos retorna invalida' },
			{ dias: 0, esperado: 'urgente', desc: 'mismo día retorna urgente' },
			{ dias: 1, esperado: 'urgente', desc: '1 día retorna urgente' },
			{ dias: 5, esperado: 'alta', desc: 'menos de 7 días retorna alta' },
			{ dias: 20, esperado: 'media', desc: 'menos de 30 días retorna media' },
			{ dias: 60, esperado: 'baja', desc: 'más de 30 días retorna baja' },
		])('asigna prioridad "$esperado" para $dias días ($desc)', ({ dias, esperado }) => {
			expect(prioridadDeReserva(dias)).toBe(esperado);
		});
	});

	describe('clasificarTipoEstadia (Lógica de Duración)', () => {
		it.each([
			{ noches: 0, esperado: 'invalida', desc: '0 noches retorna invalida' },
			{ noches: 1, esperado: 'escapada', desc: '1 noche retorna escapada' },
			{ noches: 3, esperado: 'fin-de-semana', desc: 'hasta 4 noches retorna fin-de-semana' },
			{ noches: 10, esperado: 'quincena', desc: 'hasta 14 noches retorna quincena' },
			{ noches: 20, esperado: 'larga-estadia', desc: 'más de 14 noches retorna larga-estadia' },
		])('clasifica como "$esperado" para $noches noches ($desc)', ({ noches, esperado }) => {
			expect(clasificarTipoEstadia(noches)).toBe(esperado);
		});
	});

	// =========================================================================
	// TÉCNICA 2: Casos de Error y Validación de Entradas
	// =========================================================================
	describe('validarDatosRegistro (Validaciones de Entrada)', () => {
		it('valida exitosamente cuando todos los campos cumplen el formato requerido', () => {
			// Arrange
			const datos = {
				name: 'Juan Perez',
				email: 'juan.perez@example.com',
				password: 'passwordSegura123',
			};

			// Act
			const resultado = validarDatosRegistro(datos);

			// Assert
			expect(resultado.esValido).toBe(true);
			expect(resultado.errores).toHaveLength(0);
		});

		// Caso de error: Nombre vacío o menor a 2 caracteres
		it('rechaza si el nombre está vacío o tiene menos de 2 caracteres', () => {
			// Arrange
			const datos = {
				name: 'J',
				email: 'juan@example.com',
				password: 'password123',
			};

			// Act
			const resultado = validarDatosRegistro(datos);

			// Assert
			expect(resultado.esValido).toBe(false);
			expect(resultado.errores).toContain('El nombre debe tener al menos 2 caracteres');
		});

		// Caso de error: Email mal formado
		it('detecta y rechaza un formato de email inválido', () => {
			// Arrange
			const datos = {
				name: 'Juan Perez',
				email: 'correo-sin-arroba-ni-dominio',
				password: 'password123',
			};

			// Act
			const resultado = validarDatosRegistro(datos);

			// Assert
			expect(resultado.esValido).toBe(false);
			expect(resultado.errores).toContain('El email ingresado no es válido');
		});

		// Caso de error: Contraseña demasiado corta (borde < 6)
		it('rechaza una contraseña con longitud menor a 6 caracteres', () => {
			// Arrange
			const datos = {
				name: 'Juan Perez',
				email: 'juan@example.com',
				password: '12345',
			};

			// Act
			const resultado = validarDatosRegistro(datos);

			// Assert
			expect(resultado.esValido).toBe(false);
			expect(resultado.errores).toContain('La contraseña debe tener al menos 6 caracteres');
		});
	});

	// =========================================================================
	// TÉCNICA 3: Test con Mock (Doble de riesgo para llamada HTTP a API)
	// =========================================================================
	describe('registerUser (Cliente API con Mock de red)', () => {
		const originalFetch = globalThis.fetch;

		beforeEach(() => {
			process.env.BACKEND_URL = 'http://localhost:4000';
			process.env.BACKEND_API_KEY = 'test-secret-key';
		});

		afterEach(() => {
			globalThis.fetch = originalFetch;
			vi.restoreAllMocks();
		});

		it('ejecuta fetch hacia el endpoint de backend con headers y payload correctos', async () => {
			// Arrange: Doble de prueba para evitar salir a la red
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({
					ok: true,
					user: { id: 'usr-1', name: 'Valentin', email: 'valentin@test.com' },
					message: 'Usuario creado',
				}),
			});
			globalThis.fetch = mockFetch;

			// Act
			const respuesta = await registerUser('Valentin', 'valentin@test.com', 'secreto123');

			// Assert: Verificamos interacción con el doble
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:4000/api/auth/register',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'x-api-key': 'test-secret-key',
					}),
					body: JSON.stringify({
						name: 'Valentin',
						email: 'valentin@test.com',
						password: 'secreto123',
					}),
				})
			);

			// Verificamos el resultado devuelto al componente
			expect(respuesta.ok).toBe(true);
			expect(respuesta.user?.id).toBe('usr-1');
		});

		it('maneja la respuesta de error 409 cuando el backend rechaza email duplicado', async () => {
			// Arrange: Simula rechazo del backend
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 409,
				json: async () => ({
					ok: false,
					message: 'El email ya está registrado',
				}),
			});
			globalThis.fetch = mockFetch;

			// Act
			const respuesta = await registerUser('Valentin', 'repetido@test.com', 'secreto123');

			// Assert
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(respuesta.ok).toBe(false);
			expect(respuesta.message).toBe('El email ya está registrado');
		});

		it('utiliza mensaje por defecto si la respuesta de error no incluye message', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => ({}),
			});
			globalThis.fetch = mockFetch;

			const respuesta = await registerUser('Valentin', 'err@test.com', 'secreto123');

			expect(respuesta.ok).toBe(false);
			expect(respuesta.message).toBe('No se pudo crear el usuario');
		});

		it('captura fallos de conectividad de red y retorna mensaje amigable', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Conexión rechazada'));
			globalThis.fetch = mockFetch;

			const respuesta = await registerUser('Valentin', 'valentin@test.com', 'secreto123');

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(respuesta.ok).toBe(false);
			expect(respuesta.message).toContain('No se pudo conectar con el servidor');
		});

		it('utiliza URL por defecto cuando BACKEND_URL y NEXT_PUBLIC_API_URL no están definidos', async () => {
			delete process.env.BACKEND_URL;
			delete process.env.NEXT_PUBLIC_API_URL;

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ ok: true, user: { id: 'usr-2' } }),
			});
			globalThis.fetch = mockFetch;

			await registerUser('Valentin', 'val@test.com', 'secreto123');

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:4000/api/auth/register',
				expect.anything()
			);
		});
	});
});
