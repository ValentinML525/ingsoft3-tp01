'use server';
import { auth } from '@/auth.config';
import prisma from '@/lib/prisma';
import { Propiedad, TipoPropiedad } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { generarSlug } from '../funciones-globales/funciones-globales';

export const getAllPropiedades = async () => {
    const session = await auth();

    try {
        const propiedades = await prisma.propiedad.findMany({
            where: { usuarioId: session?.user.id },
            include: {
                ubicacion: true,
                tipo: true,
                unidades: true,
            },
        });

        return propiedades;
    } catch (error) {
        throw new Error('Error al obtener las propiedades');
    }
};

export const getPropiedadPorSlug = async (slug: string) => {
    // const normalizedSlug = slug.trim().toLowerCase();
    try {
        const propiedad = await prisma.propiedad.findFirst({
            where: {
                slug: slug,
            },
            include: {
                ubicacion: true,
                tipo: true,
            },
        });

        if (!propiedad) {
            throw new Error('No se encontró la propiedad');
        }

        return propiedad;
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Error al obtener la propiedad.');
    }
};

export const getAllTiposPropiedad = async () => {
    try {
        const tiposPropiedad = await prisma.tipoPropiedad.findMany({});

        return tiposPropiedad;
    } catch (error) {
        throw new Error('Error al obtener los tipos de propiedad');
    }
};

export const upsertPropiedad = async (propiedad: any) => {
    const session = await auth();
    try {
        const slugPropiedad = generarSlug(propiedad.nombre);
        const propiedadUpserted = await prisma.propiedad.upsert({
            where: { id: propiedad.id || 0 },
            update: {
                nombre: propiedad.nombre,
                slug: slugPropiedad,
                telefonoContacto: propiedad.telefonoContacto,
                tipo: {
                    connect: { id: propiedad.tipoPropiedadId },
                },
                ubicacion: {
                    upsert: {
                        create: {
                            direccion: propiedad.ubicacion.direccion,
                            latitud: propiedad.ubicacion.latitud,
                            longitud: propiedad.ubicacion.longitud,
                            ciudad: propiedad.ubicacion.ciudad,
                            provincia: propiedad.ubicacion.provincia,
                        },
                        update: {
                            direccion: propiedad.ubicacion.direccion,
                            latitud: propiedad.ubicacion.latitud,
                            longitud: propiedad.ubicacion.longitud,
                            ciudad: propiedad.ubicacion.ciudad,
                            provincia: propiedad.ubicacion.provincia,
                        },
                    },
                },
                usuario: {
                    connect: { id: session?.user.id },
                },
            },
            create: {
                nombre: propiedad.nombre,
                slug: slugPropiedad,
                telefonoContacto: propiedad.telefonoContacto,
                tipo: {
                    connect: { id: propiedad.tipoPropiedadId },
                },
                ubicacion: {
                    create: {
                        direccion: propiedad.ubicacion.direccion,
                        latitud: propiedad.ubicacion.latitud,
                        longitud: propiedad.ubicacion.longitud,
                        ciudad: propiedad.ubicacion.ciudad,
                        provincia: propiedad.ubicacion.provincia,
                    },
                },
                usuario: {
                    connect: { id: session?.user.id },
                },
            },
        });

        revalidatePath('/dashboard/propiedades');

        return propiedadUpserted;
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
};

export const eliminarPropiedad = async (id: number) => {
    const session = await auth();
    try {
        const propiedad = await prisma.propiedad.findUnique({
            where: { id },
        });

        if (!propiedad || propiedad.usuarioId !== session?.user.id) {
            throw new Error(
                'No se encontró la propiedad o no tiene permisos para eliminarla'
            );
        }

        await prisma.propiedad.delete({
            where: { id },
        });

        await prisma.ubicacion.deleteMany({
            where: { id: propiedad.ubicacionId },
        });

        revalidatePath('/dashboard/propiedades');

        return true;
    } catch (error) {
        throw new Error(`Error al eliminar la propiedad: ${error}`);
        return false;
    }
};
