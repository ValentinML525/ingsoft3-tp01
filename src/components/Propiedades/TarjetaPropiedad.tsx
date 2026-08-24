'use client';
import { Propiedad } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BsHousesFill } from 'react-icons/bs';
import {
  Button,
  Tooltip,
  Typography,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@/components/Client/MaterialTailwindClient';
import {
  FaEye,
  FaPencilAlt,
  FaRegTimesCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { FormPropiedad } from './FormPropiedad';
import { eliminarPropiedad } from '@/actions/propiedades/propiedades';
import { DialogExito } from '../../app/commons/Dialogs/DialogExito';

interface Props {
  propiedades: any[];
}

export const TarjetaPropiedad = ({ propiedades = [] }: Props) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<any>(null);
  const [mostrarAdvertenciaEliminacion, setMostrarAdvertenciaEliminacion] =
    useState(false);
  const [mostrarDialogExito, setMostrarDialogExito] = useState(false);
  const [eliminandoPropiedad, setEliminandoPropiedad] = useState(false);

  const router = useRouter();

  const handleVerDetalles = (propiedadId: number) => {
    router.push(`/dashboard/propiedades/${propiedadId}/unidades`);
  };

  const handleEditar = (propiedadAEditar: any) => {
    setPropiedadSeleccionada(propiedadAEditar);
    setMostrarForm(true);
  };

  const handleEliminar = (propiedadAEliminar: any) => {
    setPropiedadSeleccionada(propiedadAEliminar);
    setMostrarAdvertenciaEliminacion(true);
  };

  const handleAtras = () => {
    setMostrarAdvertenciaEliminacion(false);
  };

  const handleConfirmarEliminacion = async () => {
    setEliminandoPropiedad(true);

    try {
      const ok = await eliminarPropiedad(propiedadSeleccionada.id);

      setEliminandoPropiedad(false);

      if (ok) {
        setMostrarDialogExito(true);
      }
    } catch (error) {
      console.log('====================================');
      console.log('Error al eliminar propiedad: ', error);
      console.log('====================================');
    }
  };

  const finalizarEliminacion = () => {
    setMostrarDialogExito(false);
    setMostrarAdvertenciaEliminacion(false);
    router.refresh();
  };


  return (
    <>
      {mostrarDialogExito && (
        <DialogExito accionAlConfirmar={finalizarEliminacion} />
      )}

      {mostrarAdvertenciaEliminacion && (
        <Dialog
          open={mostrarAdvertenciaEliminacion}
          handler={handleEliminar}
          size='sm'
        >
          <DialogHeader>
            <div className='flex flex-col w-full justify-center gap-5 items-center'>
              <FaExclamationTriangle size={40} className='text-yellow-700' />
              Atención!
            </div>
          </DialogHeader>
          <DialogBody className='flex flex-col text-center gap-3'>
            <Typography variant='h4'>
              Está a punto de eliminar una Propiedad que no cuenta con unidades asociadas.
            </Typography>

            <Typography color='red' variant='h4' className='mt-2'>
              Esta acción no se puede deshacer.
            </Typography>

            <Typography variant='lead' className='mt-5'>
              ¿Está seguro que desea continuar?
            </Typography>
          </DialogBody>
          <DialogFooter className='flex justify-center gap-10'>
            <Button variant='outlined' onClick={handleAtras} className='w-fit'>
              <span>Atrás</span>
            </Button>
            <Button
              variant='gradient'
              color='red'
              onClick={handleConfirmarEliminacion}
              className='w-fit'
              loading={eliminandoPropiedad}
            >
              <span>Confirmar</span>
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {propiedades &&
          propiedades.map((propiedad) => {
			const tiene = propiedad.unidades.length > 0;
			
            return (
              <div
                key={propiedad.id}
                className='relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-xl p-3 max-w-xs md:max-w-3xl border border-white bg-white'
              >
                <div className='flex flex-col w-full'>
                  <div className='w-full md:w-1/4 bg-white grid place-items-center '>
                    <BsHousesFill size={50} className='font-bold text-naranja' />
                  </div>
                  <div className='w-full bg-white flex flex-col space-y-2 p-3 justify-center'>
                    <h3 className='font-black text-gray-800 md:text-3xl text-xl'>
                      {propiedad.nombre}
                    </h3>

                    <Typography>{propiedad.ubicacion.ciudad}</Typography>
                  </div>
                  <div className='flex gap-3 justify-end'>
                    <Tooltip content='Ver Unidades'>
                      <Button
                        size='md'
                        variant='text'
                        color='light-green'
                        onClick={() => handleVerDetalles(propiedad.id)}
                      >
                        <FaEye size={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Editar'>
                      <Button
                        size='md'
                        variant='text'
                        color='orange'
                        onClick={() => handleEditar(propiedad)}
                      >
                        <FaPencilAlt size={18} />
                      </Button>
                    </Tooltip>
                    <Tooltip content={tiene ? 'No se puede eliminar una propiedad con unidades' : 'Eliminar propiedad'}>
                      <div>
						<Button
							size='md'
							variant='text'
							color='red'
							onClick={() => handleEliminar(propiedad)}
							disabled={tiene}
						>
							<FaRegTimesCircle size={20} />
						</Button>
					   </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {mostrarForm && (
        <FormPropiedad
          isOpen={mostrarForm}
          setIsOpen={setMostrarForm}
          propiedadAEditar={propiedadSeleccionada}
        />
      )}
    </>
  );
};

export default TarjetaPropiedad;
