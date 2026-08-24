'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button, Input } from '@/components/Client/MaterialTailwindClient';
import { IngresosChart } from './IngresosChart/IngresosChart';
import { ReservaEstadosChart } from './ReservaEstadosChart/ReservaEstadosChart';
import {
    getDataReporteEstados,
    getMontoIngresos,
} from '@/actions/reservas/reservas-reportes';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChartsToPDF } from './ChartsToPdf';
import { MdOutlineFileDownload } from 'react-icons/md';

export interface TotalIngresosMensual {
    mes: string;
    total: number;
}

export interface DataIngresos {
    totalIngresosAnuales: number;
    totalIngresosMensuales: TotalIngresosMensual[];
}

export interface TotalPorEstado {
    estado: string;
    total: number;
    fechaInicio: string;
}

interface Props {
    propiedadId: number;
}

export const Reportes = ({ propiedadId }: Props) => {
    const [activeTab, setActiveTab] = useState<'ingresos' | 'reservas'>(
        'ingresos'
    );
    const [year, setYear] = useState<number>();
    const [ingresosData, setIngresosData] = useState<any>();
    const [estadosData, setEstadosData] = useState<any>();
    const [deshabilitarDescarga, setDeshabilitarDescarga] = useState(true);

    const methods = useForm<any>({
        defaultValues: {
            year: year,
        },
    });

    const {
        handleSubmit,
        register,
        setValue,
        formState: { errors },
    } = methods;

    useEffect(() => {
        const setValoresIniciales = async () => {
            const actualYear = new Date().getFullYear();
            const dataIngresos = await getMontoIngresos(
                actualYear,
                propiedadId
            );
            const dataEstados = await getDataReporteEstados(
                actualYear,
                propiedadId
            );
            setValue('year', actualYear);
            setYear(actualYear);

            setIngresosData(dataIngresos);
            setEstadosData(dataEstados);
        };

        setValoresIniciales();
    }, []);

    useEffect(() => {
        if (ingresosData && estadosData) {
            setDeshabilitarDescarga(isDownloadDisabled());
        }
    }, [ingresosData, estadosData]);

    const onSubmit = async (data: any) => {
        const newYear = Number(data.year);
        if (newYear !== year) {
            const ingresos = await getMontoIngresos(newYear, propiedadId);
            const estados = await getDataReporteEstados(newYear, propiedadId);
            setYear(newYear);
            setIngresosData(ingresos);
            setEstadosData(estados);
        }
    };

    const generatePDF = async () => {
        const ingresosSection = document.getElementById('ingresos-section');
        const reservasSection = document.getElementById('reservas-section');

        if (!ingresosSection || !reservasSection) {
            console.error('No se encontraron las secciones.');
            return;
        }

        try {
            const canvasIngresos = await html2canvas(ingresosSection, {
                useCORS: true,
                scale: 2,
                logging: true,
            });
            const imgDataIngresos = canvasIngresos.toDataURL('image/png');

            const doc = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight =
                (canvasIngresos.height * pdfWidth) / canvasIngresos.width;

            doc.addImage(imgDataIngresos, 'PNG', 0, 0, pdfWidth, pdfHeight);

            doc.addPage();

            const canvasReservas = await html2canvas(reservasSection, {
                useCORS: true,
                scale: 2,
                logging: true,
            });
            const imgDataReservas = canvasReservas.toDataURL('image/png');

            const pdfHeightReservas =
                (canvasReservas.height * pdfWidth) / canvasReservas.width;
            doc.addImage(
                imgDataReservas,
                'PNG',
                0,
                0,
                pdfWidth,
                pdfHeightReservas
            );

            doc.save('reportes.pdf');
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    };

    const isDownloadDisabled = () => {
        const isIngresosEmpty =
            ingresosData.totalIngresosAnuales === 0 &&
            ingresosData.totalIngresosMensuales.every(
                (item: any) => item.total === 0
            );
        const isEstadosEmpty = estadosData.every((item: any) => item.total === 0);

        return isIngresosEmpty || isEstadosEmpty;
    };

    return (
        <div>
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center gap-4 mb-6"
                >
                    <div className="w-15">
                        <Input
                            label="Año"
                            type="number"
                            {...register('year', {
                                required: 'Por favor ingresa un año.',
                                min: {
                                    value: 2000,
                                    message:
                                        'El año debe ser mayor o igual a 2000.',
                                },
                            })}
                            error={!!errors.year}
                        />
                        {errors.year && (
                            <p className="text-red-500 text-xs">
                                {errors.year.message as string}
                            </p>
                        )}
                    </div>
                    <Button type="submit" color="light-green">
                        Visualizar
                    </Button>
                    <Button
                        onClick={generatePDF}
                        color="light-green"
                        className="flex items-center space-x-1"
                        disabled={deshabilitarDescarga}
                    >
                        <MdOutlineFileDownload size={16} />
                        <span>Descargar PDF</span>
                    </Button>
                </form>
            </FormProvider>

            <div style={{ display: 'flex', borderBottom: '2px solid #ccc' }}>
                <button
                    onClick={() => setActiveTab('ingresos')}
                    style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderBottom:
                            activeTab === 'ingresos'
                                ? '2px solid #a3e635'
                                : 'none',
                        backgroundColor:
                            activeTab === 'ingresos'
                                ? '#f0f8ff'
                                : 'transparent',
                    }}
                >
                    Ingresos
                </button>
                <button
                    onClick={() => setActiveTab('reservas')}
                    style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderBottom:
                            activeTab === 'reservas'
                                ? '2px solid #a3e635'
                                : 'none',
                        backgroundColor:
                            activeTab === 'reservas'
                                ? '#f0f8ff'
                                : 'transparent',
                    }}
                >
                    Reservas
                </button>
            </div>

            <div style={{ marginTop: '20px' }}>
                {activeTab === 'ingresos' && ingresosData && (
                    <IngresosChart data={ingresosData} currentYear={year || new Date().getFullYear()} />
                )}
                {activeTab === 'reservas' && estadosData && (
                    <ReservaEstadosChart
                        data={estadosData}
                        currentYear={year || new Date().getFullYear()}
                    />
                )}
            </div>

            {ingresosData && estadosData && (
                <ChartsToPDF
                    dataIngresos={ingresosData}
                    dataEstados={estadosData}
                    currentYear={year || new Date().getFullYear()}
                />
            )}
        </div>
    );
};
