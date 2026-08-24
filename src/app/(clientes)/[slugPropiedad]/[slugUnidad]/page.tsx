import { redirect, useSearchParams } from 'next/navigation';
import { getUnidadPorSlug } from '@/actions/unidades/unidades';
import { BotonAtras } from '@/app/commons/BotonAtras';
import { BreadcrumbsCliente } from '@/app/commons/BreadcrumbsCliente';
import { TarjetaSolicitarReserva } from '@/components/Reservas/Cliente/TarjetaSolicitarReserva';
import { DescripcionUnidad } from '@/components/Unidades/Cliente/DescripcionUnidad';
import { Galeria } from '@/components/Unidades/Cliente/Galeria';
import { getPropiedadPorSlug } from '@/actions/propiedades/propiedades';

interface Props {
    params: {
        slugPropiedad: string;
        slugUnidad: string;
    };
}

export default async function Unidad({ params }: Props) {
    const { slugPropiedad, slugUnidad } = params;

    const propiedad = await getPropiedadPorSlug(slugPropiedad);

    const unidad = await getUnidadPorSlug(slugUnidad);
    if (!unidad) {
        redirect('/resultados');
    }

    //Parametros para Breadcrumbs (links y nombreSeccionActual)
    const links = [
        {
            titulo: `${propiedad?.nombre}`,
            url: `/${slugPropiedad}`,
        },
    ];

    const nombreSeccionActual = `${unidad.nombre}`;

    return (
        <div className='flex flex-col items-center gap-10'>
            <div className='w-full xl:w-3/4 gap-10'>
                <div>
                    <BotonAtras />
                </div>
                <div className='mt-5'>
                    <Galeria imagenes={unidad.imagenes} />
                </div>
                <div className='my-5'>
                    <BreadcrumbsCliente
                        links={links}
                        nombreSeccionActual={nombreSeccionActual}
                    />
                </div>
                <div className='flex flex-col md:flex-row gap-10 '>
                    <div className=''>
                        <DescripcionUnidad unidad={unidad} />
                    </div>
                    <div className='flex justify-center mb-10 h-fit'>
                        <TarjetaSolicitarReserva
                            slugPropiedad={slugPropiedad}
                            slugUnidad={slugUnidad}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
