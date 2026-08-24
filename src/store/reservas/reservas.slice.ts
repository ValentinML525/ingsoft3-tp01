import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	id: '',
	unidad: '',
	fechaInicio: '',
	fechaFin: '',
	cantidadPersonas: '',
	precioTotal: '',
	estado: '',
	pagoParcial: '',
	observaciones: '',
	unidadId: '',
	clienteId: '',
	cliente: '',
	propiedadId: '',
};

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {}
});

export const reservasActions = reservasSlice.actions;

export default reservasSlice.reducer;