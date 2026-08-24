import { Unidad } from '@prisma/client';
import { Chip, Typography } from '../../Client/MaterialTailwindClient';
import { IconoServicio } from '@/components/Servicios/IconoServicio';
import MapaConMarcador from '@/components/Mapas/MapaConMarcador';

export const DescripcionUnidad = ({ unidad }: { unidad: any }) => {
    const position = [
        unidad.propiedad.ubicacion.latitud,
        unidad.propiedad.ubicacion.longitud,
    ];
    return (
        <div className="flex w-full flex-col gap-5">
            <div>
                <Typography variant="h2">{unidad.nombre}</Typography>
            </div>
            <div>
                <Typography>{unidad.descripcion}</Typography>
            </div>
            <div>
                <Typography variant="h3">Servicios</Typography>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 place-items-center">
                {unidad.servicios.length > 0 &&
                    unidad.servicios.map((servicio: any, index: number) => (
                        <div key={index} className="flex flex-col w-fit">
                            <Chip
                                size="lg"
                                variant="outlined"
                                value={servicio.servicio.nombre}
                                icon={
                                    <IconoServicio
                                        svgString={servicio.servicio.icon}
                                    />
                                }
                                className="p-3 shadow-md cursor-pointer"
                            />
                        </div>
                    ))}
            </div>
            <div className="w-full h-64 mt-5">
                <MapaConMarcador
                    position={position}
                    nombre={unidad.propiedad.nombre}
                    ciudad={unidad.propiedad.ubicacion.ciudad}
                />
            </div>
        </div>
    );
};
