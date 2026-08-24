'use client';
import { useState, useEffect } from 'react';

import {
    useForm,
    Controller,
    SubmitHandler,
    FormProvider,
} from 'react-hook-form';

import {
    FaDollarSign,
    FaExclamationCircle,
    FaExclamationTriangle,
    FaWindowClose,
} from 'react-icons/fa';

import {
    cancelarReserva,
    insertarReserva,
} from '../../actions/reservas/reservas';

import { getAllPropiedades } from '@/actions/propiedades/propiedades';

import {
    getUnidadesDisponiblesPorPropiedad,
    getUnidadesPorPropiedad,
    getUnidadPorId,
} from '@/actions/unidades/unidades';

import { CustomDatePicker } from '../../app/commons/Forms/CustomDatePicker';

import {
    Button,
    Dialog,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Checkbox,
    Select,
    Option,
    Textarea,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Tooltip,
} from '../Client/MaterialTailwindClient';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';
import { DialogExito } from '../../app/commons/Dialogs/DialogExito';
import { InputCantPersonas } from '../../app/commons/Forms/InputCantPersonas';

type Inputs = {
    nombre: string;
    telefono: string;
    email: string;
    rangoFechas: Date[];
    cantidadPersonas: number;
    propiedadId: number;
    unidadId: number;
    precioTotal: number;
    pagoParcial: number;
    observaciones: string;
};

export const FormReserva = ({
    isOpen,
    setIsOpen,
    reservaAEditar,
    isFromCalendario = false,
    refrescar,
}: any) => {
    const [isMounted, setIsMounted] = useState(false);
    const [propiedades, setPropiedades] = useState<any>();
    const [unidades, setUnidades] = useState<any>();
    const [fechaInicio, setFechaInicio] = useState(
        isFromCalendario ? reservaAEditar?.fechaInicio : null
    );
    const [fechaFin, setFechaFin] = useState(
        isFromCalendario ? reservaAEditar?.fechaFin : null
    );
    const [
        mostrarMensajeSinDisponibilidad,
        setMostrarMensajeSinDisponibilidad,
    ] = useState(false);

    const [deshabilitarCamposEdicion, setDeshabilitarCamposEdicion] =
        useState(false);

    const [mostrarAdvertenciaCancelacion, setMostrarAdvertenciaCancelacion] =
        useState(false);
    const [mostrarDialogExito, setMostrarDialogExito] = useState(false);

    const [cancelandoReserva, setCancelandoReserva] = useState(false);
    const [guardandoReserva, setGuardandoReserva] = useState(false);

    const router = useRouter();

    const methods = useForm<any>({
        defaultValues: {
            rangoFechas: [],
        },
    });
    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = methods;
    const hasErrors = Object.keys(errors).length > 0;

    const propiedadId = watch('propiedadId');
    const rangoFechas = watch('rangoFechas');
    const cantidadPersonas = watch('cantidadPersonas');
    const precioTotal = watch('precioTotal');

    useEffect(() => {
        const buscarPropiedades = async () => {
            try {
                const response = await getAllPropiedades();
                setPropiedades(response);

                setIsMounted(true);
            } catch (error) {
                console.error('Error buscando propiedades: ', error);
            }
        };

        if (reservaAEditar?.cliente) {
            reset({
                nombre: reservaAEditar.cliente.nombre,
                telefono: reservaAEditar.cliente.telefono,
                email: reservaAEditar.cliente.email,
                cantidadPersonas: reservaAEditar.cantidadPersonas,
                propiedadId: reservaAEditar.propiedadId,
                unidadId: reservaAEditar.unidadId,
                precioTotal: reservaAEditar.precioTotal,
                pagoParcial: reservaAEditar.pagoParcial,
                observaciones: reservaAEditar.observaciones,
                rangoFechas: {
                    from: reservaAEditar.fechaInicio,
                    to: reservaAEditar.fechaFin,
                },
            });

            handlePropiedadSeleccionada(reservaAEditar.propiedadId);
        } else if (reservaAEditar?.fechaInicio && reservaAEditar?.fechaFin) {
            reset({
                rangoFechas: [
                    reservaAEditar.fechaInicio,
                    reservaAEditar.fechaFin,
                ],
            });

            setValue('rangoFechas', { from: fechaInicio, to: fechaFin });
        }

        buscarPropiedades();
    }, [reservaAEditar]);

    useEffect(() => {
        const getAllUnidades = async () => {
            try {
                if (reservaAEditar?.propiedadId) {
                    const unidades = await getUnidadesPorPropiedad(
                        reservaAEditar.propiedadId
                    );
                    setUnidades(unidades);
                    setDeshabilitarCamposEdicion(true);
                } else {
                    setUnidades([]);
                }
            } catch (error) {
                console.error('Error buscando la unidad: ', error);
            }
        };

        const filtrarUnidades = async () => {
            const unidadesDisponibles =
                await getUnidadesDisponiblesPorPropiedad(
                    +propiedadId,
                    cantidadPersonas,
                    rangoFechas.from,
                    rangoFechas.to
                );

            if (unidadesDisponibles && unidadesDisponibles.length === 0) {
                setMostrarMensajeSinDisponibilidad(true);
                setUnidades([]);
            } else {
                setMostrarMensajeSinDisponibilidad(false);
                setUnidades(unidadesDisponibles);
            }
        };

        if (propiedades && !unidades) {
            getAllUnidades();
        }

        if (
            !reservaAEditar?.cliente &&
            propiedadId > 0 &&
            cantidadPersonas > 0 &&
            rangoFechas?.from &&
            rangoFechas?.to
        ) {
            filtrarUnidades();
        }
    }, [propiedadId, propiedades, cantidadPersonas, rangoFechas]);

    useEffect(() => {
        if (unidades && reservaAEditar?.unidadId) {
            setValue('unidadId', reservaAEditar.unidadId);
        }
    }, [unidades]);

    const handlePropiedadSeleccionada = (val: any) => {
        setValue('propiedadId', val);
    };

    const handleUnidadSeleccionada = (val: any) => {
        setValue('unidadId', val);
    };

    const onSubmit = async (data: any) => {
        setGuardandoReserva(true);
        const fechaInicio = new Date(data.rangoFechas.from).toISOString();
        const fechaFin = new Date(data.rangoFechas.to).toISOString();

        const reserva = {
            id: reservaAEditar?.id,
            precioTotal: +data.precioTotal,
            cantidadPersonas: +data.cantidadPersonas,
            pagoParcial: +data.pagoParcial,
            fechaInicio: data.rangoFechas.from,
            fechaFin: data.rangoFechas.to,
            unidadId: +data.unidadId,
            observaciones: data.observaciones,
        };

        const cliente = {
            id: reservaAEditar?.clienteId,
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.email,
        };
        await insertarReserva(reserva, cliente);
        setGuardandoReserva(false);

        setMostrarDialogExito(true);
    };

    const finalizarOperacion = () => {
        if (refrescar) {
            refrescar();
        }
        setIsOpen(false);
        reset();
    };

    const onFechasSeleccionadas = (fechas: any) => {
        setValue('rangoFechas', {
            from: new Date(fechas.from),
            to: new Date(fechas.to),
        });
    };

    const handleOpen = () => {
        if (mostrarAdvertenciaCancelacion) {
            return;
        }
        reset();
        setIsOpen((cur: any) => !cur);
    };

    const handleCancelar = () => {
        setMostrarAdvertenciaCancelacion(true);
    };

    const handleAtras = () => {
        setMostrarAdvertenciaCancelacion(false);
    };

    const handleConfirmarCancelacion = async () => {
        setCancelandoReserva(true);

        const ok = await cancelarReserva(reservaAEditar.id);

        setCancelandoReserva(false);

        if (ok) {
            refrescar();
            setMostrarDialogExito(true);
        }
    };

    const onCambioCantPersonas = (cantPersonas: any) => {
        setValue('cantidadPersonas', cantPersonas);
    };

    return (
        <>
            {mostrarDialogExito && (
                <DialogExito accionAlConfirmar={finalizarOperacion} />
            )}

            {mostrarAdvertenciaCancelacion && (
                <Dialog
                    open={mostrarAdvertenciaCancelacion}
                    handler={handleCancelar}
                    size='xs'
                >
                    <DialogHeader>
                        <div className='flex flex-col w-full justify-center gap-5 items-center'>
                            <FaExclamationTriangle
                                size={40}
                                className='text-yellow-700'
                            />
                            Atención!
                        </div>
                    </DialogHeader>
                    <DialogBody className='flex flex-col text-center gap-3'>
                        <Typography variant='lead'>
                            Está a punto de cancelar una reserva.
                        </Typography>

                        <Typography variant='lead'>
                            Está seguro que desea continuar?
                        </Typography>
                    </DialogBody>
                    <DialogFooter className='flex justify-center gap-10'>
                        <Button
                            variant='outlined'
                            onClick={handleAtras}
                            className='w-fit'
                        >
                            <span>Atrás</span>
                        </Button>
                        <Button
                            variant='gradient'
                            color='red'
                            onClick={handleConfirmarCancelacion}
                            className='w-fit'
                            loading={cancelandoReserva}
                        >
                            <span>Confirmar</span>
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}

            <Dialog
                size='lg'
                open={isOpen}
                handler={handleOpen}
                className='bg-transparent shadow-none w-1/3'
            >
                <Card className='mx-auto w-full p-4 overflow-visible'>
                    <FormProvider {...methods}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className='space-y-2'
                        >
                            <CardBody className='flex flex-col gap-2'>
                                <div className='flex justify-between'>
                                    <div>
                                        <Typography
                                            variant='h4'
                                            color='blue-gray'
                                            className='mb-4'
                                        >
                                            {reservaAEditar?.cliente
                                                ? 'Editar Reserva'
                                                : 'Registrar Reserva'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Button
                                            size='md'
                                            variant='text'
                                            color='red'
                                            onClick={handleOpen}
                                        >
                                            <FaWindowClose size={20} />
                                        </Button>
                                    </div>
                                </div>
                                <div className='flex w-full gap-10'>
                                    <div className='flex flex-col w-1/3 gap-3'>
                                        <Typography variant='h5' color='green'>
                                            Cliente
                                        </Typography>
                                        <Input
                                            label='Nombre y Apellido*'
                                            error={!!errors.nombre}
                                            {...register('nombre', {
                                                required:
                                                    'Este campo es obligatorio.',
                                            })}
                                        />
                                        {errors.nombre && (
                                            <p className='text-red-500'>
                                                {errors.nombre.message as string}
                                            </p>
                                        )}

                                        <div>
                                            <Input
                                                label='Email'
                                                error={!!errors.email}
                                                type='email'
                                                {...register('email')}
                                            />
                                            {errors.email && (
                                                <p className='text-red-500'>
                                                    {errors.email.message as string}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Input
                                                label='Teléfono de Contacto*'
                                                error={!!errors.telefono}
                                                {...register('telefono', {
                                                    required:
                                                        'Este campo es obligatorio',
                                                    pattern: {
                                                        value: /^[0-9]+$/, // Expresión regular para solo números
                                                        message:
                                                            'Solo se permiten números',
                                                    },
                                                })}
                                            />
                                            {errors.telefono && (
                                                <p className='text-red-500'>
                                                    {errors.telefono.message as string}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex flex-col w-2/3 gap-1'>
                                        <Typography variant='h5' color='green'>
                                            Reserva
                                        </Typography>

                                        <div className='mt-3'>
                                            <CustomDatePicker
                                                handleFechasSeleccionadas={
                                                    onFechasSeleccionadas
                                                }
                                                deshabilitado={
                                                    deshabilitarCamposEdicion
                                                }
                                            />
                                        </div>

                                        <div className='py-2'>
                                            <InputCantPersonas
                                                handleCambioCantPersonas={
                                                    onCambioCantPersonas
                                                }
                                                deshabilitado={
                                                    deshabilitarCamposEdicion
                                                }
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 text-center sm:grid-cols-2 py-2'>
                                            <div>
                                                {propiedades && (
                                                    <Select
                                                        label='Propiedades*'
                                                        error={
                                                            !!errors.propiedadId
                                                        }
                                                        value={getValues(
                                                            'propiedadId'
                                                        )}
                                                        disabled={
                                                            deshabilitarCamposEdicion
                                                        }
                                                        {...register(
                                                            'propiedadId',
                                                            {
                                                                required:
                                                                    'Se necesita seleccionar una Propiedad.',
                                                                validate: (
                                                                    value
                                                                ) => value > 0,
                                                            }
                                                        )}
                                                        onChange={
                                                            handlePropiedadSeleccionada
                                                        }
                                                    >
                                                        {propiedades.map(
                                                            (propiedad: any) => (
                                                                <Option
                                                                    key={
                                                                        propiedad.id
                                                                    }
                                                                    value={
                                                                        propiedad.id
                                                                    }
                                                                    className='text-start'
                                                                >
                                                                    {
                                                                        propiedad.nombre
                                                                    }
                                                                </Option>
                                                            )
                                                        )}
                                                    </Select>
                                                )}
                                                {errors.propiedadId && (
                                                    <p className='text-red-500 text-start'>
                                                        {
                                                            errors.propiedadId
                                                                .message as string
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {unidades && (
                                                    <div className='flex flex-row items-center gap-1'>
                                                        <Select
                                                            label='Unidades*'
                                                            error={
                                                                !!errors.unidadId
                                                            }
                                                            value={getValues(
                                                                'unidadId'
                                                            )}
                                                            disabled={
                                                                deshabilitarCamposEdicion
                                                            }
                                                            {...register(
                                                                'unidadId',
                                                                {
                                                                    required:
                                                                        'Se necesita seleccionar una Unidad.',
                                                                    validate: (
                                                                        value
                                                                    ) =>
                                                                        value >
                                                                        0,
                                                                }
                                                            )}
                                                            onChange={
                                                                handleUnidadSeleccionada
                                                            }
                                                        >
                                                            {unidades?.length >
                                                            0 ? (
                                                                unidades.map(
                                                                    (
                                                                        unidad: any
                                                                    ) => (
                                                                        <Option
                                                                            key={
                                                                                unidad.id
                                                                            }
                                                                            value={
                                                                                unidad.id
                                                                            }
                                                                            color='light-green'
                                                                            className='text-start'
                                                                        >
                                                                            {
                                                                                unidad.nombre
                                                                            }
                                                                        </Option>
                                                                    )
                                                                )
                                                            ) : (
                                                                <Option
                                                                    color='light-green'
                                                                    className='text-start'
                                                                >
                                                                    No hay
                                                                    Unidades
                                                                    Disponibles
                                                                </Option>
                                                            )}
                                                        </Select>

                                                        <Tooltip
                                                            className='z-[10000]'
                                                            placement='bottom'
                                                            content={
                                                                <span className='text-md'>
                                                                    * Se deben
                                                                    completar la
                                                                    Fecha de
                                                                    Inicio,
                                                                    Fecha de Fin
                                                                    y Cantidad
                                                                    de Personas
                                                                    para
                                                                    visualizar
                                                                    las unidades
                                                                    disponibles.
                                                                </span>
                                                            }
                                                        >
                                                            <svg
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                fill='none'
                                                                viewBox='0 0 24 24'
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke='currentColor'
                                                                className='size-6 text-yellow-700'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    d='M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'
                                                                />
                                                            </svg>
                                                        </Tooltip>
                                                    </div>
                                                )}

                                                {errors.unidadId && (
                                                    <p className='text-red-500 text-start'>
                                                        {
                                                            errors.unidadId
                                                                .message as string
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {mostrarMensajeSinDisponibilidad && (
                                            <span className='text-red-400 text-lg'>
                                                * No se encontraron unidades
                                                disponibles en la propiedad para
                                                las fechas y cantidad de
                                                personas indicadas.
                                            </span>
                                        )}

                                        <div>
                                            <Textarea
                                                label='Observaciones'
                                                disabled={
                                                    deshabilitarCamposEdicion
                                                }
                                                {...register('observaciones')}
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 py-2'>
                                            <div>
                                                <Input
                                                    label='Seña'
                                                    error={!!errors.pagoParcial}
                                                    {...register(
                                                        'pagoParcial',
                                                        {
                                                            pattern: {
                                                                value: /^[0-9]+$/, // Expresión regular para solo números
                                                                message:
                                                                    'Solo se permiten números',
                                                            },
                                                            validate: (value) =>
                                                                !precioTotal ||
                                                                Number(value) <=
                                                                    Number(
                                                                        precioTotal
                                                                    ) ||
                                                                'La seña no puede ser mayor al total.',
                                                        }
                                                    )}
                                                    icon={
                                                        <FaDollarSign className='text-light-green' />
                                                    }
                                                />
                                                {errors.pagoParcial && (
                                                    <p className='text-red-500'>
                                                        {
                                                            errors.pagoParcial
                                                                .message as string
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Input
                                                    label='Total'
                                                    error={!!errors.precioTotal}
                                                    {...register(
                                                        'precioTotal',
                                                        {
                                                            required:
                                                                'Este campo es obligatorio',
                                                            pattern: {
                                                                value: /^[0-9]+$/, // Expresión regular para solo números
                                                                message:
                                                                    'Solo se permiten números',
                                                            },
                                                        }
                                                    )}
                                                    icon={<FaDollarSign />}
                                                />
                                                {errors.precioTotal && (
                                                    <p className='text-red-500'>
                                                        {
                                                            errors.precioTotal
                                                                .message as string
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter className='pt-0'>
                                <Typography
                                    variant='small'
                                    color='orange'
                                    className='pb-3'
                                >
                                    *Campos Requeridos
                                </Typography>
                                <div className='flex w-full justify-between'>
                                    <div className='flex w-1/3'>
                                        {reservaAEditar?.cliente && (
                                            <Button
                                                type='button'
                                                variant='filled'
                                                color='red'
                                                className='w-fit'
                                                onClick={handleCancelar}
                                            >
                                                Cancelar Reserva
                                            </Button>
                                        )}
                                    </div>
                                    <div className='flex gap-5 w-2/3 justify-end'>
                                        <Button
                                            type='submit'
                                            variant='gradient'
                                            color={
                                                reservaAEditar?.cliente
                                                    ? 'orange'
                                                    : 'light-green'
                                            }
                                            className='w-full ml-6'
                                            loading={guardandoReserva}
                                        >
                                            {reservaAEditar?.cliente
                                                ? 'Actualizar'
                                                : 'Registrar'}
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        </form>
                    </FormProvider>
                </Card>
            </Dialog>
        </>
    );
};
