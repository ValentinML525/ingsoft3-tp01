import { BotonAtras } from '@/app/commons/BotonAtras';

import { TarjetaSimple } from '@/app/commons/TarjetaSimple';
import { TarjetaDatosReserva } from '../../../../../components/Reservas/Cliente/TarjetaDatosReserva';
import { FormConfirmarReserva } from '@/components/Reservas/Cliente/FormConfirmarReserva';

interface Props {
    params: {
        slugPropiedad: string;
        slugUnidad: string;
    };
}

export default async function Confirmacion({ params }: Props) {
    const { slugPropiedad, slugUnidad } = params;
    return (
        <>
            <div className='flex flex-col w-full items-center'>
                <div className='flex flex-row w-full'>
                    <div className='w-1/2'>
                        <BotonAtras />
                    </div>
                    <div className='w-1/2'></div>
                </div>
                <div className='flex flex-col w-full lg:flex-row xl:w-2/3 justify-center gap-10'>
                    <div className='flex flex-col gap-10 order-2 lg:w-1/2 lg:order-1'>
                        <div>
                            <TarjetaSimple />
                        </div>
                        <div>
                            <FormConfirmarReserva params={params} />
                        </div>
                    </div>
                    <div className='lg:w-1/2 order-1 lg:order-2'>
                        <div>
                            <TarjetaDatosReserva />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
