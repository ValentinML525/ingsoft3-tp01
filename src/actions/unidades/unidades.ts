'use server';

import prisma from '@/lib/prisma';
import { EstadoReserva, Unidad, Propiedad } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { generarSlug } from '../funciones-globales/funciones-globales';
import { verificarDisponibilidad } from '../reservas/reservas';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';

interface NuevaUnidad {
    id?: number;
    nombre: string;
    capacidad: number;
    descripcion: string;
    servicios: number[];
    imagenes?: { nombre: string; data: string }[];
    precioPorNoche?: number;
    propiedadId?: number;
}

//TODO: filtrar habilitadas OK
export const getUnidadesPorPropiedad = async (propiedadId: number) => {
    try {
        const unidades = await prisma.unidad.findMany({
            where: {
                propiedadId: +propiedadId,
                habilitada: true,
            },

            include: {
                imagenes: true,
                servicios: {
                    include: {
                        servicio: {
                            select: {
                                nombre: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });
        return unidades;
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Error al obtener las unidades');
    }
};

//TODO: filtrar habilitadas OK
export const getAllUnidades = async () => {
    try {
        const unidades = await prisma.unidad.findMany({
            where: {
                habilitada: true,
            },
            include: {
                propiedad: {
                    select: {
                        ubicacion: true,
                        nombre: true,
                        slug: true,
                    },
                },
                imagenes: true,
                servicios: {
                    include: {
                        servicio: {
                            select: {
                                nombre: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });

        return unidades;
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Error al obtener las unidades');
    }
};

//TODO: filtrar habilitadas OK
export const getUnidadesDisponiblesPorUbicacion = async (
    ubicacionId: number,
    cantidadPersonas: number,
    fechaInicio: Date,
    fechaFin: Date
): Promise<Unidad[]> => {
    try {
        const unidadesPosibles = await prisma.unidad.findMany({
            where: {
                capacidad: {
                    gte: +cantidadPersonas,
                },
                habilitada: true,

                ...(ubicacionId > 0 && {
                    propiedad: {
                        ubicacionId: ubicacionId,
                    },
                }),
            },
            include: {
                imagenes: true,
                servicios: {
                    include: {
                        servicio: {
                            select: {
                                nombre: true,
                                icon: true,
                            },
                        },
                    },
                },
                propiedad: {
                    include: {
                        ubicacion: {
                            select: {
                                ciudad: true,
                            },
                        },
                    },
                },
            },
        });

        const unidadesLibres = await filtrarUnidadesDisponibles(
            unidadesPosibles,
            fechaInicio,
            fechaFin
        );

        return unidadesLibres;
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Error al obtener las unidades');
        return [];
    }
};

//TODO: filtrar habilitadas OK
export const getUnidadesDisponiblesPorPropiedad = async (
    propiedadId: number,
    cantPersonas: number,
    fechaInicio: Date,
    fechaFin: Date
): Promise<Unidad[]> => {
    try {
        console.log('cantPersonas:', cantPersonas);
        const unidadesPosibles = await prisma.unidad.findMany({
            where: {
                propiedadId: propiedadId,
                capacidad: {
                    gte: +cantPersonas,
                },
                habilitada: true,
            },
            include: {
                imagenes: true,
                servicios: {
                    include: {
                        servicio: {
                            select: {
                                nombre: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });

        const unidadesLibres = filtrarUnidadesDisponibles(
            unidadesPosibles,
            fechaInicio,
            fechaFin
        );

        return unidadesLibres;
    } catch (error) {
        throw new Error('Error al obtener las unidades');
        return [];
    }
};

const filtrarUnidadesDisponibles = async (
    unidadesPosibles: any[],
    fechaInicio: Date | string,
    fechaFin: Date | string
) => {
    const disponibilidadUnidades = await Promise.all(
        unidadesPosibles.map(async (unidad: any) => {
            const disponible = await verificarDisponibilidad(
                unidad.id,
                new Date(fechaInicio),
                new Date(fechaFin)
            );
            return { ...unidad, disponible };
        })
    );

    const unidadesLibres = disponibilidadUnidades.filter(
        (unidad: any) => unidad.disponible
    );

    return unidadesLibres;
};

export const getUnidadPorId = async (unidadId: number) => {
    try {
        const unidadConUbicacion = await prisma.unidad.findUnique({
            where: { id: +unidadId },
            include: {
                imagenes: true,
                propiedad: {
                    include: {
                        ubicacion: {
                            select: {
                                ciudad: true,
                            },
                        },
                    },
                },
            },
        });

        if (!unidadConUbicacion) {
            throw new Error('Unidad no encontrada');
        }

        return unidadConUbicacion;
    } catch (error) {
        console.error('Error al obtener la unidad:', error);

        // Return a custom error message or throw the error to be handled elsewhere
        throw new Error(
            'Error al obtener la unidad. Inténtelo de nuevo más tarde.'
        );
    }
};

//TODO: filtrar habilitadas OK
export const getUnidadPorSlug = async (slug: string) => {
    // const normalizedSlug = slug.trim().toLowerCase();
    try {
        const unidadConServicios = await prisma.unidad.findFirst({
            where: {
                slug: slug,
                habilitada: true,
            },
            include: {
                propiedad: {
                    include: {
                        ubicacion: true,
                    },
                },
                imagenes: true,
                servicios: {
                    include: {
                        servicio: {
                            select: {
                                nombre: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });

        if (!unidadConServicios) {
            throw new Error('No se encontró la unidad.');
        }

        return unidadConServicios;
    } catch (error) {
        redirect('/resultados');
        console.log('Error: ', error);
        throw new Error('Error al obtener la unidad.');
    }
};

export const getNombrePropiedadPorUnidadId = async (unidadId: number) => {
    try {
        const unidad = await prisma.unidad.findUnique({
            where: {
                id: +unidadId,
            },
            include: {
                propiedad: {
                    select: {
                        nombre: true,
                    },
                },
            },
        });

        if (!unidad || !unidad.propiedad) {
            throw new Error(
                'No se encontró la unidad o la propiedad asociada.'
            );
        }

        return unidad.propiedad.nombre;
    } catch (error) {
        console.error('Error al obtener el nombre de la propiedad:', error);
        throw new Error('Error al obtener el nombre de la propiedad.');
    }
};

export const insertarUnidad = async (unidad: NuevaUnidad) => {
    try {
        const slugUnidad = generarSlug(unidad.nombre);
        console.log('====================================');
        console.log('Nase unidad: ', unidad);
        console.log('====================================');
        const direccionImagen: string[] = [];
        if (unidad.imagenes && unidad.imagenes.length > 0) {
            unidad.imagenes.forEach((imagen) => {
                const imagenPath = path.join(
                    process.cwd(),
                    'public/imagenes',
                    imagen.nombre
                );
                fs.writeFileSync(
                    imagenPath,
                    Buffer.from(imagen.data, 'base64')
                );
                direccionImagen.push('/imagenes/' + imagen.nombre);
            });
        } else {
            console.log('====================================');
            console.log('Nase unidad: ', unidad);
            console.log('====================================');
            await prisma.unidad.upsert({
                where: { id: unidad.id || -1 },
                update: {
                    nombre: unidad.nombre,
                    slug: slugUnidad,
                    capacidad: unidad.capacidad,
                    descripcion: unidad.descripcion,

                    precioPorNoche:
                        unidad.precioPorNoche && unidad.precioPorNoche > 0
                            ? unidad.precioPorNoche
                            : null,

                    servicios: {
                        deleteMany: {},
                        create: unidad.servicios.map((servicioId) => ({
                            servicioId: +servicioId,
                        })),
                    },
                },
                create: {
                    nombre: unidad.nombre,
                    slug: slugUnidad,
                    capacidad: unidad.capacidad,
                    descripcion: unidad.descripcion,
                    precioPorNoche:
                        unidad.precioPorNoche && unidad.precioPorNoche > 0
                            ? unidad.precioPorNoche
                            : null,

                    propiedad: {
                        connect: { id: +(unidad.propiedadId || 0) },
                    },

                    servicios: {
                        create: unidad.servicios.map((servicioId) => ({
                            servicioId: +servicioId,
                        })),
                    },
                },
            });

            revalidatePath('/dashboard/propiedades/[propiedadId]/unidades');
            return unidad;
        }

        await prisma.unidad.upsert({
            where: { id: unidad.id || -1 },
            update: {
                nombre: unidad.nombre,
                slug: slugUnidad,
                capacidad: unidad.capacidad,
                descripcion: unidad.descripcion,

                precioPorNoche:
                    unidad.precioPorNoche && unidad.precioPorNoche > 0 ? unidad.precioPorNoche : null,

                servicios: {
                    deleteMany: {},
                    create: unidad.servicios.map((servicioId) => ({
                        servicioId: +servicioId,
                    })),
                },
                imagenes: {
                    deleteMany: {},
                    create: direccionImagen.map((path) => ({ url: path })),
                },
            },
            create: {
                nombre: unidad.nombre,
                slug: slugUnidad,
                capacidad: unidad.capacidad,
                descripcion: unidad.descripcion,
                precioPorNoche:
                    unidad.precioPorNoche && unidad.precioPorNoche > 0 ? unidad.precioPorNoche : null,

                propiedad: {
                    connect: { id: +(unidad.propiedadId || 0) },
                },

                servicios: {
                    create: unidad.servicios.map((servicioId) => ({
                        servicioId: +servicioId,
                    })),
                },
                imagenes: {
                    create: direccionImagen.map((path) => ({ url: path })),
                },
            },
        });

        revalidatePath('/dashboard/propiedades/[propiedadId]/unidades');

        return unidad;
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
};

export const eliminarUnidad = async (unidad: any) => {
    try {
        const unidadEliminada = await prisma.unidad.delete({
            where: { id: unidad.id },
        });

        console.log('Unidad Eliminada: ', unidadEliminada);
        return true;
    } catch (error) {
        console.log('Error al borrar unidad: ', error);
        return false;
    }
};
export const actualizarEstadoUnidad = async (
    unidadId: number,
    habilitada: boolean
) => {
    try {
        await prisma.unidad.update({
            where: { id: unidadId },
            data: { habilitada },
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la unidad:', error);
    }
};

export const EliminarImagen = async (unidadId: number, urlNombre: string) => {
    console.log('Entrooooooooooooooooooooooooooooooooooo');
    try {
        const result = await prisma.imagen.deleteMany({
            where: {
                unidadId: unidadId,
                url: urlNombre,
            },
        });
        console.log('Imagen eliminada correctamente.');
    } catch (error) {
        console.error('Error al borrar imagen de la unidad:', error);
    }
};
