'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Cliente, EstadoReserva } from '@prisma/client';
import { FormReserva } from '../Reservas/FormReserva';

interface CalendarioEvento {
	title: string;
	start: Date;
	end: Date;
	backgroundColor: string;
	borderColor: string;
	textColor: string;
	extendedProps: {
		unidad: string;
		fechaInicio: Date;
		fechaFin: Date;
		cantidadPersonas: number;
		precioTotal: number;
		estado: EstadoReserva;
		pagoParcial: number;
		observaciones: string;
		unidadId: number;
		clienteId: number;
		cliente: Cliente;
	};
}

interface CalendarioProps {
	eventos: any[];
	onYearChange?: (year: number) => void;
	refrescar?: () => void;
}

export const Calendario = ({
	eventos,
	onYearChange = () => {},
	refrescar = () => {},
}: CalendarioProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	//La seleccion puede ser un evento o un conjunto de fechas
	const [seleccion, setSeleccion] = useState<any>(null);

	const handleDatesSet = (arg: any) => {
		const newDate = new Date(arg.start);
		newDate.setDate(newDate.getDate() + 7);
		const newYear = newDate.getFullYear();
		onYearChange(newYear);
	};

	const handleDateSelect = (selectInfo: any) => {
		//Workaround porque fullcalendar trae por defecto el dia siguiente al ultimo seleccionado
		selectInfo.end.setDate(selectInfo.end.getDate() - 1);

		const fechasSeleccionadas = {
			fechaInicio: selectInfo.start,
			fechaFin: selectInfo.end,
		};

		if (fechasSeleccionadas.fechaFin > fechasSeleccionadas.fechaInicio) {
			setSeleccion(fechasSeleccionadas);
			setIsModalOpen(true);
		}
	};

	const handleEventClick = (info: any) => {
		const reserva = {
			...info.event.extendedProps,
		};
		setSeleccion(reserva);
		setIsModalOpen(true);
	};

	const unidadesColores = Array.from(
		new Set(eventos.map((evento) => evento.extendedProps.unidad))
	).map((unidad) => {
		const evento = eventos.find((e) => e.extendedProps.unidad === unidad);
		return { unidad, color: evento ? evento.backgroundColor : '#000000' };
	});


	return (
		<div className='w-full shadow-lg [&_.fc-button-primary]:bg-[#9ACD32] [&_.fc-button-primary]:border-[#9ACD32] [&_.fc-button-primary:hover]:bg-[#8AB82D] [&_.fc-button-primary:hover]:border-[#8AB82D] [&_.fc-button-active]:bg-[#8AB82D] [&_.fc-button-active]:border-[#8AB82D] [&_.fc-event]:!rounded-xl [&_.fc-event-main]:!rounded-xl'>
			<div className='p-6'>
				<FullCalendar
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView='dayGridMonth'
					events={eventos}
					locale={esLocale}
					displayEventTime={false}
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,dayGridWeek',
					}}
					datesSet={handleDatesSet}
					buttonIcons={{
						prev: 'chevron-left',
						next: 'chevron-right',
					}}
					buttonText={{
						today: 'Hoy',
						month: 'Mes',
						week: 'Semana',
						prev: 'Anterior',
						next: 'Siguiente',
					}}
					selectable={true}
					select={handleDateSelect}
					eventClick={handleEventClick}
					eventContent={(eventInfo) => {
						const estado = eventInfo.event.extendedProps.estado;
						let eventStyle: React.CSSProperties = {};

						switch (estado) {
							case EstadoReserva.PAGADA:
								eventStyle = {
									backgroundColor: eventInfo.event.backgroundColor,
									border: `1px solid ${eventInfo.event.borderColor}`,
								};
								break;
							case EstadoReserva.PAGO_PARCIAL:
								eventStyle = {
									background: `repeating-linear-gradient(
                    45deg,
                    ${eventInfo.event.backgroundColor},
                    ${eventInfo.event.backgroundColor} 10px,
                    white 10px,
                    white 20px
                  )`,
									border: `1px solid ${eventInfo.event.borderColor}`,
								};
								break;
							case EstadoReserva.PENDIENTE:
								eventStyle = {
									backgroundColor: 'white',
									border: `1px solid ${eventInfo.event.borderColor}`,
								};
								break;
							case EstadoReserva.SOLICITADA:
								eventStyle = {
									backgroundColor: 'white',
									border: `2px dashed ${eventInfo.event.borderColor}`,
									borderImage: `repeating-linear-gradient(to right, ${eventInfo.event.borderColor}, ${eventInfo.event.borderColor} 10px, transparent 10px, transparent 20px) 1`,
								};
								break;
						}

						return (
							<div
								className='flex flex-col p-1 overflow-hidden text-sm w-full h-full rounded-xl'
								style={eventStyle}
							>
								<span className='font-semibold z-10' style={{ color: 'black' }}>
									{eventInfo.event.extendedProps.unidad}
								</span>
								<span
									className='truncate z-10 font-bold'
									style={{ color: 'black' }}
								>
									{eventInfo.event.title}
								</span>
							</div>
						);
					}}
					height='auto'
					aspectRatio={1.8}
				/>
				<div className='mt-4 flex flex-wrap gap-4'>
					<div className='flex items-center'>
						<div className='w-4 h-4 mr-2 bg-[#9ACD32]'></div>
						<span>Pagada</span>
					</div>
					<div className='flex items-center'>
						<div
							className='w-4 h-4 mr-2'
							style={{
								background:
									'repeating-linear-gradient(45deg, #9ACD32, #9ACD32 5px, white 5px, white 10px)',
							}}
						></div>
						<span>Pago Parcial</span>
					</div>
					<div className='flex items-center'>
						<div className='w-4 h-4 mr-2 bg-white border-2 border-[#9ACD32]'></div>
						<span>Pendiente</span>
					</div>
					<div className='flex items-center'>
						<div className='w-4 h-4 mr-2 bg-white border-2 border-[#9ACD32] border-dashed'></div>
						<span>Solicitada</span>
					</div>
				</div>
				<div className='mt-4 flex flex-wrap gap-4'>
					{unidadesColores.map(({ unidad, color }) => (
						<div key={unidad} className='flex items-center'>
							<div
								className='w-4 h-4 mr-2'
								style={{ backgroundColor: color }}
							></div>
							<span>{unidad}</span>
						</div>
					))}
				</div>
			</div>
			{isModalOpen && (
				<FormReserva
					isOpen={true}
					setIsOpen={setIsModalOpen}
					isFromCalendario={true}
					reservaAEditar={seleccion}
					refrescar={refrescar}
				/>
			)}
		</div>
	);
};
