'use client';
import { House, Brush, MousePointer2, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';

type NavItemProps = {
    id: string;
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: (id: string) => void;
};

const Sidebar = () => {
    const { tool, setTool } = useStore();

    const NavItem = ({ id, label, icon: Icon, isActive, onClick }: NavItemProps) => {
        return (
            <li
                onClick={() => onClick(id)}
                className={`
                flex justify-start items-center cursor-pointer h-16 transition-colors duration-300 
                ${isActive ? 'bg-gray-200 text-black' : 'hover:bg-gray-800 hover:text-white'}
                `}
            >
                <div className="w-[calc(100vw/24)] flex justify-center items-center">
                    <Icon className="w-3/5 h-auto" />
                </div>
                <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
                    {label}
                </p>
            </li>
        );
    };

    return (
        <nav className={`fixed left-0 top-0 z-50 group w-1/24 flex flex-col items-start hover:w-[300px] min-h-screen border-r border-gray-200
                     overflow-hidden whitespace-nowrap
                     transition-all duration-500 ease-in-out
                     bg-white shadow-lg
                     `}>
            <ul className={'flex-1 flex flex-col justify-center gap-4 font-bold text-lg w-[300px]'}>
                <NavItem id="cursor" label="Cursor" icon={MousePointer2} isActive={tool === 'cursor'} onClick={setTool} />
                <NavItem id="pen" label="Pen" icon={Brush} isActive={tool === 'pen'} onClick={setTool} />
                {/* <NavItem id="contact" label="Contact" icon={House} /> */}
            </ul>
        </nav>
    );
}

export default Sidebar;