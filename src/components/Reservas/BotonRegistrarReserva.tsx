'use client';

import { useState } from 'react';
import { FormReserva } from './FormReserva';
import { Button } from '@/components/Client/MaterialTailwindClient';
import { useRouter } from 'next/navigation';

export const BotonRegistrarReserva = () => {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();

    const refrescar = () => {
        window.location.reload();
        router.refresh();
    };

    return (
        <>
            <div className='mb-10'>
                <Button onClick={() => setIsOpen(true)} color='light-green'>
                    Registrar Reserva
                </Button>
            </div>

            {isOpen && (
                <FormReserva
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    refrescar={refrescar}
                />
            )}
        </>
    );
};
