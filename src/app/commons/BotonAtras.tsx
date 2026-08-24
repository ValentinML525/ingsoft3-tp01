'use client';
import { Button } from '@/components/Client/MaterialTailwindClient';
import Link from 'next/link';
import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export const BotonAtras = () => {
    const router = useRouter();
    const handleBack = () => {
        router.back();
    };
    return (
        <div>
            <Button
                variant="text"
                className="flex items-center gap-2"
                onClick={handleBack}
            >
                <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                Atrás
            </Button>
        </div>
    );
};
