import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider({
    params: {
        addressdetails: 1,
        limit: 1,
        countrycodes: 'ar',
    },
});

interface Props {
    ubicacion?: any;
    onUbicacionSeleccionada?: (ubicacion: any) => void;
}

const MapaBusqueda = ({ ubicacion, onUbicacionSeleccionada = () => {} }: Props) => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

    useEffect(() => {
        if (ubicacion) {
            setPosition([ubicacion.latitud, ubicacion.longitud]);
        }
    }, [ubicacion]);

    const MapClickHandler = () => {
        useMapEvents({
            async click(e: any) {
                setCargandoUbicacion(true);
                const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
                setPosition(newPosition);

                const results = await provider.search({
                    query: `${e.latlng.lat},${e.latlng.lng}`,
                });
                const ubicacionSeleccionadaEnMapa: any = results[0];

                const ciudad =
                    ubicacionSeleccionadaEnMapa.raw.address.city ||
                    ubicacionSeleccionadaEnMapa.raw.address.town ||
                    ubicacionSeleccionadaEnMapa.raw.address.village ||
                    ubicacionSeleccionadaEnMapa.raw.address.municipality ||
                    ubicacionSeleccionadaEnMapa.raw.address.county ||
                    'Localidad no identificada';

                const provincia = ubicacionSeleccionadaEnMapa.raw.address.state;

                onUbicacionSeleccionada({
                    direccion: ubicacionSeleccionadaEnMapa.label,
                    latitud: e.latlng.lat,
                    longitud: e.latlng.lng,
                    ciudad: ciudad,
                    provincia: provincia,
                });
                setCargandoUbicacion(false);
            },
        });

        return null;
    };

    const UpdateMapView = ({ position }: { position: any }) => {
        const map = useMap();
        useEffect(() => {
            if (position) {
                map.setView(position, 16);
            }
        }, [position, map]);
        return null;
    };

    return (
        <MapContainer
            center={position || [-31.412895, -64.185755]}
            zoom={position ? 16 : 5}
            style={{ height: '30vh', width: '100%' }}
            attributionControl={false}
            className='z-0'
        >
            <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {position && (
                <>
                    <Marker
                        position={position}
                        icon={
                            new Icon({
                                iconUrl: '/map-pin.png',
                                iconSize: [40, 40],
                            })
                        }
                    />
                    <UpdateMapView position={position} />
                </>
            )}
            <MapClickHandler />
        </MapContainer>
    );
};

export default MapaBusqueda;
