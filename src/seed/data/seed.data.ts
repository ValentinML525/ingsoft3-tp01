import { EstadoReserva } from '@prisma/client';

interface SeedUser {
    email: string;
    password: string;
    name: string;
    role: 'Administrador' | 'Propietario' | 'Usuario';
}

export const initialData = {
    /* user: [
		{
			email: 'test@google.com', 
			name: 'Administrador Prueba',
			password: bcryptjs.hashSync('123456'),
			role: Role.Administrador
		},
		{
			email: 'propietario@google.com', 
			name: 'Propietario Prueba',
			password: bcryptjs.hashSync('123456'),
			role: Role.Propietario
		}
	], */

    servicios: [
        {
            nombre: 'Aire acondicionado',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 0c13.3 0 24 10.7 24 24l0 46.1 23-23c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-57 57 0 76.5 66.2-38.2 20.9-77.8c3.4-12.8 16.6-20.4 29.4-17s20.4 16.6 17 29.4L373 142.2l37.1-21.4c11.5-6.6 26.2-2.7 32.8 8.8s2.7 26.2-8.8 32.8L397 183.8l31.5 8.4c12.8 3.4 20.4 16.6 17 29.4s-16.6 20.4-29.4 17l-77.8-20.9L272 256l66.2 38.2 77.8-20.9c12.8-3.4 26 4.2 29.4 17s-4.2 26-17 29.4L397 328.2l37.1 21.4c11.5 6.6 15.4 21.3 8.8 32.8s-21.3 15.4-32.8 8.8L373 369.8l8.4 31.5c3.4 12.8-4.2 26-17 29.4s-26-4.2-29.4-17l-20.9-77.8L248 297.6l0 76.5 57 57c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-23-23 0 46.1c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-46.1-23 23c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l57-57 0-76.5-66.2 38.2-20.9 77.8c-3.4 12.8-16.6 20.4-29.4 17s-20.4-16.6-17-29.4L75 369.8 37.9 391.2c-11.5 6.6-26.2 2.7-32.8-8.8s-2.7-26.2 8.8-32.8L51 328.2l-31.5-8.4c-12.8-3.4-20.4-16.6-17-29.4s16.6-20.4 29.4-17l77.8 20.9L176 256l-66.2-38.2L31.9 238.6c-12.8 3.4-26-4.2-29.4-17s4.2-26 17-29.4L51 183.8 13.9 162.4c-11.5-6.6-15.4-21.3-8.8-32.8s21.3-15.4 32.8-8.8L75 142.2l-8.4-31.5c-3.4-12.8 4.2-26 17-29.4s26 4.2 29.4 17l20.9 77.8L200 214.4l0-76.5L143 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l23 23L200 24c0-13.3 10.7-24 24-24z"/></svg>',
        },
        {
            nombre: 'Pileta',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M309.5 178.4L447.9 297.1c-1.6 .9-3.2 2-4.8 3c-18 12.4-40.1 20.3-59.2 20.3c-19.6 0-40.8-7.7-59.2-20.3c-22.1-15.5-51.6-15.5-73.7 0c-17.1 11.8-38 20.3-59.2 20.3c-10.1 0-21.1-2.2-31.9-6.2C163.1 193.2 262.2 96 384 96l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-26.9 0-52.3 6.6-74.5 18.4zM160 160A64 64 0 1 1 32 160a64 64 0 1 1 128 0zM306.5 325.9C329 341.4 356.5 352 384 352c26.9 0 55.4-10.8 77.4-26.1c0 0 0 0 0 0c11.9-8.5 28.1-7.8 39.2 1.7c14.4 11.9 32.5 21 50.6 25.2c17.2 4 27.9 21.2 23.9 38.4s-21.2 27.9-38.4 23.9c-24.5-5.7-44.9-16.5-58.2-25C449.5 405.7 417 416 384 416c-31.9 0-60.6-9.9-80.4-18.9c-5.8-2.7-11.1-5.3-15.6-7.7c-4.5 2.4-9.7 5.1-15.6 7.7c-19.8 9-48.5 18.9-80.4 18.9c-33 0-65.5-10.3-94.5-25.8c-13.4 8.4-33.7 19.3-58.2 25c-17.2 4-34.4-6.7-38.4-23.9s6.7-34.4 23.9-38.4c18.1-4.2 36.2-13.3 50.6-25.2c11.1-9.4 27.3-10.1 39.2-1.7c0 0 0 0 0 0C136.7 341.2 165.1 352 192 352c27.5 0 55-10.6 77.5-26.1c11.1-7.9 25.9-7.9 37 0z"/></svg>',
        },
        {
            nombre: 'Estacionamiento',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M135.2 117.4L109.1 192l293.8 0-26.1-74.6C372.3 104.6 360.2 96 346.6 96L165.4 96c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32l181.2 0c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2l0 144 0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L96 400l0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L0 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>',
        },
        {
            nombre: 'Calefacción',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M153.6 29.9l16-21.3C173.6 3.2 180 0 186.7 0C198.4 0 208 9.6 208 21.3V43.5c0 13.1 5.4 25.7 14.9 34.7L307.6 159C356.4 205.6 384 270.2 384 337.7C384 434 306 512 209.7 512H192C86 512 0 426 0 320v-3.8c0-48.8 19.4-95.6 53.9-130.1l3.5-3.5c4.2-4.2 10-6.6 16-6.6C85.9 176 96 186.1 96 198.6V288c0 35.3 28.7 64 64 64s64-28.7 64-64v-3.9c0-18-7.2-35.3-19.9-48l-38.6-38.6c-24-24-37.5-56.7-37.5-90.7c0-27.7 9-54.8 25.6-76.9z"/></svg>',
        },
        {
            nombre: 'Wifi gratuito',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2 .9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"/></svg>',
        },
        {
            nombre: 'Desayuno incluido',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M96 64c0-17.7 14.3-32 32-32l320 0 64 0c70.7 0 128 57.3 128 128s-57.3 128-128 128l-32 0c0 53-43 96-96 96l-192 0c-53 0-96-43-96-96L96 64zM480 224l32 0c35.3 0 64-28.7 64-64s-28.7-64-64-64l-32 0 0 128zM32 416l512 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>',
        },
        {
            nombre: 'TV por cable',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M64 64l0 288 512 0 0-288L64 64zM0 64C0 28.7 28.7 0 64 0L576 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 416c-35.3 0-64-28.7-64-64L0 64zM128 448l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-384 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>',
        },
        {
            nombre: 'Spa',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M183.1 235.3c33.7 20.7 62.9 48.1 85.8 80.5c7 9.9 13.4 20.3 19.1 31c5.7-10.8 12.1-21.1 19.1-31c22.9-32.4 52.1-59.8 85.8-80.5C437.6 207.8 490.1 192 546 192l9.9 0c11.1 0 20.1 9 20.1 20.1C576 360.1 456.1 480 308.1 480L288 480l-20.1 0C119.9 480 0 360.1 0 212.1C0 201 9 192 20.1 192l9.9 0c55.9 0 108.4 15.8 153.1 43.3zM301.5 37.6c15.7 16.9 61.1 71.8 84.4 164.6c-38 21.6-71.4 50.8-97.9 85.6c-26.5-34.8-59.9-63.9-97.9-85.6c23.2-92.8 68.6-147.7 84.4-164.6C278 33.9 282.9 32 288 32s10 1.9 13.5 5.6z"/></svg>',
        },
        {
            nombre: 'Gimnasio',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M96 64c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 160 0 64 0 160c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-64-32 0c-17.7 0-32-14.3-32-32l0-64c-17.7 0-32-14.3-32-32s14.3-32 32-32l0-64c0-17.7 14.3-32 32-32l32 0 0-64zm448 0l0 64 32 0c17.7 0 32 14.3 32 32l0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 64c0 17.7-14.3 32-32 32l-32 0 0 64c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-160 0-64 0-160c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32zM416 224l0 64-192 0 0-64 192 0z"/></svg>',
        },
        {
            nombre: 'Servicio a la habitación',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"/></svg>',
        },
        {
            nombre: 'Restaurante',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 0C400 0 288 32 288 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 0-112 0-208c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7L80 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16l0 134.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8L64 16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"/></svg>',
        },
        {
            nombre: 'Bar',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M432 240c53 0 96-43 96-96s-43-96-96-96c-35.5 0-66.6 19.3-83.2 48l-52.6 0C316 40.1 369.3 0 432 0c79.5 0 144 64.5 144 144s-64.5 144-144 144c-27.7 0-53.5-7.8-75.5-21.3l35.4-35.4c12.2 5.6 25.8 8.7 40.1 8.7zM1.8 142.8C5.5 133.8 14.3 128 24 128l368 0c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-177 177L232 464l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0-88 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-118.1L7 169c-6.9-6.9-8.9-17.2-5.2-26.2z"/></svg>',
        },
        {
            nombre: 'Actividades recreativas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M417.3 360.1l-71.6-4.8c-5.2-.3-10.3 1.1-14.5 4.2s-7.2 7.4-8.4 12.5l-17.6 69.6C289.5 445.8 273 448 256 448s-33.5-2.2-49.2-6.4L189.2 372c-1.3-5-4.3-9.4-8.4-12.5s-9.3-4.5-14.5-4.2l-71.6 4.8c-17.6-27.2-28.5-59.2-30.4-93.6L125 228.3c4.4-2.8 7.6-7 9.2-11.9s1.4-10.2-.5-15l-26.7-66.6C128 109.2 155.3 89 186.7 76.9l55.2 46c4 3.3 9 5.1 14.1 5.1s10.2-1.8 14.1-5.1l55.2-46c31.3 12.1 58.7 32.3 79.6 57.9l-26.7 66.6c-1.9 4.8-2.1 10.1-.5 15s4.9 9.1 9.2 11.9l60.7 38.2c-1.9 34.4-12.8 66.4-30.4 93.6zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm14.1-325.7c-8.4-6.1-19.8-6.1-28.2 0L194 221c-8.4 6.1-11.9 16.9-8.7 26.8l18.3 56.3c3.2 9.9 12.4 16.6 22.8 16.6l59.2 0c10.4 0 19.6-6.7 22.8-16.6l18.3-56.3c3.2-9.9-.3-20.7-8.7-26.8l-47.9-34.8z"/></svg>',
        },
        {
            nombre: 'Servicio de lavandería',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"> <path d="M96 24c0-13.3 10.7-24 24-24l80 0c13.3 0 24 10.7 24 24l0 24 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 96C74.7 96 64 85.3 64 72s10.7-24 24-24l8 0 0-24zM0 256c0-70.7 57.3-128 128-128l128 0c70.7 0 128 57.3 128 128l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256zm256 0l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32z"/></svg>',
        },
        {
            nombre: 'Cuidado de niños',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> <path d="M320 0a40 40 0 1 1 0 80 40 40 0 1 1 0-80zm44.7 164.3L375.8 253c1.6 13.2-7.7 25.1-20.8 26.8s-25.1-7.7-26.8-20.8l-4.4-35-7.6 0-4.4 35c-1.6 13.2-13.6 22.5-26.8 20.8s-22.5-13.6-20.8-26.8l11.1-88.8L255.5 181c-10.1 8.6-25.3 7.3-33.8-2.8s-7.3-25.3 2.8-33.8l27.9-23.6C271.3 104.8 295.3 96 320 96s48.7 8.8 67.6 24.7l27.9 23.6c10.1 8.6 11.4 23.7 2.8 33.8s-23.7 11.4-33.8 2.8l-19.8-16.7zM40 64c22.1 0 40 17.9 40 40l0 40 0 80 0 40.2c0 17 6.7 33.3 18.7 45.3l51.1 51.1c8.3 8.3 21.3 9.6 31 3.1c12.9-8.6 14.7-26.9 3.7-37.8l-15.2-15.2-32-32c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l32 32 15.2 15.2c0 0 0 0 0 0l25.3 25.3c21 21 32.8 49.5 32.8 79.2l0 78.9c0 26.5-21.5 48-48 48l-66.7 0c-17 0-33.3-6.7-45.3-18.7L28.1 393.4C10.1 375.4 0 351 0 325.5L0 224l0-64 0-56C0 81.9 17.9 64 40 64zm560 0c22.1 0 40 17.9 40 40l0 56 0 64 0 101.5c0 25.5-10.1 49.9-28.1 67.9L512 493.3c-12 12-28.3 18.7-45.3 18.7L400 512c-26.5 0-48-21.5-48-48l0-78.9c0-29.7 11.8-58.2 32.8-79.2l25.3-25.3c0 0 0 0 0 0l15.2-15.2 32-32c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-32 32-15.2 15.2c-11 11-9.2 29.2 3.7 37.8c9.7 6.5 22.7 5.2 31-3.1l51.1-51.1c12-12 18.7-28.3 18.7-45.3l0-40.2 0-80 0-40c0-22.1 17.9-40 40-40z"/></svg>',
        },
        {
            nombre: 'Accesibilidad',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> <path d="M423.9 255.8L411 413.1c-3.3 40.7-63.9 35.1-60.6-4.9l10-122.5-41.1 2.3c10.1 20.7 15.8 43.9 15.8 68.5 0 41.2-16.1 78.7-42.3 106.5l-39.3-39.3c57.9-63.7 13.1-167.2-74-167.2-25.9 0-49.5 9.9-67.2 26L73 243.2c22-20.7 50.1-35.1 81.4-40.2l75.3-85.7-42.6-24.8-51.6 46c-30 26.8-70.6-18.5-40.5-45.4l68-60.7c9.8-8.8 24.1-10.2 35.5-3.6 0 0 139.3 80.9 139.5 81.1 16.2 10.1 20.7 36 6.1 52.6L285.7 229l106.1-5.9c18.5-1.1 33.6 14.4 32.1 32.7zm-64.9-154c28.1 0 50.9-22.8 50.9-50.9C409.9 22.8 387.1 0 359 0c-28.1 0-50.9 22.8-50.9 50.9 0 28.1 22.8 50.9 50.9 50.9zM179.6 456.5c-80.6 0-127.4-90.6-82.7-156.1l-39.7-39.7C36.4 287 24 320.3 24 356.4c0 130.7 150.7 201.4 251.4 122.5l-39.7-39.7c-16 10.9-35.3 17.3-56.1 17.3z"/></svg>',
        },
        {
            nombre: 'Mascotas permitidas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"> <path d="M309.6 158.5L332.7 19.8C334.6 8.4 344.5 0 356.1 0c7.5 0 14.5 3.5 19 9.5L392 32l52.1 0c12.7 0 24.9 5.1 33.9 14.1L496 64l56 0c13.3 0 24 10.7 24 24l0 24c0 44.2-35.8 80-80 80l-32 0-16 0-21.3 0-5.1 30.5-112-64zM416 256.1L416 480c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-115.2c-24 12.3-51.2 19.2-80 19.2s-56-6.9-80-19.2L160 480c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-230.2c-28.8-10.9-51.4-35.3-59.2-66.5L1 167.8c-4.3-17.1 6.1-34.5 23.3-38.8s34.5 6.1 38.8 23.3l3.9 15.5C70.5 182 83.3 192 98 192l30 0 16 0 159.8 0L416 256.1zM464 80a16 16 0 1 0 -32 0 16 16 0 1 0 32 0z"/></svg>',
        },
        {
            nombre: 'Parrillas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> <path d="M345.7 48.3L358 34.5c5.4-6.1 13.3-8.8 20.9-8.9c7.2 0 14.3 2.6 19.9 7.8c19.7 18.3 39.8 43.2 55 70.6C469 131.2 480 162.2 480 192.2C480 280.8 408.7 352 320 352c-89.6 0-160-71.3-160-159.8c0-37.3 16-73.4 36.8-104.5c20.9-31.3 47.5-59 70.9-80.2C273.4 2.3 280.7-.2 288 0c14.1 .3 23.8 11.4 32.7 21.6c0 0 0 0 0 0c2 2.3 4 4.6 6 6.7l19 19.9zM384 240.2c0-36.5-37-73-54.8-88.4c-5.4-4.7-13.1-4.7-18.5 0C293 167.1 256 203.6 256 240.2c0 35.3 28.7 64 64 64s64-28.7 64-64zM32 288c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 64 448 0 0-64c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l0-96zM320 480a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm160-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM192 480a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>',
        },
        {
            nombre: 'Juegos infantiles',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path d="M192 104.8c0-9.2-5.8-17.3-13.2-22.8C167.2 73.3 160 61.3 160 48c0-26.5 28.7-48 64-48s64 21.5 64 48c0 13.3-7.2 25.3-18.8 34c-7.4 5.5-13.2 13.6-13.2 22.8c0 12.8 10.4 23.2 23.2 23.2l56.8 0c26.5 0 48 21.5 48 48l0 56.8c0 12.8 10.4 23.2 23.2 23.2c9.2 0 17.3-5.8 22.8-13.2c8.7-11.6 20.7-18.8 34-18.8c26.5 0 48 28.7 48 64s-21.5 64-48 64c-13.3 0-25.3-7.2-34-18.8c-5.5-7.4-13.6-13.2-22.8-13.2c-12.8 0-23.2 10.4-23.2 23.2L384 464c0 26.5-21.5 48-48 48l-56.8 0c-12.8 0-23.2-10.4-23.2-23.2c0-9.2 5.8-17.3 13.2-22.8c11.6-8.7 18.8-20.7 18.8-34c0-26.5-28.7-48-64-48s-64 21.5-64 48c0 13.3 7.2 25.3 18.8 34c7.4 5.5 13.2 13.6 13.2 22.8c0 12.8-10.4 23.2-23.2 23.2L48 512c-26.5 0-48-21.5-48-48L0 343.2C0 330.4 10.4 320 23.2 320c9.2 0 17.3 5.8 22.8 13.2C54.7 344.8 66.7 352 80 352c26.5 0 48-28.7 48-64s-21.5-64-48-64c-13.3 0-25.3 7.2-34 18.8C40.5 250.2 32.4 256 23.2 256C10.4 256 0 245.6 0 232.8L0 176c0-26.5 21.5-48 48-48l120.8 0c12.8 0 23.2-10.4 23.2-23.2z"/></svg>',
        },
        {
            nombre: 'Sala de juegos',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> <path d="M192 64C86 64 0 150 0 256S86 448 192 448l256 0c106 0 192-86 192-192s-86-192-192-192L192 64zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24l0 32 32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0 0 32c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-32-32 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l32 0 0-32z"/></svg>',
        },
        {
            nombre: 'Transporte al aeropuerto',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"> <path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z"/></svg>',
        },
        {
            nombre: 'Alquiler de bicicletas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> <path d="M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24l25.7 0 34.6 64-149.4 0-27.4-38C191 99.7 183.7 96 176 96l-56 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l43.7 0 22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112l49 0c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32L312 32zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368l65 0c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1-123.5 0zm90.6-128l108.5 0L317 274.8 257.4 192z"/></svg>',
        },
        {
            nombre: 'Servicio de limpieza',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path d="M208 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM320 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128zM416 32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0 160c0 27.6-11.7 52.5-30.4 70.1C422.1 275.7 448 310.8 448 352c0 53-43 96-96 96l-192 0c-53 0-96-43-96-96s43-96 96-96l88.4 0c-15.2-17-24.4-39.4-24.4-64L96 192c-53 0-96 43-96 96L0 416c0 53 43 96 96 96l320 0c53 0 96-43 96-96l0-128c0-53-43-96-96-96zM160 288c-35.3 0-64 28.7-64 64s28.7 64 64 64l192 0c35.3 0 64-28.7 64-64s-28.7-64-64-64l-32 0-160 0z"/></svg>',
        },
        {
            nombre: 'Camas adicionales',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"> <path d="M32 32c17.7 0 32 14.3 32 32l0 256 224 0 0-160c0-17.7 14.3-32 32-32l224 0c53 0 96 43 96 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32-224 0-32 0L64 416l0 32c0 17.7-14.3 32-32 32s-32-14.3-32-32L0 64C0 46.3 14.3 32 32 32zm144 96a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>',
        },
        {
            nombre: 'Guarda de equipaje',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"> <path d="M432 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM347.7 200.5c1-.4 1.9-.8 2.9-1.2l-16.9 63.5c-5.6 21.1-.1 43.6 14.7 59.7l70.7 77.1 22 88.1c4.3 17.1 21.7 27.6 38.8 23.3s27.6-21.7 23.3-38.8l-23-92.1c-1.9-7.8-5.8-14.9-11.2-20.8l-49.5-54 19.3-65.5 9.6 23c4.4 10.6 12.5 19.3 22.8 24.5l26.7 13.3c15.8 7.9 35 1.5 42.9-14.3s1.5-35-14.3-42.9L505 232.7l-15.3-36.8C472.5 154.8 432.3 128 387.7 128c-22.8 0-45.3 4.8-66.1 14l-8 3.5c-32.9 14.6-58.1 42.4-69.4 76.5l-2.6 7.8c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l2.6-7.8c5.7-17.1 18.3-30.9 34.7-38.2l8-3.5zm-30 135.1l-25 62.4-59.4 59.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L340.3 441c4.6-4.6 8.2-10.1 10.6-16.1l14.5-36.2-40.7-44.4c-2.5-2.7-4.8-5.6-7-8.6zM256 274.1c-7.7-4.4-17.4-1.8-21.9 5.9l-32 55.4L147.7 304c-15.3-8.8-34.9-3.6-43.7 11.7L40 426.6c-8.8 15.3-3.6 34.9 11.7 43.7l55.4 32c15.3 8.8 34.9 3.6 43.7-11.7l64-110.9c1.5-2.6 2.6-5.2 3.3-8L261.9 296c4.4-7.7 1.8-17.4-5.9-21.9z"/></svg>',
        },
        {
            nombre: 'Caja de seguridad',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>',
        },
    ],
    tiposPropiedad: [
        {
            nombre: 'Casa',
            descripcion: 'Casa completa.',
            contieneMultiplesUnidades: false,
        },
        {
            nombre: 'Complejo',
            descripcion: 'Propiedad con varias unidades completas en alquiler.',
            contieneMultiplesUnidades: true,
        },
        {
            nombre: 'Departamento',
            descripcion:
                'Unidad ubicada dentro de un edificio que contiene otras similares.',
            contieneMultiplesUnidades: false,
        },
    ],
    ubicaciones: [
        {
            direccion:
                'Julio Cortazar, Santa Mónica, Santa Rosa de Calamuchita, Municipio de Santa Rosa de Calamuchita, Pedanía Santa Rosa, Departamento Calamuchita, Córdoba, X5196, Argentina',
            latitud: -32.06679729747977,
            longitud: -64.58057255317767,
            ciudad: 'Santa Rosa de Calamuchita',
            provincia: 'Córdoba',
        },
        {
            direccion:
                'Cuesta Blanca, Comuna de Cuesta Blanca, Pedanía San Roque, Departamento Punilla, Córdoba, X5166, Argentina',
            latitud: -31.4797689,
            longitud: -64.5780084,
            ciudad: 'Cuesta Blanca',
            provincia: 'Córdoba',
        },
        {
            direccion:
                'Tessi, La Banda, Capilla del Monte, Municipio de Capilla del Monte, Pedanía Dolores, Departamento Punilla, Córdoba, X5166, Argentina',
            latitud: -30.85040529366804,
            longitud: -64.51947390962563,
            ciudad: 'Capilla del Monte',
            provincia: 'Córdoba',
        },
    ],
    unidades: [
        {
            //id: 1
            nombre: 'Lunar',
            capacidad: 6,
            descripcion:
                'Ubicada en el corazón de las Sierras de Córdoba, esta acogedora cabaña es el refugio ideal para quienes buscan escapar de la rutina. Rodeada de majestuosos paisajes naturales, ofrece un ambiente tranquilo y relajante. La cabaña cuenta con amplios ventanales que permiten la entrada de luz natural y brindan vistas espectaculares de las montañas.',
            propiedadId: 1,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 20000,
            imagenes: {
                create: [
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp',
                    },
                ],
            },
        },
        {
            //id: 2
            nombre: 'Solar',
            capacidad: 6,
            descripcion:
                'Ubicada en el corazón de las Sierras de Córdoba, esta acogedora cabaña es el refugio ideal para quienes buscan escapar de la rutina. Rodeada de majestuosos paisajes naturales, ofrece un ambiente tranquilo y relajante. La cabaña cuenta con amplios ventanales que permiten la entrada de luz natural y brindan vistas espectaculares de las montañas.',
            propiedadId: 1,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 20000,
            imagenes: {
                create: [
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp',
                    },
                ],
            },
        },
        {
            //id: 3
            nombre: 'Eclipse',
            capacidad: 6,
            descripcion:
                'Ubicada en el corazón de las Sierras de Córdoba, esta acogedora cabaña es el refugio ideal para quienes buscan escapar de la rutina. Rodeada de majestuosos paisajes naturales, ofrece un ambiente tranquilo y relajante. La cabaña cuenta con amplios ventanales que permiten la entrada de luz natural y brindan vistas espectaculares de las montañas.',
            propiedadId: 1,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 20000,
            imagenes: {
                create: [
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp',
                    },
                    {
                        url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp',
                    },
                ],
            },
        },
        {
            //id: 4
            nombre: 'Jazmín',
            capacidad: 4,
            descripcion: ' Martina',
            propiedadId: 2,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 8,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 7,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 25000,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 4.jpg' }],
            },
        },
        {
            //id: 4
            nombre: 'Rosa',
            capacidad: 2,
            descripcion: ' Rosa',
            propiedadId: 2,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 8,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 7,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 12500,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 6.jpg' }],
            },
        },
        {
            //id: 4
            nombre: 'Margarita',
            capacidad: 3,
            descripcion:
                'Cabaña Margarita - Tu refugio en Cuesta Blanca, Córdoba\n\nDisfruta de una experiencia única en Cabaña Margarita, ubicada en la encantadora localidad de Cuesta Blanca, en la provincia de Córdoba. Este acogedor alojamiento cuenta con todas las comodidades que necesitas para relajarte y desconectarte.\n\n- Servicios destacados: Pileta privada para refrescarte en los días cálidos, televisor, aire acondicionado y un exclusivo spa para maximizar tu bienestar.\n- Espacios amplios: Un extenso patio ideal para pasear, jugar con los chicos y disfrutar momentos inolvidables con tus mascotas.\n- Ubicación estratégica: A menos de 10 minutos en auto encontrarás una variedad de restaurantes, comercios y atracciones turísticas que te permitirán explorar y aprovechar al máximo tu estadía.\n\nCabaña Margarita combina comodidad, naturaleza y cercanía a todo lo que necesitas para unas vacaciones perfectas. ¡Te esperamos!',
            propiedadId: 2,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 8,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 7,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 15000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 5.jpg' },
                    { url: '/imagenes/Interior 5.jpg' },
                    { url: '/imagenes/Interior 2.jpg' },
                    { url: '/imagenes/Interior 3.jpg' },
                    { url: '/imagenes/Interior 4.jpg' },
                ],
            },
        },
        {
            //id: 4
            nombre: 'Lirio',
            capacidad: 4,
            descripcion: ' Lirio',
            propiedadId: 2,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 1,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 2,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 8,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 7,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 17250,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 7.jpg' }],
            },
        },
        {
            //id: 4
            nombre: 'Pino',
            capacidad: 3,
            descripcion: ' Pino',
            propiedadId: 3,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 5,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 9,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 30000,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 8.jpeg' }],
            },
        },
        {
            //id: 4
            nombre: 'Algarrobo ',
            capacidad: 2,
            descripcion: ' Algarrobo ',
            propiedadId: 3,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 5,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 9,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 30000,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 2.jpg' }],
            },
        },
        {
            //id: 4
            nombre: 'Quebracho  ',
            capacidad: 5,
            descripcion: ' Quebracho  ',
            propiedadId: 3,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 5,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 9,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 35000,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 3.jpeg' }],
            },
        },
        {
            //id: 4
            nombre: 'Ceibo  ',
            capacidad: 8,
            descripcion: ' Ceibo  ',
            propiedadId: 3,
            servicios: {
                create: [
                    {
                        servicio: {
                            connect: {
                                id: 3,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 4,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 5,
                            },
                        },
                    },
                    {
                        servicio: {
                            connect: {
                                id: 9,
                            },
                        },
                    },
                ],
            },
            precioPorNoche: 45000,
            imagenes: {
                create: [{ url: '/imagenes/Exterior 9.jpeg' }],
            },
        },

        // ====== NUEVAS CABAÑAS - ALTO LAS FLORES - Santa Rosa de Calamuchita (propiedadId: 1) ======
        {
            nombre: 'Aurora',
            capacidad: 2,
            descripcion:
                'Cabaña Aurora - El refugio romántico perfecto en las Sierras de Córdoba. Diseñada para parejas, cuenta con calefacción central, televisor smart y WiFi de alta velocidad. Su decoración íntima y acogedora invita a la desconexión total. A pasos del arroyo local y rodeada de vegetación serrana autóctona. Ideal para aniversarios y escapadas de fin de semana.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                ],
            },
            precioPorNoche: 16000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp' },
                ],
            },
        },
        {
            nombre: 'Cosmos',
            capacidad: 4,
            descripcion:
                'Cabaña Cosmos - Perfecta para familias o grupos de amigos en Santa Rosa de Calamuchita. Con amplia galería cubierta con parrilla, pileta privada y espacio verde para los más chicos. Dos habitaciones equipadas, living comedor con chimenea y cocina completa. Rodeada de pinos y sauces, a 5 minutos de los mejores balnearios del Río Los Molinos. Mascotas bienvenidas con previo aviso.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 22000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp' },
                ],
            },
        },
        {
            nombre: 'Estrella',
            capacidad: 8,
            descripcion:
                'Cabaña Estrella - La opción grande para grupos numerosos o familias extensas. Tres habitaciones amplias, dos baños completos, cocina equipada, living con vista panorámica a las sierras y amplia terraza con parrilla y pileta climatizada. A solo 10 minutos del centro de Santa Rosa de Calamuchita, con acceso directo a senderos de trekking y ciclismo de montaña. Ideal para cumpleaños, aniversarios o reuniones familiares. Desayuno continental incluido.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 6 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 38000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp' },
                ],
            },
        },
        {
            nombre: 'Nebula',
            capacidad: 3,
            descripcion:
                'Cabaña Nebula - Un espacio íntimo y moderno para tres personas en las Sierras de Córdoba. Habitación doble más cama adicional, baño con ducha de lluvia, sala de estar con chimenea eléctrica, cocina americana equipada y deck exterior con hamaca y fogonero. WiFi de alta velocidad disponible en toda la propiedad. Ubicación tranquila con vistas despejadas al cerro y el cielo estrellado de las Sierras.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 19000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg' },
                ],
            },
        },
        {
            nombre: 'Galaxia',
            capacidad: 6,
            descripcion:
                'Cabaña Galaxia - Diseñada con arquitectura serrana moderna que integra madera y piedra en cada rincón. Para seis personas, con pileta, parrilla techada, dos habitaciones en suite y amplio deck con vista al lago Los Molinos. Cuenta con estacionamiento cubierto para dos vehículos y acceso a actividades recreativas organizadas por el complejo. Servicio de limpieza incluido. Un lujo en plena naturaleza cordobesa.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 28000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/pileta2.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp' },
                ],
            },
        },
        {
            nombre: 'Planeta',
            capacidad: 5,
            descripcion:
                'Cabaña Planeta - El equilibrio perfecto entre confort y naturaleza para grupos de hasta 5 personas. Espaciosa y luminosa, con galería con parrilla y fogón, jardín con hamacas paraguayas y zona de juegos. Los niños disfrutan del gran espacio verde mientras los adultos se relajan en el deck principal. Admite mascotas con previo aviso. A minutos de los balnearios naturales del embalse Los Molinos. Ideal para familias que buscan actividades al aire libre.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 25000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/interior.jpeg' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion1.webp' },
                ],
            },
        },
        {
            nombre: 'Cometa',
            capacidad: 4,
            descripcion:
                'Cabaña Cometa - Ambiente acogedor y familiar en un entorno natural privilegiado de Santa Rosa de Calamuchita. Con dos dormitorios, baño completo, cocina equipada y sala de estar con chimenea. El amplio jardín con parrilla y mesa al aire libre es ideal para reuniones. Desayuno continental incluido en estadías de 3 o más noches. A 2 km del centro del pueblo, conectada por sendero peatonal entre los algarrobos y talas nativos.',
            propiedadId: 1,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 13 } } },
                ],
            },
            precioPorNoche: 21000,
            imagenes: {
                create: [
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/exterior3.webp' },
                    { url: 'https://www.altolasflores.com.ar/assets/img/portfolio/habitacion2.webp' },
                ],
            },
        },

        // ====== NUEVAS CABAÑAS - EL DESCANSO - Cuesta Blanca (propiedadId: 2) ======
        {
            nombre: 'Violeta',
            capacidad: 2,
            descripcion:
                'Cabaña Violeta - La opción romántica de El Descanso para parejas que buscan intimidad en la naturaleza de Cuesta Blanca. Con deck privado con vista al río, cocina equipada y spa de uso exclusivo del complejo. Perfecta para luna de miel, aniversarios o escapadas románticas. El entorno serrano y el sonido del río San Antonio hacen de esta cabaña un lugar único para desconectarse del mundo.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                ],
            },
            precioPorNoche: 14000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 4.jpg' },
                    { url: '/imagenes/Interior 2.jpg' },
                ],
            },
        },
        {
            nombre: 'Azalea',
            capacidad: 6,
            descripcion:
                'Cabaña Azalea - Amplia y moderna, diseñada para familias en Cuesta Blanca. Tres dormitorios con camas queen, dos baños completos, cocina totalmente equipada y living con chimenea a leña. Exterior con pileta climatizada, área de parrilla y juegos para niños. El complejo El Descanso ofrece actividades recreativas organizadas durante la temporada. A 300 metros del Río San Antonio para pesca y baño natural.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 30000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 5.jpg' },
                    { url: '/imagenes/Interior 5.jpg' },
                    { url: '/imagenes/Interior 3.jpg' },
                ],
            },
        },
        {
            nombre: 'Orquídea',
            capacidad: 4,
            descripcion:
                'Cabaña Orquídea - Diseño contemporáneo con materiales naturales en pleno Valle de Punilla. Para 4 personas, con dos habitaciones, baño con bañera de inmersión, galería con hamacas y parrilla, jardín privado y pileta de uso exclusivo. WiFi de alta velocidad en toda la propiedad. A 5 minutos en auto de los balnearios de Cuesta Blanca y a 20 minutos de Córdoba Capital. Tarifa especial para estadías de semana completa.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 22000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 6.jpg' },
                    { url: '/imagenes/Interior 4.jpg' },
                ],
            },
        },
        {
            nombre: 'Magnolia',
            capacidad: 5,
            descripcion:
                'Cabaña Magnolia - El complemento perfecto para familias que viajan con niños o mascotas en Cuesta Blanca. Amplio jardín con juegos infantiles, zona de parrilla techada, pileta con sector little-splash para los más pequeños y acceso al spa compartido del complejo. Dos habitaciones más cama adicional, cocina completa y estacionamiento cubierto. Servicio de limpieza y cambio de toallas incluidos diariamente.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 26000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 7.jpg' },
                    { url: '/imagenes/Interior 5.jpg' },
                    { url: '/imagenes/Interior 2.jpg' },
                ],
            },
        },
        {
            nombre: 'Lavanda',
            capacidad: 3,
            descripcion:
                'Cabaña Lavanda - Una opción íntima y acogedora para tres personas en Cuesta Blanca. Con habitación principal, cama adicional en altillo, baño con ducha de efecto lluvia, kitchenette y deck exterior con vista al cerro. El aroma a lavanda natural del jardín crea un ambiente único de relajación. Incluye acceso al spa y pileta del complejo El Descanso. Ideal para estadías de descanso y conexión con la naturaleza serrana.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                ],
            },
            precioPorNoche: 16000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 4.jpg' },
                    { url: '/imagenes/Interior 3.jpg' },
                ],
            },
        },
        {
            nombre: 'Clavel',
            capacidad: 8,
            descripcion:
                'Cabaña Clavel - La cabaña más grande y completa de El Descanso, pensada para grupos numerosos o familias extendidas. Con cuatro habitaciones, dos baños completos más toilette, cocina gourmet, comedor para 10 personas y quincho privado con parrilla y horno de barro. Piscina de uso exclusivo con solarium, spa, gimnasio y sala de juegos. Desayuno continental incluido todos los días. Personal de servicio disponible a demanda.',
            propiedadId: 2,
            servicios: {
                create: [
                    { servicio: { connect: { id: 1 } } },
                    { servicio: { connect: { id: 2 } } },
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 6 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 8 } } },
                    { servicio: { connect: { id: 9 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 40000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 5.jpg' },
                    { url: '/imagenes/Interior 5.jpg' },
                    { url: '/imagenes/Interior 4.jpg' },
                    { url: '/imagenes/Interior 3.jpg' },
                ],
            },
        },

        // ====== NUEVAS CABAÑAS - CLAROS DEL BOSQUE - Capilla del Monte (propiedadId: 3) ======
        {
            nombre: 'Sauce',
            capacidad: 4,
            descripcion:
                'Cabaña Sauce - Con vista privilegiada al Cerro Uritorco y ubicada en el mágico entorno de Capilla del Monte. Para 4 personas, dos habitaciones, baño completo, living con salamandra, cocina equipada y galería con parrilla. El complejo Claros del Bosque ofrece actividades guiadas de trekking, yoga al amanecer y meditación entre las sierras. Admite mascotas con previo aviso. WiFi disponible en toda la propiedad.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 9 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 32000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 8.jpeg' },
                    { url: '/imagenes/Exterior 2.jpg' },
                ],
            },
        },
        {
            nombre: 'Ombú',
            capacidad: 2,
            descripcion:
                'Cabaña Ombú - La más íntima de Claros del Bosque, diseñada para parejas que buscan reconectarse con la naturaleza en Capilla del Monte. Con ventanales al bosque nativo, bañera de inmersión, sala de estar con chimenea, deck privado y vista directa a las estrellas. El entorno de Capilla del Monte es reconocido mundialmente por su energía especial y cielos despejados ideales para la contemplación nocturna y el misticismo serrano.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 28000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 2.jpg' },
                    { url: '/imagenes/Exterior 8.jpeg' },
                ],
            },
        },
        {
            nombre: 'Lapacho',
            capacidad: 6,
            descripcion:
                'Cabaña Lapacho - Amplia y confortable para grupos de hasta 6 personas en las Sierras de Punilla. Tres dormitorios con camas premium, dos baños, cocina integral equipada, comedor cubierto y amplio patio con parrilla y fogón. El lapacho en flor que rodea la propiedad crea un entorno único durante la primavera. Acceso a senderos de montaña directamente desde la cabaña. Desayuno incluido en temporada alta con productos regionales.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 6 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 9 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 40000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 3.jpeg' },
                    { url: '/imagenes/Exterior 8.jpeg' },
                    { url: '/imagenes/Exterior 9.jpeg' },
                ],
            },
        },
        {
            nombre: 'Espinillo',
            capacidad: 3,
            descripcion:
                'Cabaña Espinillo - Acogedora cabaña para tres personas en el entorno místico de Capilla del Monte. Habitación principal con cama matrimonial y altillo con cama individual, baño completo, cocina equipada y sala de estar con vista al jardín. Incluye bicicletas para recorrer los alrededores y mapa de senderos del complejo. A 3 km del centro de Capilla del Monte y a 4 km del sitio arqueológico Ongamira. Admite mascotas pequeñas.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 13 } } },
                    { servicio: { connect: { id: 17 } } },
                ],
            },
            precioPorNoche: 29000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 3.jpeg' },
                    { url: '/imagenes/Exterior 2.jpg' },
                ],
            },
        },
        {
            nombre: 'Churqui',
            capacidad: 5,
            descripcion:
                'Cabaña Churqui - Espacio moderno y confortable para 5 personas entre las sierras de Capilla del Monte. Con dos habitaciones y cama adicional en sala de estar, baño con ducha de lluvia, cocina equipada y amplia galería cubierta con parrilla y horno de barro. El complejo Claros del Bosque dispone de gimnasio al aire libre, cancha de tenis y piscina de uso compartido. Alquiler de bicicletas disponible en recepción.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 9 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                ],
            },
            precioPorNoche: 38000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 8.jpeg' },
                    { url: '/imagenes/Exterior 9.jpeg' },
                    { url: '/imagenes/Exterior 3.jpeg' },
                ],
            },
        },
        {
            nombre: 'Molle',
            capacidad: 8,
            descripcion:
                'Cabaña Molle - La joya de Claros del Bosque en Capilla del Monte. Para ocho personas, con cuatro habitaciones, tres baños, cocina de diseño totalmente equipada, quincho con parrilla y horno de barro, piscina exclusiva con calefacción y amplio solarium. Sala de juegos para niños, gimnasio equipado y servicio de desayuno incluido con productos artesanales de la zona. Rodeada de molle serrano centenario, ofrece una experiencia de lujo en perfecta armonía con la naturaleza de Córdoba.',
            propiedadId: 3,
            servicios: {
                create: [
                    { servicio: { connect: { id: 3 } } },
                    { servicio: { connect: { id: 4 } } },
                    { servicio: { connect: { id: 5 } } },
                    { servicio: { connect: { id: 6 } } },
                    { servicio: { connect: { id: 7 } } },
                    { servicio: { connect: { id: 9 } } },
                    { servicio: { connect: { id: 17 } } },
                    { servicio: { connect: { id: 18 } } },
                    { servicio: { connect: { id: 19 } } },
                ],
            },
            precioPorNoche: 50000,
            imagenes: {
                create: [
                    { url: '/imagenes/Exterior 9.jpeg' },
                    { url: '/imagenes/Exterior 8.jpeg' },
                    { url: '/imagenes/Exterior 3.jpeg' },
                    { url: '/imagenes/Exterior 2.jpg' },
                ],
            },
        },
    ],

    clientes: [
        {
            nombre: 'Chandler Bing',
            telefono: '+542645208135',
            email: 'chandler.bing@gmail.com',
        },
        {
            nombre: 'Monica Geller',
            telefono: '+542645208135',
            email: 'monica.geller@gmail.com',
        },
        {
            nombre: 'Ross Geller',
            telefono: '+542645208135',
            email: 'ross.geller@gmail.com',
        },
        {
            nombre: 'Rachel Green',
            telefono: '+542645208135',
            email: 'rachel.green@gmail.com',
        },
        {
            nombre: 'Joey Tribbiani',
            telefono: '+542645208135',
            email: 'joey.tribbiani@gmail.com',
        },
        {
            nombre: 'Phoebe Buffay',
            telefono: '+542645208135',
            email: 'phoebe.buffay@gmail.com',
        },
        {
            nombre: 'Ted Mosby',
            telefono: '+542645208135',
            email: 'ted.mosby@gmail.com',
        },
        {
            nombre: 'Robin Scherbatsky',
            telefono: '+542645208135',
            email: 'robin.scherbatsky@gmail.com',
        },
        {
            nombre: 'Barney Stinson',
            telefono: '+542645208135',
            email: 'barney.stinson@gmail.com',
        },
        {
            nombre: 'Lily Aldrin',
            telefono: '+542645208135',
            email: 'lily.aldrin@gmail.com',
        },
        {
            nombre: 'Marshall Eriksen',
            telefono: '+542645208135',
            email: 'marshall.eriksen@gmail.com',
        },
        {
            nombre: 'Michael Scott',
            telefono: '+542645208135',
            email: 'michael.scott@gmail.com',
        },
        {
            nombre: 'Dwight Schrute',
            telefono: '+542645208135',
            email: 'dwight.schrute@gmail.com',
        },
        {
            nombre: 'Jim Halpert',
            telefono: '+542645208135',
            email: 'jim.halpert@gmail.com',
        },
        {
            nombre: 'Pam Beesly',
            telefono: '+542645208135',
            email: 'pam.beesly@gmail.com',
        },
        {
            nombre: 'Leslie Knope',
            telefono: '+542645208135',
            email: 'leslie.knope@gmail.com',
        },
        {
            nombre: 'Ron Swanson',
            telefono: '+542645208135',
            email: 'ron.swanson@gmail.com',
        },
        {
            nombre: 'Tom Haverford',
            telefono: '+542645208135',
            email: 'tom.haverford@gmail.com',
        },
        {
            nombre: 'Ann Perkins',
            telefono: '+542645208135',
            email: 'ann.perkins@gmail.com',
        },
        {
            nombre: 'Andy Dwyer',
            telefono: '+542645208135',
            email: 'andy.dwyer@gmail.com',
        },
        {
            nombre: 'April Ludgate',
            telefono: '+542645208135',
            email: 'april.ludgate@gmail.com',
        },
        {
            nombre: 'Ben Wyatt',
            telefono: '+542645208135',
            email: 'ben.wyatt@gmail.com',
        },
        {
            nombre: 'Chris Traeger',
            telefono: '+542645208135',
            email: 'chris.traeger@gmail.com',
        },
        {
            nombre: 'Donna Meagle',
            telefono: '+542645208135',
            email: 'donna.meagle@gmail.com',
        },
        {
            nombre: 'Jerry Gergich',
            telefono: '+542645208135',
            email: 'jerry.gergich@gmail.com',
        },
        {
            nombre: 'Laura Mirales',
            telefono: '+542645208135',
            email: 'laura.mirales@gmail.com',
        },
        {
            nombre: 'Klaus Mikaelson',
            telefono: '+542645208135',
            email: 'klaus.mikaelson@gmail.com',
        },
        {
            nombre: 'Damon Salvatore',
            telefono: '+542645208135',
            email: 'damon.salvatore@gmail.com',
        },
        {
            nombre: 'Stefan Salvatore',
            telefono: '+542645208135',
            email: 'stefan.salvatore@gmail.com',
        },

    ],

    reservas: [
        {
            fechaInicio: '2023-02-20T14:00:00Z',
            fechaFin: '2023-02-25T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 1,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2023-02-20T14:00:00Z',
            fechaFin: '2023-02-25T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 2,
            pagoParcial: 10000,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2023-02-26T14:00:00Z',
            fechaFin: '2023-02-27T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 3,
            pagoParcial: 5000,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2023-03-05T14:00:00Z',
            fechaFin: '2023-03-10T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 1,
            pagoParcial: 50000,
        },
        {
            fechaInicio: '2023-04-15T14:00:00Z',
            fechaFin: '2023-04-20T10:00:00Z',
            cantidadPersonas: 3,
            precioTotal: 45000,
            unidadId: 2,
            pagoParcial: 45000,
        },
        {
            fechaInicio: '2023-12-20T14:00:00Z',
            fechaFin: '2023-12-25T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 80000,
            unidadId: 1,
            pagoParcial: 80000,
        },
        {
            fechaInicio: '2023-12-20T14:00:00Z',
            fechaFin: '2023-12-25T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 2,
            pagoParcial: 50000,
        },
        {
            fechaInicio: '2024-01-10T14:00:00Z',
            fechaFin: '2024-01-15T10:00:00Z',
            cantidadPersonas: 3,
            precioTotal: 45000,
            unidadId: 2,
            pagoParcial: 10000,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2024-01-11T14:00:00Z',
            fechaFin: '2024-01-19T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 45000,
            unidadId: 1,
            pagoParcial: 45000,
        },
        {
            fechaInicio: '2024-02-20T14:00:00Z',
            fechaFin: '2024-02-25T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 1,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2024-02-20T14:00:00Z',
            fechaFin: '2024-02-25T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 2,
            pagoParcial: 10000,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2024-02-26T14:00:00Z',
            fechaFin: '2024-02-27T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 3,
            pagoParcial: 1000,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2024-03-05T14:00:00Z',
            fechaFin: '2024-03-10T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 1,
            pagoParcial: 50000,
        },
        {
            fechaInicio: '2024-04-15T14:00:00Z',
            fechaFin: '2024-04-20T10:00:00Z',
            cantidadPersonas: 3,
            precioTotal: 45000,
            unidadId: 2,
            pagoParcial: 45000,
        },
        {
            fechaInicio: '2024-05-10T14:00:00Z',
            fechaFin: '2024-05-15T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 3,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2024-06-20T14:00:00Z',
            fechaFin: '2024-06-25T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 1,
            pagoParcial: 50000,
        },
        {
            fechaInicio: '2024-07-05T14:00:00Z',
            fechaFin: '2024-07-10T10:00:00Z',
            cantidadPersonas: 3,
            precioTotal: 45000,
            unidadId: 2,
            pagoParcial: 45000,
        },
        {
            fechaInicio: '2024-08-20T14:00:00Z',
            fechaFin: '2024-08-21T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 40000,
            unidadId: 1,
            pagoParcial: 40000,
        },
        {
            fechaInicio: '2024-08-23T14:00:00Z',
            fechaFin: '2024-08-27T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 40000,
            unidadId: 2,
            estado: EstadoReserva.CANCELADA,
        },
        {
            fechaInicio: '2024-08-23T14:00:00Z',
            fechaFin: '2024-08-27T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 30000,
            unidadId: 1,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2024-09-02T14:00:00Z',
            fechaFin: '2024-09-03T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 1,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2024-09-05T14:00:00Z',
            fechaFin: '2024-09-08T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 1,
            pagoParcial: 50000,
        },
        {
            fechaInicio: '2024-10-05T14:00:00Z',
            fechaFin: '2024-10-10T10:00:00Z',
            cantidadPersonas: 3,
            precioTotal: 45000,
            unidadId: 2,
            pagoParcial: 45000,
        },
        {
            fechaInicio: '2024-11-15T14:00:00Z',
            fechaFin: '2024-11-20T10:00:00Z',
            cantidadPersonas: 2,
            precioTotal: 30000,
            unidadId: 3,
            pagoParcial: 30000,
        },
        {
            fechaInicio: '2024-12-20T14:00:00Z',
            fechaFin: '2024-12-25T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 1,
            pagoParcial: 10000,
        },
        {
            fechaInicio: '2024-12-20T14:00:00Z',
            fechaFin: '2024-12-25T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 50000,
            unidadId: 2,
            estado: EstadoReserva.SOLICITADA,
        },
        {
            fechaInicio: '2025-01-10T14:00:00Z',
            fechaFin: '2025-01-20T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 80000,
            unidadId: 2,
            estado: EstadoReserva.SOLICITADA,
        },
        {
            fechaInicio: '2025-01-15T14:00:00Z',
            fechaFin: '2025-01-20T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 80000,
            unidadId: 1,
            pagoParcial: 10000,
            
        },
        {
            fechaInicio: '2025-03-15T14:00:00Z',
            fechaFin: '2025-03-20T10:00:00Z',
            cantidadPersonas: 4,
            precioTotal: 100000,
            unidadId: 2,
            pagoParcial: 20000,
            
        },
    ],
};

export const clientesConReservasArray: any[] = [];

for (let i = 0; i < initialData.reservas.length; i++) {
    const cliente = initialData.clientes[i];
    const reserva = initialData.reservas[i];
    clientesConReservasArray.push({ cliente, reserva });
}
