'use client';
import { useState, useEffect } from 'react';

import {
    Input,
    Radio,
    Card,
    List,
    ListItem,
    ListItemPrefix,
    Typography,
    Button,
    IconButton,
} from '../../../components/Client/MaterialTailwindClient';
import { useFormContext } from 'react-hook-form';
import { Ubicacion } from '@prisma/client';

import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { FaHome } from 'react-icons/fa';

const provider = new OpenStreetMapProvider({
    params: {
        addressdetails: 1,
        limit: 5,
        countrycodes: 'ar',
        featureType: 'house',
    },
});

interface Props {
    ubicacionSeleccionadaEnMapa?: any;
    handleUbicacionForm?: (ubicacion: any) => void;
}

export const InputBuscarUbicacion = ({
    ubicacionSeleccionadaEnMapa,
    handleUbicacionForm = () => {},
}: Props) => {
    const [textoBusqueda, setTextoBusqueda] = useState('');
    //debouncedValue es el valor del texto 1/2 segundo despues de que lo escriba
    const [debouncedValue, setDebouncedValue] = useState('');
    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(null);

    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();

    //Esperar a que el usuario deje de escribir por 1/2 segundo
    useEffect(() => {
        if (!ubicacionSeleccionada && !ubicacionSeleccionadaEnMapa) {
            const timer = setTimeout(() => {
                setDebouncedValue(textoBusqueda);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [textoBusqueda]);

    useEffect(() => {
        const buscarUbicaciones = async (texto: string) => {
            try {
                const textoFormateado = texto.replace(/ /g, '+');
                const ubicacionesSugeridas = await provider.search({
                    query: textoFormateado,
                });

                setUbicaciones(ubicacionesSugeridas);
            } catch (error) {
                console.error('Error buscando ubicaciones:', error);
            }
        };

        if (debouncedValue.length > 3 && !ubicacionSeleccionadaEnMapa) {
            buscarUbicaciones(debouncedValue);
        } else {
            setUbicaciones([]);
        }
    }, [debouncedValue]);

    useEffect(() => {
        if (ubicacionSeleccionadaEnMapa) {
            setTextoBusqueda(ubicacionSeleccionadaEnMapa.direccion);
            setUbicacionSeleccionada(ubicacionSeleccionadaEnMapa);
        }
    }, [ubicacionSeleccionadaEnMapa]);

    useEffect(() => {
        register('ubicacion', {
            required: 'Este campo es requerido.',
            validate: () =>
                ubicacionSeleccionada
                    ? true
                    : 'Necesita seleccionar una ubicación de la lista.',
        });
    }, [register, ubicacionSeleccionada]);

    const handleTextoEscrito = (e: any) => {
        if (!ubicacionSeleccionada) {
            setTextoBusqueda(e.target.value);
        }
    };

    const handleSeleccionarUbicacion = (ubicacion: any) => {
        const ubicacionFormateada: any = {
            direccion: ubicacion.label,
            latitud: ubicacion.y,
            longitud: ubicacion.x,
            ciudad:
                ubicacion.raw.address.city ||
                ubicacion.raw.address.town ||
                ubicacion.raw.address.village,
            provincia: ubicacion.raw.address.state,
        };

        setUbicacionSeleccionada(ubicacionFormateada);
        setValue('ubicacion', ubicacionFormateada);
        handleUbicacionForm(ubicacionFormateada);
        setUbicaciones([]);

        setTextoBusqueda(ubicacion.label);
    };

    const handleEliminarSeleccion = () => {
        setUbicacionSeleccionada(null);
        handleUbicacionForm(null);
        setTextoBusqueda('');
        setDebouncedValue('');
    };

    return (
        <>
            <div className='flex w-full'>
                <Input
                    label='Dirección*'
                    value={textoBusqueda}
                    onChange={handleTextoEscrito}
                    disabled={ubicacionSeleccionada}
                    className='pr-20'
                    error={!!errors.ubicacion}
                    containerProps={{
                        className: 'min-w-0',
                    }}
                />

                {ubicacionSeleccionada && (
                    <IconButton
                        size='sm'
                        color={ubicacionSeleccionada ? 'red' : 'gray'}
                        onClick={handleEliminarSeleccion}
                        disabled={!ubicacionSeleccionada}
                        className='!absolute right-1 top-2 rounded justify-center'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className='size-5'
                        >
                            <path d='M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z' />
                        </svg>
                    </IconButton>
                )}
            </div>
            {errors.ubicacion && (
                <p className='text-red-500'>{String(errors.ubicacion?.message || '')}</p>
            )}
            {ubicaciones.length > 0 && (
                <Card className='max-h-[200px] overflow-scroll'>
                    <List>
                        {ubicaciones.map((ubicacion, index) => (
                            <ListItem
                                key={index}
                                className='p-2'
                                onClick={() =>
                                    handleSeleccionarUbicacion(ubicacion)
                                }
                            >
                                <ListItemPrefix className='mr-3'>
                                    <FaHome
                                        size={20}
                                        className='text-green-500'
                                    />
                                </ListItemPrefix>
                                <Typography
                                    color='blue-gray'
                                    className='font-medium text-blue-gray-400'
                                >
                                    {ubicacion.label}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Card>
            )}
        </>
    );
};
