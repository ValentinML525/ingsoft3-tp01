'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import {
    EliminarImagen,
    insertarUnidad,
} from '../../actions/unidades/unidades';
import {
    FaExclamationTriangle,
    FaPencilAlt,
    FaRegTimesCircle,
} from 'react-icons/fa';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Checkbox,
    Dialog,
    Input,
    Radio,
    Textarea,
    Tooltip,
    Typography,
} from '@/components/Client/MaterialTailwindClient';
import { getAllServicios } from '@/actions/servicios/servicios';
import { DialogExito } from '../../app/commons/Dialogs/DialogExito';
import {
    FaDollarSign,
    FaUserAlt,
    FaUsers,
    FaWindowClose,
} from 'react-icons/fa';

type Inputs = {
    nombre: string;
    capacidad: number;
    descripcion: string;
    servicios: number[];
    precioPorNoche?: number;
    imagenes: { nombre: string; data: string }[];
};

export const FormUnidad = ({
    isOpen,
    setIsOpen,
    propiedadId,
    unidadAEditar,
}: {
    isOpen?: any;
    setIsOpen?: any;
    propiedadId?: any;
    unidadAEditar?: any;
}) => {
    const [habilitarPrecioPorNoche, setHabilitarPrecioPorNoche] =
        useState(false);

    const [servicios, setServicios] = useState<any>();
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState<any[]>([]);
    const [mostrarDialogExito, setMostrarDialogExito] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [guardandoUnidad, setGuardandoUnidad] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchServicios = async () => {
            const response = await getAllServicios();
            setServicios(response);
        };

        if (unidadAEditar) {
            if (unidadAEditar.precioPorNoche > 0) {
                setHabilitarPrecioPorNoche(true);
            }

            reset({
                nombre: unidadAEditar.nombre,
                capacidad: unidadAEditar.capacidad,
                descripcion: unidadAEditar.descripcion,
                servicios: unidadAEditar.servicios,
                precioPorNoche: unidadAEditar.precioPorNoche,
                imagenes: unidadAEditar.imagenes,
            });
            if (unidadAEditar.imagenes && unidadAEditar.imagenes.length > 0) {
                const UrlDeImagen = unidadAEditar.imagenes.map(
                    (imagen: any) => imagen.url
                );
                setImages(UrlDeImagen);
            }
        }

        fetchServicios();
    }, []);

    useEffect(() => {
        if (servicios && unidadAEditar?.servicios) {
            const arrayServicios = unidadAEditar.servicios.map(
                (servicio: any) => servicio.servicioId
            );

            setServiciosSeleccionados([...arrayServicios]);
        }
    }, [servicios]);

    const methods = useForm<any>();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = methods;

    const onSubmit = async (data: any) => {
        setGuardandoUnidad(true);

        const unidad: any = {
            id: unidadAEditar?.id,
            nombre: data.nombre,
            capacidad: +data.capacidad,
            descripcion: data.descripcion,
            servicios: serviciosSeleccionados,
            precioPorNoche: +data.precioPorNoche,
            propiedadId: +propiedadId,
            imagenes: [] as any[],
        };

        try {
            const archivos: any = (fileInputRef.current as any)?.files;
            if (archivos && archivos.length > 0) {
                const imagenesPromises = Array.from(archivos).map((archivo: any) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                nombre: archivo.name,
                                data: ((reader.result as string) || '').split(',')[1],
                            });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(archivo);
                    });
                });

                const imagenes = await Promise.all(imagenesPromises);
                unidad.imagenes.push(...imagenes);
            }

            await insertarUnidad(unidad);

            setGuardandoUnidad(false);
            setMostrarDialogExito(true);
        } catch (error) {
            console.log('Error al guardar unidad: ', error);
            setGuardandoUnidad(false);
        }
    };

    const finalizarOperacion = () => {
        setServiciosSeleccionados([]);
        setIsOpen(false);
        setMostrarDialogExito(false);
        reset();
    };
    const handleEliminarImagen = async (index: any, imagenABorrar: any, unidadid: any) => {
        try {
            await EliminarImagen(unidadid, imagenABorrar);
            setImages((imagenes) => {
                const imagenesActualizadas = [...imagenes];
                imagenesActualizadas.splice(index, 1);
                return imagenesActualizadas;
            });
        } catch (error) {
            console.log('Error al eliminar la imagen: ', error);
        }
    };

    const handleRadioChange = (e: any) => {
        setValue('precioPorNoche', '');
        setHabilitarPrecioPorNoche(e.target.value !== 'solicitarPresupuesto');
    };

    const handleServicioSeleccionado = (event: any, servicioId: any) => {
        if (event.target.checked) {
            setServiciosSeleccionados((seleccionados) => [
                ...seleccionados,
                servicioId,
            ]);
        } else {
            setServiciosSeleccionados((seleccionados) =>
                seleccionados.filter((id) => id !== servicioId)
            );
        }
    };

    const handleButtonClick = () => {
        (fileInputRef.current as any)?.click();
    };

    const handleFileChange = (event: any) => {
        const files = Array.from((event.target as any).files);
        const imageUrls = files.map((file: any) => URL.createObjectURL(file));
        setImages(imageUrls);
    };

    return (
        <>
            {mostrarDialogExito && (
                <DialogExito accionAlConfirmar={finalizarOperacion} />
            )}

            <Dialog
                size='xl'
                open={isOpen}
                handler={setIsOpen}
                className='bg-transparent shadow-none w-1/3'
            >
                <Card className='mx-auto w-full px-3'>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <CardBody className='flex flex-col gap-4'>
                                <div className='flex justify-between'>
                                    <Typography variant='h4' color='blue-gray'>
                                        {unidadAEditar
                                            ? 'Editar Unidad'
                                            : 'Registrar Unidad'}
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
                                <div className='flex w-full gap-10'>
                                    <div className='flex flex-col w-full gap-3'>
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
                                                 {errors.nombre.message as string}
                                             </p>
                                         )}

                                        <div className='flex gap-5'>
                                            <Input
                                                label='Capacidad*'
                                                error={!!errors.capacidad}
                                                icon={
                                                    <div className='flex gap-2 items-center ml-[-70px]'>
                                                        <FaUsers />
                                                        <Typography>
                                                            Personas
                                                        </Typography>
                                                    </div>
                                                }
                                                {...register('capacidad', {
                                                    required:
                                                        'Este campo es obligatorio',
                                                    pattern: {
                                                        value: /^[0-9]+$/, // Expresión regular para solo números
                                                        message:
                                                            'Solo se permiten números',
                                                    },
                                                })}
                                            />
                                             {errors.capacidad && (
                                                 <p className='text-red-500'>
                                                     {errors.capacidad.message as string}
                                                 </p>
                                             )}
                                        </div>

                                        <div className='flex'>
                                            <Textarea
                                                label='Descripción*'
                                                error={!!errors.descripcion}
                                                {...register('descripcion', {
                                                    required:
                                                        'Este campo es obligatorio.',
                                                })}
                                            />
                                             {errors.descripcion && (
                                                 <p className='text-red-500'>
                                                     {errors.descripcion.message as string}
                                                 </p>
                                             )}
                                        </div>

                                        <div className='flex flex-col gap-3 mt-6'>
                                            <Radio
                                                name='mostrarPrecio'
                                                label='Los clientes deben solicitar presupuesto'
                                                color='light-green'
                                                value='solicitarPresupuesto'
                                                checked={
                                                    !habilitarPrecioPorNoche
                                                }
                                                onChange={handleRadioChange}
                                            />
                                            <div className='flex flex-row'>
                                                <div className='flex w-full'>
                                                    <Radio
                                                        name='mostrarPrecio'
                                                        value='precioPorNoche'
                                                        checked={
                                                            habilitarPrecioPorNoche
                                                        }
                                                        color='light-green'
                                                        onChange={
                                                            handleRadioChange
                                                        }
                                                    />
                                                    <div className='flex flex-col w-full'>
                                                        <Input
                                                            label='Precio por Noche*'
                                                            variant='standard'
                                                            color='light-green'
                                                            defaultValue={getValues(
                                                                'precioPorNoche'
                                                            )}
                                                            error={
                                                                !!errors.precioPorNoche
                                                            }
                                                            disabled={
                                                                !habilitarPrecioPorNoche
                                                            }
                                                            icon={
                                                                <div className='flex items-center gap-1 ml-[-70px]'>
                                                                    <FaDollarSign />
                                                                    <Typography>
                                                                        (ARS)
                                                                    </Typography>
                                                                </div>
                                                            }
                                                            {...register(
                                                                'precioPorNoche',
                                                                {
                                                                    validate: (
                                                                        value
                                                                    ) => {
                                                                        if (
                                                                            habilitarPrecioPorNoche &&
                                                                            !value
                                                                        ) {
                                                                            return 'Este campo es obligatorio.';
                                                                        }
                                                                        return true;
                                                                    },
                                                                    pattern: {
                                                                        value: /^[0-9]+$/, // Expresión regular para solo números
                                                                        message:
                                                                            'Solo se permiten números',
                                                                    },
                                                                }
                                                            )}
                                                        />

                                                         {errors.precioPorNoche && (
                                                             <p className='text-red-500'>
                                                                 {
                                                                     errors
                                                                         .precioPorNoche
                                                                         .message as string
                                                                 }
                                                             </p>
                                                         )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className='flex flex-col items-center my-10'>
                                                <Button
                                                    className='flex items-center gap-3'
                                                    onClick={handleButtonClick}
                                                >
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                        strokeWidth={2}
                                                        stroke='currentColor'
                                                        className='h-5 w-5'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            d='M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z'
                                                        />
                                                    </svg>
                                                    Cargar Imagenes
                                                </Button>
                                                <input
                                                    type='file'
                                                    ref={fileInputRef}
                                                    accept='image/*'
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className='hidden'
                                                />
                                                {images &&
                                                    images.length > 0 && (
                                                        <div
                                                            className='mt-10 overflow-y-auto'
                                                            style={{
                                                                maxHeight:
                                                                    '130px',
                                                                border: '1px solid #ddd',
                                                                borderRadius:
                                                                    '4px',
                                                                padding: '8px',
                                                            }}
                                                        >
                                                            {images &&
                                                                images.map(
                                                                    (
                                                                        image: any,
                                                                        index: number
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className='flex justify-between items-center mb-2 p-2 border border-gray-300 rounded'
                                                                        >
                                                                            <Typography>
                                                                                {
                                                                                    image
                                                                                }
                                                                            </Typography>
                                                                            <Tooltip content='Eliminar'>
                                                                                <Button
                                                                                    size='md'
                                                                                    variant='text'
                                                                                    color='red'
                                                                                    onClick={() =>
                                                                                        handleEliminarImagen(
                                                                                            index,
                                                                                            image,
                                                                                            unidadAEditar?.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FaRegTimesCircle
                                                                                        size={
                                                                                            20
                                                                                        }
                                                                                    />
                                                                                </Button>
                                                                            </Tooltip>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-3 w-full '>
                                        {servicios &&
                                            servicios.map((servicio: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className='w-full'
                                                >
                                                    <Checkbox
                                                        ripple={false}
                                                        key={index}
                                                        color='light-green'
                                                        label={servicio.nombre}
                                                        checked={serviciosSeleccionados.includes(
                                                            servicio.id
                                                        )}
                                                        onChange={(e: any) =>
                                                            handleServicioSeleccionado(
                                                                e,
                                                                servicio.id
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
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
                                        unidadAEditar ? 'orange' : 'light-green'
                                    }
                                    loading={guardandoUnidad}
                                    fullWidth
                                >
                                    {unidadAEditar ? 'Actualizar' : 'Registrar'}
                                </Button>
                            </CardFooter>
                        </form>
                    </FormProvider>
                </Card>
            </Dialog>
        </>
    );
};
