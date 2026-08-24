'use client';

import {
    Tab,
    TabPanel,
    Tabs,
    TabsBody,
    TabsHeader,
} from '@/components/Client/MaterialTailwindClient';
import Tabla from '@/components/Reservas/Tabla';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const TabsReservas = ({ propiedades }: { propiedades: any[] }) => {
    const [activeTab, setActiveTab] = useState(0);

    const cambiarTab = (index: number) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('pagina');
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
        setActiveTab(index);
    };

    return (
        <>
            <Tabs value={activeTab} className="flex flex-col w-full px-10">
                <TabsHeader
                    className="rounded-none border-b border-blue-gray-50 bg-transparent p-0 w-full"
                    indicatorProps={{
                        className:
                            'bg-transparent border-b-2 border-light-green-500 shadow-none rounded-none',
                    }}
                >
                    {propiedades &&
                        propiedades.map(({ id, nombre }, index) => (
                            <Tab
                                key={id}
                                value={index}
                                onClick={() => cambiarTab(index)}
                                className={
                                    activeTab === nombre ? 'text-gray-900' : ''
                                }
                            >
                                {nombre}
                            </Tab>
                        ))}
                </TabsHeader>
                <TabsBody>
                    {propiedades?.map(({ id }, index) => (
                        <TabPanel key={id} value={index}>
                            <Tabla propiedadId={id} />
                        </TabPanel>
                    ))}
                </TabsBody>
            </Tabs>
        </>
    );
};
