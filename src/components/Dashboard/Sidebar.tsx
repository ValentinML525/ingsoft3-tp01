'use client';

import Image from 'next/image';
import { SidebarItem } from './SidebarItem';
import {
    CiCalendar,
    CiCircleQuestion,
    CiHome,
    CiLogout,
    CiSettings,
    CiUser,
    CiViewBoard,
} from 'react-icons/ci';
import Link from 'next/link';
import { logout } from '@/actions';
import { useSession } from 'next-auth/react';
import { Tooltip } from '@/components/Client/MaterialTailwindClient';

const menuItems = [
    {
        path: '/dashboard/home',
        icon: <CiHome size={20} />,
        title: 'Inicio',
        subtitle: 'Inicio',
    },
    {
        path: '/dashboard/reservas',
        icon: <CiCalendar size={20} />,
        title: 'Reservas',
        subtitle: 'Reservas',
    },
    {
        path: '/dashboard/reportes',
        icon: <CiViewBoard size={20} />,
        title: 'Reportes',
        subtitle: 'Reportes',
    },
    {
        path: '/dashboard/propiedades',
        icon: <CiSettings size={20} />,
        title: 'Configuración',
        subtitle: 'Configuracion',
    },
    //{
    //	path: '/dashboard/perfil',
    //	icon: <CiUser size={20} />,
    //	title: 'Perfil',
    //	subtitle: 'Perfil',
    //},
];

export const Sidebar = () => {
    const { data: session } = useSession();
    const isAuthenticates = !!session?.user;

    return (
        <aside className="fixed z-10 top-0 pb-3 px-6 w-1/6 flex flex-col justify-between h-screen border-r bg-white ">
            <div>
                <div className="mt-8 text-center">
                    <Link href="/dashboard/home" title="home">
                        <Image
                            src="/logo.png"
                            alt=""
                            className="w-10 h-10 m-auto rounded-full object-cover lg:w-28 lg:h-28"
                            width={100}
                            height={100}
                        />
                    </Link>
                    <h5 className="hidden mt-2 text-xl font-semibold text-gray-600 lg:block">
                        SERRAHOME
                    </h5>
                    <span className="hidden mt-1 text-gray-600 lg:block">
                        {session?.user.name}
                    </span>
                    <span className="hidden text-gray-400 lg:block">
                        {session?.user.role}
                    </span>
                </div>

                <ul className="space-y-2 tracking-wide mt-8">
                    {menuItems.map((item) => (
                        <SidebarItem key={item.path} {...item} />
                    ))}
                </ul>
            </div>

            <div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t">
                <button
                    className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
                    onClick={() => logout()}
                >
                    <CiLogout size={24}/>
                    <span className="group-hover:text-gray-700">Logout</span>
                </button>
                <Tooltip content='Manual de usuario'>
                    <button 
                        className='px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group '
                        onClick={() => window.open('https://docs.google.com/document/d/1ZP8sfwjou7ZxS_D7nWA5M-Jb98QyEBsx5m9tSB7rKdE/edit?usp=sharing')}
                        >
                            
                            <CiCircleQuestion size={24} /> 
                    </button>
                </Tooltip>
            </div>
        </aside>
    );
};
