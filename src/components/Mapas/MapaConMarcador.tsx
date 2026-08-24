'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
	position: any;
	nombre?: string;
	ciudad?: string;
}

function MapaConMarcador({ position, nombre, ciudad }: Props) {
	return (
		<MapContainer
			center={position}
			zoom={13}
			style={{ height: '100%', width: '100%' }}
			className='rounded-lg'
			attributionControl={false}
		>
			<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
			<Marker
				position={position}
				icon={
					new Icon({
						iconUrl: '/map-pin.png',
						iconSize: [50, 50],
					})
				}
			>
				<Popup>
					{nombre} <br /> {ciudad} <br />
				</Popup>
			</Marker>
		</MapContainer>
	);
}

export default MapaConMarcador;
