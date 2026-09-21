"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MenuSection = () => {
    const pathname = usePathname();
    const user = null; 
    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'All Products', href: '/products' },
        { name: 'Contact', href: '/contact' },
        { name: 'About', href: '/about' },
        ...(!user ? [{ name: 'Sign Up', href: '/signup' }] : []),
    ];

    return (
        <ul className='hidden lg:flex items-center gap-10 font-poppins'>
            {navLinks.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <li key={item.href} className='text-base leading-6 text-black hover:text-secondary relative py-1'>
                        <Link
                            href={item.href}
                            className={`transition-all block ${isActive ? 'font-semibold text-black' : ''}`}
                        >
                            {item.name}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full" />
                            )}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export default MenuSection;