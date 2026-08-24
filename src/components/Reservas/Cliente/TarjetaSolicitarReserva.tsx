'use client';
import { Logo } from '@/app/commons/Logo';
import { InputCantPersonas } from '../../../app/commons/Forms/InputCantPersonas';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Checkbox,
    Button,
    Chip,
} from '../../Client/MaterialTailwindClient';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';

import { CustomDatePicker } from '@/app/commons/Forms/CustomDatePicker';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verificarDisponibilidad } from '@/actions/reservas/reservas';
import { getUnidadPorSlug } from '@/actions/unidades/unidades';
import { calcularCantidadNoches } from '@/actions/funciones-globales/funciones-globales';
import { FaExclamationCircle, FaMoon } from 'react-icons/fa';

type Inputs = {
    rangoFechas: Date[];
    cantidadPersonas: number;
};

export function TarjetaSolicitarReserva({ slugPropiedad, slugUnidad }: { slugPropiedad?: any; slugUnidad?: any }) {
    const [estaDisponible, setEstaDisponible] = useState(true);
    const [capacidadSuperada, setCapacidadSuperada] = useState(false);
    const [unidad, setUnidad] = useState<any>();
    const [cantidadNoches, setCantidadNoches] = useState(0);

    const router = useRouter();

    const searchParams = useSearchParams();

    const unidadId = searchParams.get('unidadId');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    //Atencion, cantPersonas viene por parametro y cantidadPersonas viene del input
    const cantPersonas = searchParams.get('cantPersonas');

    const methods = useForm<any>({
        defaultValues: {
            cantidadPersonas: 0,
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    const cantidadPersonas = watch('cantidadPersonas');

    useEffect(() => {
        const fetchUnidad = async () => {
            const result = await getUnidadPorSlug(slugUnidad);
            setUnidad(result);
        };

        if (fechaInicio && fechaFin && cantPersonas && +cantPersonas > 0) {
            setValue('rangoFechas', {
                from: new Date(fechaInicio),
                to: new Date(fechaFin),
            });
            setValue('cantidadPersonas', +cantPersonas);
            const cantNoches = calcularCantidadNoches(fechaInicio, fechaFin);
            setCantidadNoches(cantNoches);
        }

        fetchUnidad();
    }, []);

    const onSubmit = async (data: any) => {
        const datosForm = {
            unidadId: unidad?.id || '',
            fechaInicio: data.rangoFechas?.from || data.rangoFechas?.[0] || '',
            fechaFin: data.rangoFechas?.to || data.rangoFechas?.[1] || '',
            cantPersonas: String(data.cantidadPersonas || 1),
        };

        try {
            const parametrosAEnviar = new URLSearchParams(datosForm);
            router.push(
                `/${slugPropiedad}/${slugUnidad}/confirmacion?${parametrosAEnviar.toString()}`
            );
        } catch (error) {
            console.log('====================================');
            console.log('Error al buscar unidades: ', error);
            console.log('====================================');
        }
    };

    const onFechasSeleccionadas = async (fechas: any) => {
        if (fechas?.from && fechas?.to && fechas?.from < fechas?.to) {
            const disponible = await verificarDisponibilidad(
                +unidad.id,
                fechas.from,
                fechas.to
            );
            setEstaDisponible(disponible);

            const cantNoches = calcularCantidadNoches(fechas?.from, fechas?.to);
            setCantidadNoches(cantNoches);
        }
        setValue('rangoFechas', fechas);
    };

    const onCambioCantPersonas = (cantPersonas: any) => {
        if (cantPersonas > unidad?.capacidad) {
            setCapacidadSuperada(true);
        } else {
            setCapacidadSuperada(false);
            setValue('cantidadPersonas', cantPersonas);
        }
    };

    return (
        <>
            <Card className='w-96 items-center'>
                <Logo lado={150} />
                <FormProvider {...methods}>
                    <form
                        className='flex flex-col w-full gap-4'
                        onSubmit={methods.handleSubmit(onSubmit)}
                    >
                        <CardBody className='flex flex-col w-full gap-4'>
                            <CustomDatePicker
                                mostrarPasados={false}
                                handleFechasSeleccionadas={
                                    onFechasSeleccionadas
                                }
                            />
                            <InputCantPersonas
                                handleCambioCantPersonas={onCambioCantPersonas}
                            />
                            {capacidadSuperada && (
                                <p className='text-red-500'>
                                    La capacidad máxima es de{' '}
                                    {unidad?.capacidad} personas.
                                </p>
                            )}
                            {cantidadNoches > 0 && (
                                <Chip
                                    className='w-fit text-md'
                                    size='lg'
                                    value={`${cantidadNoches} Noches`}
                                    icon={
                                        <FaMoon className='relative top-1 left-1' />
                                    }
                                />
                            )}
                            {unidad?.precioPorNoche > 0 &&
                                cantidadNoches > 0 && (
                                    <Chip
                                        className='w-fit text-md'
                                        color='light-green'
                                        variant='ghost'
                                        size='lg'
                                        value={`Total: $ ${(
                                            unidad.precioPorNoche *
                                            cantidadNoches
                                        ).toLocaleString('es-AR')}`}
                                    />
                                )}

                            {!estaDisponible && (
                                <div className='text-red-500'>
                                    <Chip
                                        className='w-fit text-wrap'
                                        color='red'
                                        variant='ghost'
                                        size='sm'
                                        icon={
                                            <FaExclamationCircle className='relative top-1 left-0.5' />
                                        }
                                        value='La Unidad no se encuentra disponible en las fechas seleccionadas.'
                                    />
                                </div>
                            )}
                        </CardBody>
                        <CardFooter className='pt-0'>
                            {unidad?.precioPorNoche ? (
                                <Button
                                    type='submit'
                                    variant='gradient'
                                    color='light-green'
                                    fullWidth
                                    disabled={
                                        !estaDisponible ||
                                        cantidadNoches < 1 ||
                                        cantidadPersonas < 1
                                    }
                                >
                                    Reservar
                                </Button>
                            ) : (
                                <div>
                                    <Button
                                        type='submit'
                                        variant='gradient'
                                        color='light-green'
                                        fullWidth
                                        disabled={
                                            !estaDisponible ||
                                            cantidadNoches < 1 ||
                                            cantidadPersonas < 1
                                        }
                                    >
                                        Solicitar Presupuesto
                                    </Button>
                                    <Typography
                                        variant='small'
                                        className='mt-6 flex justify-center'
                                    >
                                        El precio de esta unidad no se encuentra
                                        disponible.
                                    </Typography>
                                </div>
                            )}
                        </CardFooter>
                    </form>
                </FormProvider>
            </Card>
        </>
    );
}
