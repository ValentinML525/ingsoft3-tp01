'use client';
import { Suspense } from 'react';
import Image from 'next/image';
import Foto from '/public/Foto.jpg';
import { NavbarBusqueda } from '@/components/Navbar/NavbarBusqueda';
import { Logo } from '@/app/commons/Logo';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const buscar = async (datos: any) => {
        try {
            const parametros: Record<string, string> = {
                fechaInicio: datos.rangoFechas?.from ? new Date(datos.rangoFechas.from).toISOString() : '',
                fechaFin: datos.rangoFechas?.to ? new Date(datos.rangoFechas.to).toISOString() : '',
                cantidadPersonas: String(datos.cantidadPersonas || ''),
                ubicacionId: String(datos.ubicacionId || ''),
            };

            const parametrosAEnviar = new URLSearchParams(parametros);

            router.push(`/resultados?${parametrosAEnviar.toString()}`);
        } catch (error) {
            console.log('====================================');
            console.log('Error al buscar unidades: ', error);
            console.log('====================================');
        }
    };

    return (
        <section className='relative flex flex-col items-center justify-start h-screen bg-gray-800'>
            <Image
                src={Foto}
                alt='Hero Image'
                layout='fill'
                objectFit='cover'
                className='absolute inset-0 z-0'
            />

            <div className='relative z-10 flex mt-40 items-center mb-20 bg-opacity-70 justify-center bg-white rounded-full'>
                <Logo lado={200} />
            </div>

            <div className='relative z-10 text-white'>
                <Suspense fallback={<div>Cargando...</div>}>
                    <NavbarBusqueda mostrarLogo={false} accionAEjecutar={buscar} />
                </Suspense>
            </div>
        </section>
    );
}
