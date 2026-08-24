'use client';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Tooltip,
} from '@/components/Client/MaterialTailwindClient';
import Image from 'next/image';
import { Unidad } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { IconoServicio } from '@/components/Servicios/IconoServicio';

export const TarjetaHorizontal = ({
    unidad,
    slugPropiedad,
    datosBusqueda,
}: {
    unidad: any;
    slugPropiedad?: string;
    datosBusqueda?: any;
    propiedadId?: number;
}) => {
    const router = useRouter();

    const handleDetallesClick = () => {
        const searchParams = new URLSearchParams(datosBusqueda);

        router.push(
            `/${slugPropiedad}/${unidad.slug}?${searchParams.toString()}`
        );
    };

    return (
        <Card className='w-full flex-row'>
            <CardHeader
                shadow={false}
                floated={false}
                className='m-0 w-2/5 shrink-0 rounded-r-none'
            >
                <div className='relative h-full w-full'>
                    {unidad.imagenes && unidad.imagenes.length > 0 ? (
                        <Image
                            src={unidad.imagenes[0].url}
                            alt='card-image'
                            fill
                            className='object-cover'
                        />
                    ) : (
                        <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black'>
                            No hay imágenes disponibles.
                        </p>
                    )}
                </div>
            </CardHeader>
            <CardBody className='p-2 sm:p-6 w-full'>
                <Typography
                    variant='h6'
                    color='gray'
                    className='mb-2 uppercase'
                >
                    Capacidad: {unidad.capacidad} Personas
                </Typography>
                <Typography variant='h4' color='blue-gray' className='mb-2'>
                    {unidad.nombre}
                </Typography>
                <div className='flex flex-col gap'>
                    {/* <Typography color='gray' className='font-normal'>
						Servicios:
					</Typography> */}
                    {unidad.precioPorNoche && (
                        <Typography color='gray' className='mb-2 font-normal'>
                            Precio: $ {unidad.precioPorNoche} / noche
                        </Typography>
                    )}
                </div>
                <div className='group mt-4 inline-flex flex-wrap items-center gap-3'>
                    {unidad.servicios &&
                        unidad.servicios.slice(0, 5).map((servicio: any, index: number) => (
                            <Tooltip
                                key={index}
                                content={
                                    <span className='text-md'>
                                        {servicio.servicio.nombre}
                                    </span>
                                }
                            >
                                <span className='cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 p-3 text-gray-900 transition-colors hover:border-gray-900/10 hover:bg-gray-900/10 hover:!opacity-100 group-hover:opacity-70'>
                                    <div className='w-6'>
                                        <IconoServicio
                                            svgString={servicio.servicio.icon}
                                        />
                                    </div>
                                </span>
                            </Tooltip>
                        ))}

                    {unidad.servicios && unidad.servicios.length > 5 && (
                        <Tooltip content={`${unidad.servicios.length - 5} más`}>
                            <span className='cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 p-3 text-gray-900 transition-colors hover:border-gray-900/10 hover:bg-gray-900/10 hover:!opacity-100 group-hover:opacity-70'>
                                +{unidad.servicios.length - 5}
                            </span>
                        </Tooltip>
                    )}
                </div>
                <div className='flex mt-2 justify-end'>
                    <Button
                        variant='text'
                        color='green'
                        className='flex gap-2'
                        onClick={handleDetallesClick}
                    >
                        Detalles
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={2}
                            className='h-4 w-4'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3'
                            />
                        </svg>
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};
