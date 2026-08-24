'use client';
import { useState, useEffect } from 'react';
import {
    Tab,
    TabPanel,
    Tabs,
    TabsBody,
    TabsHeader,
} from '@/components/Client/MaterialTailwindClient';

import { getAllPropiedades } from '@/actions/propiedades/propiedades';

import { Reportes } from '@/components/Reportes/Reportes';

export default function ReportesPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [propiedades, setPropiedades] = useState<any[]>([]);

    useEffect(() => {
        const buscarPropiedades = async () => {
            const propiedades = await getAllPropiedades();

            setPropiedades(propiedades);
        };

        buscarPropiedades();
    }, []);

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-left bg-light-green-600 text-white py-2 px-4 rounded shadow-lg">
                Reportes
            </h1>

            <Tabs value={activeTab}>
                <TabsHeader
                    className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
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
                                onClick={() => setActiveTab(index)}
                                className={
                                    activeTab === nombre ? 'text-gray-900' : ''
                                }
                            >
                                {nombre}
                            </Tab>
                        ))}
                </TabsHeader>
                <TabsBody>
                    {propiedades &&
                        propiedades.map(({ id, nombre }, index) => (
                            <TabPanel key={id} value={index}>
                                <Reportes key={id} propiedadId={id} />
                            </TabPanel>
                        ))}
                </TabsBody>
            </Tabs>
        </>
    );
}
