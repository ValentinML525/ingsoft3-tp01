import React, { useState, useEffect } from 'react';
import { TotalPorEstado } from '../Reportes';
import dynamic from 'next/dynamic';
import { EstadoReserva } from '@prisma/client';
import { Card, CardBody, Typography } from '@/components/Client/MaterialTailwindClient';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const estadoColores: { [key: string]: string } = {
  'SOLICITADA': '#808080',
  'PENDIENTE': '#FFD700',
  'PAGO_PARCIAL': '#87CEEB',
  'PAGADA': '#3CB371',
  'CANCELADA': '#FF0000',
};

interface Props {
  data: TotalPorEstado[];
  currentYear: number;
}

const generateSeriesData = (data: TotalPorEstado[], categories: string[]) => {
  const series: any[] = [];
  const estados = Array.from(new Set(data.map(d => d.estado)));

  estados.forEach(estado => {
    const seriesData = new Array(12).fill(0); 
    data.forEach(d => {
      if (d.estado === estado) {
        const monthIndex = new Date(d.fechaInicio).getMonth(); 
        seriesData[monthIndex] += d.total;
      }
    });
    const color = estadoColores[estado] || '#000000'; 
    const displayName = estado === 'PAGO_PARCIAL' ? 'PAGO PARCIAL' : estado;
    series.push({ name: displayName, data: seriesData, color });
  });

  return series;
};

export const ReservaEstadosChart = ({ data, currentYear }: Props) => {
  const [seriesData, setSeriesData] = useState(generateSeriesData(data, []));
  const [categories, setCategories] = useState<string[]>([
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ]);

  useEffect(() => {
    setSeriesData(generateSeriesData(data, categories));
  }, [data, currentYear]);

  const chartOptions: any = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      height: '100%', 
      width: '100%' 
    },
    plotOptions: {
      bar: { horizontal: false } 
    },
    colors: ['#3CB371', '#FFD700', '#87CEEB', '#FF0000', '#808080'], 
    xaxis: {
      categories, 
      title: { 
        text: 'Meses', 
        style: { 
          fontSize: '16px', 
          fontWeight: 'bold' 
        }
      },
      labels: {
        rotate: -45, 
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: { 
        text: 'Cantidad de Reservas',
        style: { 
          fontSize: '16px', 
          fontWeight: 'bold' 
        }
      },
      labels: {
        formatter: (value: number) => value.toLocaleString('es-ES'), 
      }
    },
    legend: {
      position: 'top', 
      horizontalAlign: 'center', 
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    fill: {
      opacity: 1
    },
    grid: {
      show: true, 
      borderColor: '#e7e7e7',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: true }
      }
    }
  };

  return (
    <Card>
      <CardBody>
        <div>
          <Typography variant='h5' color='blue-gray' className='mb-4'>
            Reservas mensuales por estado
          </Typography>
        </div>
        <div id='reservas-chart' className='mt-8'>
          {seriesData.length > 0 ? (
            <>
              <Chart options={chartOptions} series={seriesData} type='bar' height={500} width='100%' />
              <Typography variant='h6' color='blue-gray' className='mt-2 text-center'>
                Año: {currentYear}
              </Typography>
              <Typography variant='h6' color='green' className='mt-4'>
                Total anual de reservas: {seriesData.reduce((acc: number, serie: any) => acc + serie.data.reduce((a: number, b: number) => a + b, 0), 0).toLocaleString('es-ES')}
              </Typography>
            </>
          ) : (
            <Typography variant='h6' color='red' className='text-center'>
              No hay datos disponibles para el año seleccionado.
            </Typography>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
