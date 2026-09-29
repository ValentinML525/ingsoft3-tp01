/**
 * Tipos locales del dominio de la aplicación.
 * Reemplazan los tipos generados por Prisma en el frontend,
 * ya que el frontend no tiene acceso a @prisma/client en runtime.
 */

export enum EstadoReserva {
	SOLICITADA = 'SOLICITADA',
	PENDIENTE = 'PENDIENTE',
	PAGO_PARCIAL = 'PAGO_PARCIAL',
	PAGADA = 'PAGADA',
	CANCELADA = 'CANCELADA',
}

export enum Role {
	Administrador = 'Administrador',
	Propietario = 'Propietario',
	Usuario = 'Usuario',
}

export interface Ubicacion {
	id: number;
	direccion: string;
	latitud: number;
	longitud: number;
	ciudad: string;
	provincia: string;
}

export interface TipoPropiedad {
	id: number;
	nombre: string;
	descripcion: string;
	contieneMultiplesUnidades: boolean;
}

export interface Propiedad {
	id: number;
	nombre: string;
	ubicacionId: number;
	tipoPropiedadId: number;
	usuarioId: string;
	telefonoContacto: string;
	slug: string;
	ubicacion?: Ubicacion;
	tipo?: TipoPropiedad;
	unidades?: Unidad[];
}

export interface Servicio {
	id: number;
	nombre: string;
	icon: string;
}

export interface ServiciosXUnidad {
	unidadId: number;
	servicioId: number;
	servicio?: Servicio;
}

export interface Imagen {
	id: number;
	url: string;
	unidadId: number;
}

export interface Unidad {
	id: number;
	nombre: string;
	capacidad: number;
	precioPorNoche?: number | null;
	propiedadId: number;
	slug: string;
	descripcion?: string | null;
	habilitada: boolean;
	imagenes?: Imagen[];
	servicios?: ServiciosXUnidad[];
	propiedad?: Propiedad;
	reservas?: Reserva[];
}

export interface Cliente {
	id: number;
	nombre: string;
	telefono: string;
	email?: string | null;
}

export interface Reserva {
	id: string;
	fechaInicio: Date | string;
	fechaFin: Date | string;
	cantidadPersonas: number;
	precioTotal?: number | null;
	estado: EstadoReserva;
	pagoParcial?: number | null;
	observaciones?: string | null;
	unidadId: number;
	clienteId: number;
	fechaHoraCreacion: Date | string;
	fechaActualizacion: Date | string;
	cliente?: Cliente;
	unidad?: Unidad;
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified?: Date | null;
	role: Role;
	image?: string | null;
}
