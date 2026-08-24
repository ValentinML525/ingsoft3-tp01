import { useState, useEffect } from 'react';
import { DataIngresos } from '../Reportes';
import dynamic from 'next/dynamic';
import { Card, CardBody, Typography } from '@/components/Client/MaterialTailwindClient';


const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const extractTotales = (data: DataIngresos) => data.totalIngresosMensuales.map((ingreso) => ingreso.total);
const extractMeses = (data: DataIngresos) => data.totalIngresosMensuales.map((ingreso) => ingreso.mes);
const allZero = (data: number[]) => data.every((number) => number === 0);

interface Props {
  data: DataIngresos;
  currentYear: number;
}

export const IngresosChart = ({ data, currentYear }: Props) => {
  const [categories, setCategories] = useState(extractMeses(data));
  const [seriesData, setSeriesData] = useState<number[]>(extractTotales(data));
  const totalAnualIngreso = seriesData.reduce((total, value) => total + value, 0);
  const [config, setConfig] = useState<any>({
    type: 'line',
    height: 300,
    options: {
      chart: {
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      colors: ['#a3e635'],
      stroke: { lineCap: 'round', curve: 'smooth' },
      xaxis: {
        categories: categories,
        title: { 
          text: 'Meses', 
          style: { 
            fontSize: '16px', 
            fontWeight: 'bold' 
          }
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `$${value.toLocaleString('es-ES')}`,
        },
        title: { 
          text: 'Ingresos en pesos',
          style: { 
            fontSize: '16px', 
            fontWeight: 'bold' 
          }
        },
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
        data: seriesData.length > 0 ? seriesData : [0, 0, 0, 0, 0, 0],
      },
    ],
  });

  useEffect(() => {
    const newSeriesData = extractTotales(data);
    setSeriesData(newSeriesData);
    setConfig((prevConfig: any) => ({
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
            formatter: (value: number) => `$${value.toLocaleString('es-ES')}`,
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
          data: newSeriesData.length > 0 ? newSeriesData : [0, 0, 0, 0, 0, 0],
        },
      ],
    }));
  }, [data, currentYear]);
  

 
  return (
    <Card>
      <CardBody>
        <Typography variant='h5' className='mb-4'>
          Ingresos mensuales por año
        </Typography>
        <div id='ingresos-chart' className='mt-8'>
          {!allZero(seriesData) ? (
            <>
              <Chart {...config} />
              <Typography variant='h6' color='blue-gray' className='mt-2 text-center'>
                  Año: {currentYear} 
                </Typography>
              <Typography variant='h6' color='green' className='mt-4'>
                Ingreso total anual: ${totalAnualIngreso.toLocaleString('es-ES')}
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
