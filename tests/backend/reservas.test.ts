import { describe, it, expect, vi } from 'vitest';
import {
	determinarEstadoReserva,
	validarFechasReserva,
	validarCapacidadUnidad,
	hayConflictoFechas,
	ServicioReservas,
	IReservaRepository,
	NuevaReservaDTO,
} from '../../src/lib/reservas/reglas-reserva';
import { EstadoReserva } from '@prisma/client';

describe('Backend - Reglas de Negocio de Reservas', () => {
	// =========================================================================
	// REGLA 1: Determinación de estado según pagos (con Parametrizado y Error)
	// =========================================================================
	describe('Regla 1: determinarEstadoReserva', () => {
		// Técnica 1: Test parametrizado (equivalente a Theory / InlineData)
		it.each([
			{ pago: 0, total: 1000, esperado: EstadoReserva.PENDIENTE, desc: 'pago 0 asigna PENDIENTE' },
			{ pago: 400, total: 1000, esperado: EstadoReserva.PAGO_PARCIAL, desc: 'pago menor al total asigna PAGO_PARCIAL' },
			{ pago: 1000, total: 1000, esperado: EstadoReserva.PAGADA, desc: 'pago igual al total asigna PAGADA' },
		])('asigna correctamente el estado cuando $desc', ({ pago, total, esperado }) => {
			// Arrange
			const parametros = { pagoParcial: pago, precioTotal: total };

			// Act
			const estado = determinarEstadoReserva(parametros);

			// Assert
			expect(estado).toBe(esperado);
		});

		// Técnica 2: Caso de error / borde - Pago parcial mayor al precio total
		it('lanza un error si el pago parcial supera el precio total', () => {
			// Arrange
			const parametros = { pagoParcial: 1500, precioTotal: 1000 };

			// Act & Assert
			expect(() => determinarEstadoReserva(parametros)).toThrow(
				'El pago parcial no puede exceder el precio total'
			);
		});

		// Técnica 2 (cont): Caso de error - Pago parcial negativo
		it('lanza un error si el pago parcial es un valor negativo', () => {
			// Arrange
			const parametros = { pagoParcial: -100, precioTotal: 1000 };

			// Act & Assert
			expect(() => determinarEstadoReserva(parametros)).toThrow(
				'El pago parcial no puede ser negativo'
			);
		});

		// Caso de error: Precio total inválido <= 0
		it('lanza un error si el precio total es menor o igual a cero', () => {
			// Arrange
			const parametros = { pagoParcial: 0, precioTotal: 0 };

			// Act & Assert
			expect(() => determinarEstadoReserva(parametros)).toThrow(
				'El precio total debe ser mayor a 0'
			);
		});

		// Caso de borde: Preserva estado CANCELADA sin importar pagos posteriores
		it('preserva el estado CANCELADA aunque se registre pago total', () => {
			// Arrange
			const parametros = {
				pagoParcial: 1000,
				precioTotal: 1000,
				estadoActual: EstadoReserva.CANCELADA,
			};

			// Act
			const estado = determinarEstadoReserva(parametros);

			// Assert
			expect(estado).toBe(EstadoReserva.CANCELADA);
		});
	});

	// =========================================================================
	// REGLA 2: Validación de fechas y cálculo de noches (con Caso de Error)
	// =========================================================================
	describe('Regla 2: validarFechasReserva', () => {
		it('calcula la cantidad exacta de noches para un rango válido', () => {
			// Arrange
			const inicio = new Date('2026-11-01T14:00:00Z');
			const fin = new Date('2026-11-05T10:00:00Z');

			// Act
			const resultado = validarFechasReserva(inicio, fin);

			// Assert
			expect(resultado.esValida).toBe(true);
			expect(resultado.noches).toBe(3);
		});

		// Caso de error: Rango cronológico invertido
		it('rechaza la reserva si la fecha de fin es anterior o igual a la fecha de inicio', () => {
			// Arrange
			const inicio = new Date('2026-11-10T12:00:00Z');
			const fin = new Date('2026-11-08T12:00:00Z');

			// Act
			const resultado = validarFechasReserva(inicio, fin);

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
		});

		// Caso de error: Fecha en formato inválido
		it('rechaza la reserva si las fechas ingresadas no son válidas', () => {
			// Arrange & Act
			const resultado = validarFechasReserva('invalido', '2026-11-08');

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toBe('Las fechas ingresadas son inválidas');
		});

		// Caso de error: Menos de una noche (mismo día)
		it('rechaza la reserva si dura menos de 1 noche', () => {
			// Arrange
			const inicio = new Date('2026-11-01T10:00:00Z');
			const fin = new Date('2026-11-01T18:00:00Z');

			// Act
			const resultado = validarFechasReserva(inicio, fin);

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toBe('La reserva debe ser de al menos 1 noche');
		});
	});

	// =========================================================================
	// REGLA 3: Validación de capacidad de huéspedes (con Caso de Error)
	// =========================================================================
	describe('Regla 3: validarCapacidadUnidad', () => {
		it('acepta la reserva si la cantidad de huéspedes no supera la capacidad máxima', () => {
			// Arrange
			const huespedes = 4;
			const capacidad = 4;

			// Act
			const resultado = validarCapacidadUnidad(huespedes, capacidad);

			// Assert
			expect(resultado.esValida).toBe(true);
		});

		// Caso de error: Exceso de capacidad permitida
		it('rechaza la reserva si la cantidad de huéspedes excede la capacidad de la unidad', () => {
			// Arrange
			const huespedes = 6;
			const capacidad = 4;

			// Act
			const resultado = validarCapacidadUnidad(huespedes, capacidad);

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toContain('excede la capacidad máxima');
		});

		// Caso de error: Cantidad de personas <= 0 o no entero
		it('rechaza si la cantidad de personas es menor o igual a cero', () => {
			// Arrange & Act
			const resultado = validarCapacidadUnidad(0, 4);

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toBe('La cantidad de personas debe ser un número entero positivo');
		});

		// Caso de error: Capacidad máxima inválida
		it('rechaza si la capacidad máxima de la unidad es menor o igual a cero', () => {
			// Arrange & Act
			const resultado = validarCapacidadUnidad(2, 0);

			// Assert
			expect(resultado.esValida).toBe(false);
			expect(resultado.error).toBe('La capacidad máxima de la unidad debe ser mayor a 0');
		});
	});

	// =========================================================================
	// REGLA 4: Detección de solapamiento cronológico
	// =========================================================================
	describe('Regla 4: hayConflictoFechas', () => {
		it('detecta conflicto cuando dos reservas se solapan en fechas', () => {
			// Arrange
			const reservaExistente = {
				inicio: new Date('2026-12-10T00:00:00Z'),
				fin: new Date('2026-12-15T00:00:00Z'),
			};
			const nuevaReserva = {
				inicio: new Date('2026-12-12T00:00:00Z'),
				fin: new Date('2026-12-18T00:00:00Z'),
			};

			// Act
			const conflicto = hayConflictoFechas(nuevaReserva, reservaExistente);

			// Assert
			expect(conflicto).toBe(true);
		});
	});

	// =========================================================================
	// TÉCNICA 3: Tests con Mocks (Inyección de Dependencias sobre Servicio)
	// =========================================================================
	describe('ServicioReservas con Doble de Prueba (Mock)', () => {
		it('registra la reserva llamando al repositorio si no existen conflictos', async () => {
			// Arrange: Doble de riesgo (Mock) que simula el repositorio de base de datos
			const mockRepo: IReservaRepository = {
				buscarConflicto: vi.fn().mockResolvedValue(false),
				crearReserva: vi.fn().mockResolvedValue({ id: 101, estado: EstadoReserva.PAGADA }),
			};
			const servicio = new ServicioReservas(mockRepo);

			const dto: NuevaReservaDTO = {
				unidadId: 1,
				clienteId: 5,
				fechaInicio: '2026-12-01T00:00:00Z',
				fechaFin: '2026-12-05T00:00:00Z',
				cantidadPersonas: 2,
				capacidadMaxima: 4,
				precioTotal: 800,
				pagoParcial: 800,
			};

			// Act
			const resultado = await servicio.registrarReserva(dto);

			// Assert: Verificamos la interacción con el mock
			expect(mockRepo.buscarConflicto).toHaveBeenCalledTimes(1);
			expect(mockRepo.buscarConflicto).toHaveBeenCalledWith(
				1,
				new Date('2026-12-01T00:00:00Z'),
				new Date('2026-12-05T00:00:00Z')
			);
			expect(mockRepo.crearReserva).toHaveBeenCalledTimes(1);
			expect(resultado).toEqual({ id: 101, estado: EstadoReserva.PAGADA });
		});

		it('aborta la creación y NO llama a crearReserva si el repositorio reporta conflicto', async () => {
			// Arrange: El mock simula que la base de datos ya tiene una reserva en ese rango
			const mockRepo: IReservaRepository = {
				buscarConflicto: vi.fn().mockResolvedValue(true),
				crearReserva: vi.fn(),
			};
			const servicio = new ServicioReservas(mockRepo);

			const dto: NuevaReservaDTO = {
				unidadId: 1,
				clienteId: 5,
				fechaInicio: '2026-12-01T00:00:00Z',
				fechaFin: '2026-12-05T00:00:00Z',
				cantidadPersonas: 2,
				capacidadMaxima: 4,
				precioTotal: 800,
			};

			// Act & Assert
			await expect(servicio.registrarReserva(dto)).rejects.toThrow(
				'Existe una reserva en conflicto para las fechas seleccionadas'
			);

			// Assert de interacción: asegurar que NUNCA se persistió la reserva
			expect(mockRepo.buscarConflicto).toHaveBeenCalledTimes(1);
			expect(mockRepo.crearReserva).not.toHaveBeenCalled();
		});

		it('aborta y no toca el repositorio si las fechas son inválidas', async () => {
			const mockRepo: IReservaRepository = {
				buscarConflicto: vi.fn(),
				crearReserva: vi.fn(),
			};
			const servicio = new ServicioReservas(mockRepo);

			const dto: NuevaReservaDTO = {
				unidadId: 1,
				clienteId: 5,
				fechaInicio: '2026-12-05T00:00:00Z',
				fechaFin: '2026-12-01T00:00:00Z',
				cantidadPersonas: 2,
				capacidadMaxima: 4,
				precioTotal: 800,
			};

			await expect(servicio.registrarReserva(dto)).rejects.toThrow();
			expect(mockRepo.buscarConflicto).not.toHaveBeenCalled();
			expect(mockRepo.crearReserva).not.toHaveBeenCalled();
		});

		it('aborta y no toca el repositorio si la capacidad es excedida', async () => {
			const mockRepo: IReservaRepository = {
				buscarConflicto: vi.fn(),
				crearReserva: vi.fn(),
			};
			const servicio = new ServicioReservas(mockRepo);

			const dto: NuevaReservaDTO = {
				unidadId: 1,
				clienteId: 5,
				fechaInicio: '2026-12-01T00:00:00Z',
				fechaFin: '2026-12-05T00:00:00Z',
				cantidadPersonas: 10,
				capacidadMaxima: 4,
				precioTotal: 800,
			};

			await expect(servicio.registrarReserva(dto)).rejects.toThrow();
			expect(mockRepo.buscarConflicto).not.toHaveBeenCalled();
			expect(mockRepo.crearReserva).not.toHaveBeenCalled();
		});
	});
});
