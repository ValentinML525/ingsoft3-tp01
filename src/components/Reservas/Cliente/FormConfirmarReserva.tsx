'use client';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
    Button,
    Chip,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
    Textarea,
} from '../../Client/MaterialTailwindClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { EstadoReserva } from '@prisma/client';
import { calcularCantidadNoches } from '@/actions/funciones-globales/funciones-globales';
import { getUnidadPorId } from '@/actions/unidades/unidades';
import { insertarReserva } from '@/actions/reservas/reservas';
import { FaExclamationTriangle } from 'react-icons/fa';

type Inputs = {
    nombre: string;
    telefono: string;
    email: string;
    observaciones?: string;
};

function Icon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
        >
            <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export const FormConfirmarReserva = ({ params }: { params: any }) => {
    const [unidad, setUnidad] = useState<any>();
    const [mostrarError, setMostrarError] = useState<any>();
    const { slugPropiedad, slugUnidad } = params;

    const router = useRouter();

    const searchParams = useSearchParams();

    const unidadId = searchParams.get('unidadId');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    //Atencion, cantPersonas viene por parametro y cantidadPersonas viene del input
    const cantPersonas = searchParams.get('cantPersonas');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const mensaje = 'Se te redirigirá a una conversación de WhatsApp';

    useEffect(() => {
        const buscarUnidad = async () => {
            if (unidadId) {
                const result = await getUnidadPorId(Number(unidadId));
                setUnidad(result);
            }
        };
        buscarUnidad();
    }, []);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const datosCliente = {
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.email,
        };

        const cantNoches = calcularCantidadNoches(fechaInicio || '', fechaFin || '');

        const datosReserva = {
            fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString() : new Date().toISOString(),
            fechaFin: fechaFin ? new Date(fechaFin).toISOString() : new Date().toISOString(),
            cantidadPersonas: cantPersonas ? +cantPersonas : 1,
            precioTotal: unidad.precioPorNoche
                ? cantNoches * unidad.precioPorNoche
                : 0,
            estado: EstadoReserva.SOLICITADA,
            observaciones: data.observaciones,
            unidadId: unidadId ? +unidadId : 0,
        };
        console.log('Datos Cliente: ', datosCliente);
        console.log('Datos Reserva: ', datosReserva);

        try {
            const reserva = await insertarReserva(datosReserva, datosCliente);

            if (reserva) {
                router.push(
                    `/${slugPropiedad}/${slugUnidad}/confirmacion/reserva-creada`
                );
                enviarMensaje(reserva.id, datosReserva, datosCliente);
            }
        } catch (error: any) {
            setMostrarError(error.message);
            throw new Error('Error al registrar la reserva', error as any);
        }
    };

    const enviarMensaje = (idReserva: any, datosReserva: any, datosCliente: any) => {
        const telefono = unidad.propiedad.telefonoContacto;

        const formatFecha = (fecha: any) => {
            const date = new Date(fecha);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const mensaje = `Hola! Acabo de solicitar una reserva a través de SERRAHOME:

			- Nombre: ${datosCliente.nombre}
			- Unidad: ${unidad.nombre}
			- Cantidad de Personas: ${datosReserva.cantidadPersonas}
			- Desde: ${formatFecha(datosReserva.fechaInicio)}
			- Hasta: ${formatFecha(datosReserva.fechaFin)}
			${
                datosReserva.precioTotal > 0
                    ? `- Total: $${datosReserva.precioTotal}`
                    : 'Quedo a la espera del presupuesto, gracias!'
            }
		`;

        const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(
            mensaje
        )}`;

        // Open WhatsApp link in a new tab
        window.open(whatsappUrl, '_blank');
    };

    const handleOpen = () => {
        setMostrarError(null);
    };

    const handleRegresar = () => {
        router.back();
    };

    return (
        <>
            {mostrarError && (
                <Dialog open={mostrarError} handler={handleOpen} size="xs">
                    <DialogHeader>
                        <div className="flex flex-col w-full justify-center gap-5 items-center">
                            <FaExclamationTriangle
                                size={40}
                                className="text-yellow-700"
                            />{' '}
                            Error.
                        </div>
                    </DialogHeader>
                    <DialogBody>{mostrarError}</DialogBody>
                    <DialogFooter className="flex justify-center">
                        <Button
                            variant="gradient"
                            color="red"
                            onClick={handleRegresar}
                        >
                            <span>Regresar</span>
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-5">
                    <div>
                        <Input
                            color="light-green"
                            variant="standard"
                            label="Nombre *"
                            placeholder="Nombre"
                            error={!!errors.nombre}
                            {...register('nombre', {
                                required: 'Este campo es obligatorio',
                            })}
                        />
                        {errors.nombre && (
                            <p className="text-red-500">
                                {errors.nombre.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Input
                            color="light-green"
                            variant="standard"
                            maxLength={16}
                            label="Número de Teléfono *"
                            error={!!errors.telefono}
                            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-4 w-4 text-blue-gray-600"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                            {...register('telefono', {
                                required: 'Este campo es obligatorio',
                                pattern: {
                                    value: /^[0-9]+$/, // Expresión regular para solo números
                                    message: 'Solo se permiten números',
                                },
                            })}
                        />
                        {errors.telefono && (
                            <p className="text-red-500">
                                {errors.telefono.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Input
                            color="light-green"
                            variant="standard"
                            label="Email"
                            placeholder="ej: nombre@mail.com"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="size-5"
                                >
                                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                                </svg>
                            }
                            {...register('email')}
                        />
                    </div>
                    <div>
                        <Textarea
                            label="Observaciones"
                            size="lg"
                            variant="standard"
                            color="light-green"
                            {...register('observaciones')}
                            className="text-lg"
                        />
                    </div>
                    <div className="text-verdeOscuro">
                        <Chip
                            value={mensaje}
                            variant="ghost"
                            className="w-full text-wrap"
                            color="green"
                            icon={<Icon />}
                        />
                    </div>
                    <div className="text-verdeOscuro">
                        <Chip
                            value="El Pago se gestionará directamente con el propietario."
                            variant="ghost"
                            className="w-full text-wrap"
                            color="green"
                            icon={<Icon />}
                        />
                    </div>
                    <div className="flex justify-end mt-5">
                        <Button
                            type="submit"
                            className="w-full"
                            color="light-green"
                            variant="gradient"
                        >
                            {unidad?.precioPorNoche
                                ? 'Reservar'
                                : 'Solicitar Presupuesto'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
};
