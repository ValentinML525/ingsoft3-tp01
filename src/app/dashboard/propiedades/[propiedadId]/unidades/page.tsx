import { getUnidadesPaginadasPorPropiedad } from '@/actions/unidades/unidades-paginadas';
import TablaUnidades from '@/components/Unidades/Tabla';
import { BotonAtras } from '@/app/commons/BotonAtras';
import { BotonRegistrarUnidad } from '@/components/Unidades/BotonRegistrarUnidad';

interface Props {
    searchParams: {
        pagina?: string;
    };
    params: {
        propiedadId: string;
    };
}

export default async function Unidades({ searchParams, params }: Props) {
    const pagina = searchParams.pagina ? parseInt(searchParams.pagina) : 1;
    const propiedadId = parseInt(params.propiedadId);

    const unidadesPaginadas = await getUnidadesPaginadasPorPropiedad({
        pagina,
        propiedadId,
    });

    const { unidades, cantidadPaginas, totalUnidades } = unidadesPaginadas;

    return (
        <>
            <div>
                <h1 className='text-3xl font-bold mb-6 text-left bg-light-green-600 text-white py-2 px-4 rounded shadow-lg'>
                    Unidades
                </h1>
                <div>
                    <BotonAtras />
                </div>

                <div className='flex w-full justify-center'>
                    <BotonRegistrarUnidad propiedadId={propiedadId} />
                </div>

                <TablaUnidades
                    unidades={unidades}
                    cantidadPaginas={cantidadPaginas}
                    totalUnidades={totalUnidades}
                />
            </div>
        </>
    );
}
