'use client';
import { useState } from 'react';

import {
    Input,
    Popover,
    PopoverHandler,
    PopoverContent,
    IconButton,
    Button,
} from '../../../components/Client/MaterialTailwindClient';

import { useFormContext } from 'react-hook-form';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { DayPicker } from 'react-day-picker';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

import 'react-day-picker/style.css';

interface CustomDatePickerProps {
    handleFechasSeleccionadas?: (fechas: any) => void;
    deshabilitado?: boolean;
    mostrarPasados?: boolean;
}

export const CustomDatePicker = ({
    handleFechasSeleccionadas = () => {},
    deshabilitado,
    mostrarPasados = true,
}: CustomDatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();

    const rangoFechas = watch('rangoFechas');

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const resetFechas = () => {
        handleClose();
        handleFechasSeleccionadas([]);
    };

    const onFechasSeleccionadas = (fechas: any) => {
        handleFechasSeleccionadas(fechas);
    };

    return (
        <div className='w-full'>
            <Popover open={isOpen} handler={setIsOpen} placement='bottom'>
                <PopoverHandler>
                    <Input
                        label='Fechas'
                        disabled={deshabilitado}
                        onClick={handleOpen}
                        error={!!errors.rangoFechas}
                        className='pl-5'
                        value={
                            rangoFechas?.from && rangoFechas?.to
                                ? `${format(rangoFechas.from, 'PP', {
                                      locale: es,
                                  })} - ${format(rangoFechas.to, 'PP', {
                                      locale: es,
                                  })}`
                                : rangoFechas?.from
                                ? format(rangoFechas.from, 'PP')
                                : ''
                        }
                        {...register('rangoFechas', {
                            required: 'Este campo es requerido.',
                        })}
                    />
                </PopoverHandler>
                {errors.rangoFechas && (
                    <p className='text-red-500'>{String(errors.rangoFechas?.message || '')}</p>
                )}
                <PopoverContent className='flex flex-col z-[10000]'>
                    <DayPicker
                        locale={es}
                        timeZone='America/Argentina/Buenos_Aires'
                        mode='range'
                        selected={rangoFechas}
                        onSelect={onFechasSeleccionadas}
                        showOutsideDays
                        disabled={
                            mostrarPasados ? undefined : { before: new Date() }
                        }
                        className='border-0'
                        classNames={{
                            selected: 'bg-verdeClaro text-verdeOscuro',
                            range_start:
                                'rounded-l-lg text-white bg-verdeIntermedio',
                            range_end:
                                'rounded-r-lg text-white bg-verdeIntermedio',
                            range_middle: 'text-white bg-verdeClaro',
                            today: 'text-naranja',
                            chevron: 'fill-verdeIntermedio',
                        }}
                        components={{
                            IconLeft: ({ ...props }: any) => (
                                <ChevronLeftIcon
                                    {...props}
                                    className='h-4 w-4 stroke-2'
                                />
                            ),
                            IconRight: ({ ...props }: any) => (
                                <ChevronRightIcon
                                    {...props}
                                    className='h-4 w-4 stroke-2 text-white'
                                />
                            ),
                        } as any}
                    />
                    <div className='flex justify-end'>
                        <Button
                            variant='text'
                            color='red'
                            onClick={resetFechas}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant='text'
                            color='light-green'
                            onClick={handleClose}
                        >
                            Aceptar
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
