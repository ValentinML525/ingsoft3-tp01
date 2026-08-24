'use client';

import {
    Navbar,
    Typography,
    IconButton,
    Button,
    Select,
    Option,
} from '../Client/MaterialTailwindClient';

import { CustomDatePicker } from '../../app/commons/Forms/CustomDatePicker';
import { InputCantPersonas } from '../../app/commons/Forms/InputCantPersonas';
import { Logo } from '../../app/commons/Logo';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { getUbicaciones } from '@/actions/ubicaciones/ubicaciones';
import { FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

type Inputs = {
    rangoFechas: Date[];
    cantidadPersonas: number;
    ubicacionId: number;
};

interface Props {
    mostrarLogo?: boolean;
    ubicacion?: any;
    accionAEjecutar?: (datos: any) => Promise<void> | void;
}

export const NavbarBusqueda = forwardRef<any, Props>(
    ({ mostrarLogo = true, ubicacion, accionAEjecutar }, ref) => {
        const [ubicaciones, setUbicaciones] = useState<any[]>([]);
        const [mostrarUbicaciones, setMostrarUbicaciones] = useState(false);

        const searchParams = useSearchParams();

        const methods = useForm<any>({
            defaultValues: {
                cantidadPersonas: '',
            },
        });

        const {
            handleSubmit,
            register,
            reset,
            watch,
            setValue,
            getValues,
            formState: { errors },
        } = methods;

        useImperativeHandle(ref, () => ({
            resetForm: () => reset(),
        }));

        //TODO: filtrar ubicaciones de unidades habilitadas
        useEffect(() => {
            const buscarUbicaciones = async () => {
                const ubicaciones = await getUbicaciones();
                setUbicaciones(ubicaciones);
            };

            if (!ubicacion) {
                setMostrarUbicaciones(true);
                buscarUbicaciones();
            }
        }, []);

        //Cuando se navega desde la pantalla principal, cargar datos de busqueda
        useEffect(() => {
            if (ubicaciones.length > 0 && searchParams) {
                const ubicacionId = searchParams.get('ubicacionId');
                const fechaInicio = searchParams.get('fechaInicio');
                const fechaFin = searchParams.get('fechaFin');
                let rango = null;

                if (fechaInicio && fechaFin) {
                    rango = {
                        from: new Date(fechaInicio).toISOString(),
                        to: new Date(fechaFin).toISOString(),
                    };
                }

                const cantidadPersonas = searchParams.get('cantidadPersonas');

                reset({
                    cantidadPersonas: cantidadPersonas,
                    ubicacionId: ubicacionId ? +ubicacionId : undefined,
                    rangoFechas: rango,
                });
            }
        }, [ubicaciones, searchParams, reset]);

        const onSubmit: SubmitHandler<Inputs> = async (data) => {
            const datosBusqueda = {
                rangoFechas: data.rangoFechas,
                cantidadPersonas: +data.cantidadPersonas,
                ubicacionId: +data.ubicacionId,
            };

            try {
                if (accionAEjecutar) await accionAEjecutar(datosBusqueda);
            } catch (error) {
                console.log('Error al ejecutar accion desde Navbar');
            }
        };

        const onFechasSeleccionadas = (fechas: any) => {
            setValue('rangoFechas', fechas);
        };

        const onCambioCantPersonas = (cantPersonas: any) => {
            setValue('cantidadPersonas', cantPersonas);
        };

        const handleUbicacionSeleccionada = (ubicacionId: any) => {
            setValue('ubicacionId', ubicacionId);
        };

        return (
            <Navbar className='sticky top-10 z-10 h-max mx-auto max-w-screen-xl px-6 py-3 mb-10'>
                <div className='flex flex-col w-full md:flex-row items-center md:gap-10 text-blue-gray-900'>
                    {mostrarLogo && (
                        <div className='flex flex-row items-center justify-center md:justify-start w-full md:w-1/5'>
                            <div>
                                <Logo lado={70} />
                            </div>
                            <div>
                                <Typography
                                    as='a'
                                    href='../'
                                    variant='h6'
                                    className='cursor-pointer'
                                >
                                    SERRAHOME
                                </Typography>
                            </div>
                        </div>
                    )}
                    <div className='flex w-full'>
                        <FormProvider {...methods}>
                            <form
                                className='flex w-full'
                                onSubmit={methods.handleSubmit(onSubmit)}
                            >
                                <div className='flex flex-col w-full gap-5 md:flex-row md:justify-end'>
                                    {ubicaciones.length > 0 && (
                                        <div className='w-full'>
                                            <Select
                                                variant='standard'
                                                color='light-green'
                                                label='Ubicación'
                                                error={!!errors.ubicacionId}
                                                value={getValues('ubicacionId')}
                                                disabled={ubicacion}
                                                {...register('ubicacionId')}
                                                onChange={
                                                    handleUbicacionSeleccionada
                                                }
                                            >
                                                {/* <Option
													value={0}
													color='light-green'
													className='text-start'
												>
													Cualquiera
												</Option> */}
                                                {ubicaciones.map(
                                                    (ubicacion, index) => (
                                                        <Option
                                                            key={index}
                                                            value={ubicacion.id}
                                                            color='light-green'
                                                            className='text-start'
                                                        >
                                                            {ubicacion.ciudad}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </div>
                                    )}
                                    <div className='flex w-full'>
                                        <CustomDatePicker
                                            mostrarPasados={false}
                                            handleFechasSeleccionadas={
                                                onFechasSeleccionadas
                                            }
                                        />
                                    </div>
                                    <div className='flex flex-row gap-4 justify-between items-center md:justify-end'>
                                        <div className=''>
                                            <InputCantPersonas
                                                handleCambioCantPersonas={
                                                    onCambioCantPersonas
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type='submit'
                                                color='light-green'
                                                className='flex items-center p-3 gap-2'
                                            >
                                                <FaSearch size={20} />
                                                Buscar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </Navbar>
        );
    }
);

NavbarBusqueda.displayName = 'NavbarBusqueda';
