import prisma from '@/lib/prisma';
import Tabla from '../../../components/Reservas/Tabla';
import { BotonRegistrarReserva } from '../../../components/Reservas/BotonRegistrarReserva';
import { getReservasPaginadas } from '../../../actions/reservas/reservas-paginadas';
import { TabsReservas } from './TabsReservas';
import { getAllPropiedades } from '@/actions/propiedades/propiedades';

export const metadata = {
    title: 'Reservas',
    description: 'Reservas',
};

interface Props {
    searchParams: {
        pagina?: string;
    };
}

export default async function Reservas() {
    const propiedades = await getAllPropiedades();
    return (
        <div className="">
            <h1 className="text-3xl font-bold mb-6 text-left bg-light-green-600 text-white py-2 px-4 rounded shadow-lg">
                Reservas
            </h1>
            <div className="flex flex-col items-center justify-start w-full h-full">
                <BotonRegistrarReserva />
                <div className="flex w-full">
                    <TabsReservas propiedades={propiedades} />
                </div>
            </div>
        </div>
    );
}
