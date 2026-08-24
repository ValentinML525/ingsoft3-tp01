import { Metadata } from 'next';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Reserva Creada',
    description: 'Se creó la reserva',
};

//TODO: esta pagina puede ser un componente
interface Props {
    params: {
        slugPropiedad: string;
        slugUnidad: string;
    };
}

export default async function Confirmacion({ params }: Props) {
    return (
        <>
            <div className='flex flex-col w-full items-center p-20 gap-10'>
                <FaCheckCircle size={100} className='text-verdeClaro' />
                <h1 className='text-3xl font-bold text-gray-800'>Se realizó la reserva.</h1>
                <p className='text-xl text-gray-600 text-center'>
                    Por favor, continúe la gestión directamente con el
                    propietario.
                </p>
                <Link href='/'>
                    <button className='bg-light-green-500 hover:bg-light-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors'>
                        Volver al Inicio
                    </button>
                </Link>
            </div>
        </>
    );
}
