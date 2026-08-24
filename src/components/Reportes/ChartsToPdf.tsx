import React, { useEffect, useState } from 'react';
import { DataIngresos, TotalPorEstado } from './Reportes';
import { EstadoReserva } from '@prisma/client';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
    dataIngresos: DataIngresos;
    dataEstados: TotalPorEstado[];
    currentYear: number;
}

const meses: Record<string, string> = {
    ene: 'Enero',
    feb: 'Febrero',
    mar: 'Marzo',
    abr: 'Abril',
    may: 'Mayo',
    jun: 'Junio',
    jul: 'Julio',
    ago: 'Agosto',
    sept: 'Septiembre',
    oct: 'Octubre',
    nov: 'Noviembre',
    dic: 'Diciembre',
};

const estadoColores: { [key: string]: string } = {
    SOLICITADA: '#808080',
    PENDIENTE: '#FFD700',
    PAGO_PARCIAL: '#87CEEB',
    PAGADA: '#3CB371',
    CANCELADA: '#FF0000',
};

const extractLabels = (data: TotalPorEstado[]) => {
    return data.map((totalEstado) =>
        totalEstado.estado === EstadoReserva.PAGO_PARCIAL
            ? 'PAGO PARCIAL'
            : totalEstado.estado
    );
};

const extractTotalesEstados = (data: TotalPorEstado[]) => {
    return data.map((totalEstado) => totalEstado.total);
};

const extractTotalesIngresos = (data: DataIngresos) =>
    data.totalIngresosMensuales.map((ingreso) => ingreso.total);

const extractMeses = (data: DataIngresos) =>
    data.totalIngresosMensuales.map((ingreso) => ingreso.mes);

const generateSeriesData = (data: TotalPorEstado[]) => {
    const series: any[] = [];
    const estados = Object.keys(estadoColores);
    estados.forEach((estado) => {
        const seriesData = new Array(12).fill(0);
        data.forEach((d) => {
            if (d.estado === estado) {
                const monthIndex = new Date(d.fechaInicio).getMonth();
                seriesData[monthIndex] += d.total;
            }
        });
        const color = estadoColores[estado] || '#000000';
        series.push({ name: estado, data: seriesData, color });
    });
    return series;
};

export const ChartsToPDF = ({
    dataIngresos,
    dataEstados,
    currentYear,
}: Props) => {
    const ingresosTableData = dataIngresos.totalIngresosMensuales;
    const estadosTableData = dataEstados;

    const [mesesIngresos, setMesesIngresos] = useState(
        extractMeses(dataIngresos)
    );
    const [serieIngresos, setSerieIngresos] = useState(
        extractTotalesIngresos(dataIngresos)
    );
    const [seriesData, setSeriesData] = useState(
        generateSeriesData(dataEstados)
    );
    const [estados, setEstados] = useState(extractLabels(dataEstados));
    const [serieEstados, setSerieEstados] = useState(
        extractTotalesEstados(dataEstados)
    );

    const [ingresosConfig, setIngresosConfig] = useState<any>({
        type: 'line',
        height: 250,
        options: {
            chart: {
                toolbar: { show: false },
            },
            dataLabels: { enabled: false },
            colors: ['#a3e635'],
            stroke: { lineCap: 'round', curve: 'smooth' },
            xaxis: {
                categories: mesesIngresos,
                title: {
                    text: 'Meses',
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold',
                    },
                },
            },
            yaxis: {
                labels: {
                    formatter: (value: number) =>
                        `$${value.toLocaleString('es-ES')}`,
                },
                title: { text: 'Ingresos en pesos' },
            },
            grid: {
                borderColor: '#dddddd',
                strokeDashArray: 5,
            },
            tooltip: { theme: 'dark' },
        },
        series: [
            {
                name: 'Ingresos',
                data:
                    serieIngresos.length > 0
                        ? serieIngresos
                        : [0, 0, 0, 0, 0, 0],
            },
        ],
    });

    const [estadosConfig, setEstadosConfig] = useState<any>({
        type: 'bar',
        height: 350,
        options: {
            chart: { toolbar: { show: false } },
            plotOptions: { bar: { horizontal: false } },
            xaxis: {
                categories: [
                    'Ene',
                    'Feb',
                    'Mar',
                    'Abr',
                    'May',
                    'Jun',
                    'Jul',
                    'Ago',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dic',
                ],
                labels: { rotate: -45, style: { fontSize: '12px' } },
                title: { text: 'Meses' },
            },
            yaxis: {
                title: { text: 'Cantidad de Reservas' },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                itemMargin: { horizontal: 10, vertical: 5 },
            },
            fill: { opacity: 1 },
            colors: ['#3CB371', '#FFD700', '#87CEEB', '#FF0000', '#808080'],
        },
        series: seriesData,
    });

    useEffect(() => {
        const newSeriesData = extractTotalesIngresos(dataIngresos);
        setSerieIngresos(newSeriesData);
        setIngresosConfig((prevConfig: any) => ({
            type: 'line',
            height: 300,
            options: {
                chart: { toolbar: { show: false } },
                dataLabels: { enabled: false },
                colors: ['#a3e635'],
                stroke: { lineCap: 'round', curve: 'smooth' },
                xaxis: prevConfig.options.xaxis,
                yaxis: {
                    labels: {
                        formatter: (value: number) =>
                            `$${value.toLocaleString('es-ES')}`,
                    },
                    title: { text: 'Ingresos en pesos' },
                },
                grid: {
                    borderColor: '#dddddd',
                    strokeDashArray: 5,
                },
                tooltip: { theme: 'dark' },
            },
            series: [
                {
                    name: 'Ingresos',
                    data:
                        newSeriesData.length > 0
                            ? newSeriesData
                            : [0, 0, 0, 0, 0, 0],
                },
            ],
        }));

        const updatedSeriesData = generateSeriesData(dataEstados);
        setSeriesData(updatedSeriesData);
        setEstadosConfig((prevConfig: any) => ({
            ...prevConfig,
            series: updatedSeriesData,
        }));
    }, [dataIngresos, dataEstados, currentYear]);

    const formatAmount = (amount: number) =>
        `$${amount.toLocaleString('es-ES')}`;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const renderIngresosTable = () => {
        return (
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    marginTop: '20px',
                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th
                            style={{
                                textAlign: 'left',
                                padding: '12px',
                                borderBottom: '2px solid #ddd',
                            }}
                        >
                            Mes
                        </th>
                        <th
                            style={{
                                textAlign: 'right',
                                padding: '12px',
                                borderBottom: '2px solid #ddd',
                            }}
                        >
                            Monto
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {ingresosTableData.map((item, index) => (
                        <tr
                            key={index}
                            style={{
                                backgroundColor:
                                    index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                            }}
                        >
                            <td
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #ddd',
                                }}
                            >
                                {meses[item.mes] || 'Mes no válido'}
                            </td>
                            <td
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #ddd',
                                    textAlign: 'right',
                                }}
                            >
                                {formatAmount(item.total)}
                            </td>
                        </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>
                            Total
                        </td>
                        <td
                            style={{
                                padding: '12px',
                                fontWeight: 'bold',
                                textAlign: 'right',
                            }}
                        >
                            {formatAmount(
                                ingresosTableData.reduce(
                                    (acc, item) => acc + item.total,
                                    0
                                )
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    if (!seriesData || seriesData.length === 0) {
        return <p>Loading data...</p>;
    }
    const renderReservasTable = () => {
        const meses = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
        ];

        return (
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    marginTop: '20px',
                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th
                            style={{
                                textAlign: 'left',
                                padding: '12px',
                                borderBottom: '2px solid #ddd',
                            }}
                        >
                            Mes
                        </th>
                        {seriesData.map((serie, index) => (
                            <th
                                key={index}
                                style={{
                                    textAlign: 'right',
                                    padding: '12px',
                                    borderBottom: '2px solid #ddd',
                                }}
                            >
                                {serie.name}
                            </th>
                        ))}
                        <th
                            style={{
                                textAlign: 'right',
                                padding: '12px',
                                borderBottom: '2px solid #ddd',
                            }}
                        >
                            Total Mensual
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {meses.map((mes, mesIndex) => (
                        <tr
                            key={mesIndex}
                            style={{
                                backgroundColor:
                                    mesIndex % 2 === 0 ? '#ffffff' : '#f9f9f9',
                            }}
                        >
                            <td
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #ddd',
                                }}
                            >
                                {mes}
                            </td>
                            {seriesData.map((serie, serieIndex) => (
                                <td
                                    key={serieIndex}
                                    style={{
                                        padding: '12px',
                                        borderBottom: '1px solid #ddd',
                                        textAlign: 'right',
                                    }}
                                >
                                    {serie.data[mesIndex]}
                                </td>
                            ))}
                            <td
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #ddd',
                                    textAlign: 'right',
                                }}
                            >
                                {seriesData.reduce(
                                    (acc, serie) => acc + serie.data[mesIndex],
                                    0
                                )}
                            </td>
                        </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>
                            Total Anual
                        </td>
                        {seriesData.map((serie, serieIndex) => (
                            <td
                                key={serieIndex}
                                style={{
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    textAlign: 'right',
                                }}
                            >
                                {serie.data.reduce((acc: number, val: number) => acc + val, 0)}
                            </td>
                        ))}
                        <td
                            style={{
                                padding: '12px',
                                fontWeight: 'bold',
                                textAlign: 'right',
                            }}
                        >
                            {seriesData.reduce(
                                (acc: number, serie: any) =>
                                    acc + serie.data.reduce((a: number, b: number) => a + b, 0),
                                0
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    return (
        <div
            id='charts-to-pdf'
            style={{
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
                width: '100%',
                maxWidth: '1000px',
                padding: '40px',
                backgroundColor: '#ffffff',
                margin: '0 auto',
                fontFamily: 'Arial, sans-serif',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
            }}
        >
            <div id='ingresos-section' style={{ marginBottom: '60px' }}>
                <h1
                    className='bg-light-green-600'
                    style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: 'white',
                        padding: '15px',
                        textAlign: 'center',
                    }}
                >
                    Reportes del año {currentYear}
                    <p
                        style={{
                            fontSize: '16px',
                            color: '#555',
                            marginTop: '10px',
                            textAlign: 'center',
                        }}
                    >
                        Generación de reporte: {formattedDate}
                    </p>
                </h1>

                <h2
                    className='ml-3'
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginTop: '30px',
                        marginBottom: '20px',
                        color: '#333',
                    }}
                >
                    Ingresos mensuales
                </h2>
                <div
                    style={{
                        marginBottom: '30px',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        padding: '20px',
                    }}
                >
                    <Chart {...ingresosConfig} />
                </div>
                {renderIngresosTable()}
            </div>

            <div id='reservas-section' style={{ marginBottom: '60px' }}>
                <h2
                    className='ml-3'
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginTop: '30px',
                        marginBottom: '20px',
                        color: '#333',
                    }}
                >
                    Reservas mensuales por estado
                </h2>
                <div
                    style={{
                        marginBottom: '30px',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        padding: '20px',
                    }}
                >
                    <Chart {...estadosConfig} />
                </div>
                {renderReservasTable()}
            </div>
        </div>
    );
};
