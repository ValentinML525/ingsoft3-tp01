import * as yup from 'yup';
import prisma from '../../../lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { generarSlug } from '@/actions/funciones-globales/funciones-globales';
import { checkApiKey } from '@/lib/api-key';

interface OpcionesPaginacion {
  pagina?: number;
  take?: number;
}

const getUnidadesPaginadas = async ({
	pagina = 1,
	take = 5,
}: OpcionesPaginacion) => {
  if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

  try {
    const unidades = await prisma.unidad.findMany({
      include: {
        servicios: {
          include: {
            servicio: true 
          }
        }
      },
      take,
      skip: (pagina - 1) * take,
      orderBy: { nombre: 'asc' },
    });
    

    const totalUnidades = await prisma.unidad.count({});
    const cantidadPaginas = Math.ceil(totalUnidades / take);

    return {
      paginaActual: pagina,
      cantidadPaginas: cantidadPaginas,
      totalUnidades: totalUnidades,
      unidades,
    };
  } catch (error) {
    console.error('Error in getUnidadesPaginadas:', error);
    throw error;
  }
};


export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

  const url = new URL(request.url);
  const parametros = url.searchParams;
  const all = parametros.get('all') === 'true';
  const propiedadId = parametros.get('propiedadId') ? Number(parametros.get('propiedadId')) : undefined;

  // Modo: todas las unidades (para listados públicos)
  if (all) {
    try {
      const whereClause: any = { habilitada: true };
      if (propiedadId) whereClause.propiedadId = propiedadId;

      const unidades = await prisma.unidad.findMany({
        where: whereClause,
        include: {
          imagenes: true,
          propiedad: { select: { ubicacion: true, nombre: true, slug: true } },
          servicios: {
            include: { servicio: { select: { nombre: true, icon: true } } },
          },
        },
      });
      return NextResponse.json(unidades);
    } catch (error) {
      return NextResponse.json({ error: 'Error al obtener unidades' }, { status: 500 });
    }
  }

  // Modo: paginadas por propiedad
  if (propiedadId) {
    try {
      const pagina = Math.max(1, Number(parametros.get('pagina') ?? '1'));
      const take = Number(parametros.get('take') ?? '5');

      const unidades = await prisma.unidad.findMany({
        where: { propiedadId },
        include: {
          reservas: true,
          servicios: { include: { servicio: true } },
          imagenes: true,
        },
        take,
        skip: (pagina - 1) * take,
        orderBy: { id: 'asc' },
      });
      const totalUnidades = await prisma.unidad.count({ where: { propiedadId } });
      const cantidadPaginas = Math.ceil(totalUnidades / take);
      return NextResponse.json({ paginaActual: pagina, cantidadPaginas, totalUnidades, unidades });
    } catch (error) {
      return NextResponse.json({ error: 'Error al obtener unidades por propiedad' }, { status: 500 });
    }
  }

  const take = Number(parametros.get('take') ?? '5');
  const pagina = Number(parametros.get('pagina') ?? '1');

  if (isNaN(take)) {
    return NextResponse.json(
      { message: 'Take debe ser un número' },
      { status: 400 }
    );
  }

  if (isNaN(pagina)) {
    return NextResponse.json(
      { message: 'Página debe ser un número' },
      { status: 400 }
    );
  }

  try {
    const unidades = await getUnidadesPaginadas({ pagina, take });
    return NextResponse.json({ unidades });
  } catch (error) {
    if (error instanceof Error){   
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ocurrió un error desconocido' }, { status: 400 });
  }
}


let unidadSchema = yup.object({
  tipoUnidad: yup.string().required('Tipo de Unidad es requerido'),
  nombre: yup.string().required('Nombre es requerido'),
  capacidadMaxima: yup.number().positive().integer().required('Capacidad máxima es requerida'),
  servicios: yup.array().of(yup.string().required()).min(1, 'Debe seleccionar al menos un servicio').required('Servicios son requeridos'),
  precioPorNoche: yup.number().positive().optional(),
  imagenes: yup.array().of(yup.string().required()).min(1, 'Debe proporcionar al menos una imagen').required('Imagenes son requeridas'),
});


export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

  try {
    const unidad = await request.json();

  
    const unidadValidada = await unidadSchema.validate(unidad, {
      abortEarly: false,
    });

    const serviciosFiltrados = unidadValidada.servicios.filter(
      (servicio: string) => servicio !== undefined && servicio !== null
    );

    const imagenesFiltradas = unidadValidada.imagenes?.filter(
      (imagen) => typeof imagen == 'string' && imagen.trim().length > 0
    );


    const unidadCreada = await prisma.unidad.create({
      data: {
        nombre: unidadValidada.nombre,
        capacidad: unidadValidada.capacidadMaxima,
        precioPorNoche: unidadValidada.precioPorNoche ?? null,
        slug: generarSlug(unidadValidada.nombre),
        propiedadId: (unidad as any).propiedadId ?? 1,
        imagenes: {
          create: imagenesFiltradas?.map((url: string) => ({ url })) || [],
        },
      },
    });
    
    return NextResponse.json(unidadCreada);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear la unidad' }, { status: 400 });
  }

}
