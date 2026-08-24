'use client';

import { useState, useEffect } from 'react';
import { Ubicacion } from '@prisma/client';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import {
    Button,
    Dialog,
    Card,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Select,
    Option,
    Tooltip,
} from '../Client/MaterialTailwindClient';

import {
    getAllTiposPropiedad,
    upsertPropiedad,
} from '@/actions/propiedades/propiedades';

import { InputBuscarUbicacion } from '../../app/commons/Forms/InputBuscarUbicacion';
import { DialogExito } from '../../app/commons/Dialogs/DialogExito';
import MapaBusqueda from '../Mapas/MapaBusqueda';
import { FaWindowClose } from 'react-icons/fa';

type Inputs = {
    nombre: string;
    ubicacion: Ubicacion;
    tipoPropiedadId: number;
    telefonoContacto: string;
};

interface FormPropiedadProps {
    isOpen: any;
    setIsOpen: any;
    propiedadAEditar?: any;
}

export const FormPropiedad = ({ isOpen, setIsOpen, propiedadAEditar }: FormPropiedadProps) => {
    const [ubicacion, setUbicacion] = useState<any>();
    const [tiposPropiedad, setTiposPropiedad] = useState<any[]>([]);
    const [mostrarDialogExito, setMostrarDialogExito] = useState(false);

    const methods = useForm<Inputs>();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = methods;

    useEffect(() => {
        const buscarTiposPropiedad = async () => {
            try {
                const response = await getAllTiposPropiedad();
                setTiposPropiedad(response);
            } catch (error) {
                console.error('Error buscando tipos de propiedad: ', error);
            }
        };

        if (propiedadAEditar) {
            reset({
                nombre: propiedadAEditar.nombre,
                telefonoContacto: propiedadAEditar.telefonoContacto,
                tipoPropiedadId: propiedadAEditar.tipoPropiedadId,
                ubicacion: propiedadAEditar.ubicacion,
            });
            setUbicacion(propiedadAEditar.ubicacion);
        }

        buscarTiposPropiedad();
    }, []);

    useEffect(() => {
        if (tiposPropiedad && propiedadAEditar?.tipoPropiedadId) {
            setValue('tipoPropiedadId', propiedadAEditar.tipoPropiedadId);
        }
    }, [tiposPropiedad]);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const propiedad = {
            id: propiedadAEditar?.id,
            nombre: data.nombre,
            telefonoContacto: data.telefonoContacto,
            tipoPropiedadId: data.tipoPropiedadId,
            ubicacion: data.ubicacion,
        };

        try {
            await upsertPropiedad(propiedad);
            setMostrarDialogExito(true);
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const finalizarOperacion = () => {
        setMostrarDialogExito(false);
        setIsOpen(false);
        reset();
    };

    const onUbicacionSeleccionada = (ubicacion: any) => {
        setUbicacion(ubicacion);
        setValue('ubicacion', ubicacion);
    };

    const handleSelectTipoPropiedad = (val: any) => {
        setValue('tipoPropiedadId', val);
    };

    return (
        <>
            <div className='mb-10'>
                {mostrarDialogExito && (
                    <DialogExito accionAlConfirmar={finalizarOperacion} />
                )}

                <Dialog
                    size='md'
                    open={isOpen}
                    handler={setIsOpen}
                    className='bg-transparent shadow-none w-1/3'
                >
                    <Card className='mx-auto w-full'>
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)}>
                                <CardBody className='flex flex-col gap-4'>
                                    <div className='flex justify-between'>
                                        <Typography
                                            variant='h4'
                                            color='blue-gray'
                                        >
                                            {propiedadAEditar
                                                ? 'Editar Propiedad'
                                                : 'Registrar Propiedad'}
                                        </Typography>
                                        <Button
                                            size='md'
                                            variant='text'
                                            color='red'
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <FaWindowClose size={20} />
                                        </Button>
                                    </div>
                                    <Input
                                        label='Nombre*'
                                        error={!!errors.nombre}
                                        {...register('nombre', {
                                            required:
                                                'Este campo es obligatorio.',
                                        })}
                                    />
                                    {errors.nombre && (
                                        <p className='text-red-500'>
                                            {errors.nombre.message}
                                        </p>
                                    )}

                                    <Input
                                        label='Teléfono de Contacto*'
                                        error={!!errors.telefonoContacto}
                                        {...register('telefonoContacto', {
                                            required:
                                                'Este campo es obligatorio',
                                            pattern: {
                                                value: /^[0-9]+$/, // Expresión regular para solo números
                                                message:
                                                    'Solo se permiten números',
                                            },
                                        })}
                                    />
                                    {errors.telefonoContacto && (
                                        <p className='text-red-500'>
                                            {errors.telefonoContacto.message}
                                        </p>
                                    )}
                                    {tiposPropiedad && (
                                        <div className='z-[10050]'>
                                            <Select
                                                label='Tipo de Propiedad*'
                                                error={!!errors.tipoPropiedadId}
                                                value={getValues(
                                                    'tipoPropiedadId'
                                                )}
                                                {...register(
                                                    'tipoPropiedadId',
                                                    {
                                                        required:
                                                            'Se necesita seleccionar un tipo de propiedad.',
                                                    }
                                                )}
                                                onChange={
                                                    handleSelectTipoPropiedad
                                                }
                                            >
                                                {tiposPropiedad.map(
                                                    (tipoPropiedad) => (
                                                        <Option
                                                            key={
                                                                tipoPropiedad.id
                                                            }
                                                            value={
                                                                tipoPropiedad.id
                                                            }
                                                            color='light-green'
                                                        >
                                                            {
                                                                tipoPropiedad.nombre
                                                            }
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </div>
                                    )}
                                    {errors.tipoPropiedadId && (
                                        <p className='text-red-500'>
                                            {errors.tipoPropiedadId.message}
                                        </p>
                                    )}

                                    <div className='relative'>
                                        <div className='absolute top-0 left-0 w-full z-[10000]'>
                                            <InputBuscarUbicacion
                                                ubicacionSeleccionadaEnMapa={
                                                    ubicacion
                                                }
                                                handleUbicacionForm={
                                                    onUbicacionSeleccionada
                                                }
                                            />
                                        </div>
                                        <div className='pt-16'>
                                            <MapaBusqueda
                                                ubicacion={ubicacion}
                                                onUbicacionSeleccionada={
                                                    onUbicacionSeleccionada
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                                <CardFooter className='pt-0'>
                                    <Typography
                                        variant='small'
                                        color='orange'
                                        className='mb-2'
                                    >
                                        *Campos Requeridos
                                    </Typography>
                                    <Button
                                        type='submit'
                                        variant='gradient'
                                        color={
                                            propiedadAEditar
                                                ? 'orange'
                                                : 'light-green'
                                        }
                                        fullWidth
                                    >
                                        {propiedadAEditar
                                            ? 'Actualizar'
                                            : 'Registrar'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </FormProvider>
                    </Card>
                </Dialog>
            </div>
        </>
    );
};
