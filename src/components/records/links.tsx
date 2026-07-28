'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { name: "Recordings", route: "/records" },
  { name: "Account", route: "/accounts" }
]

const Links = () => {
  const pathname = usePathname()

  return (
    <div className='flex-1 px-2 flex items-center gap-3'>
      {links.map((link) => {
        const isActive = pathname === link.route

        return (
          <Link
            key={link.route}
            href={link.route}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              isActive
                ? 'border-foreground '
                : 'border-transparent text-gray-500 hover:opacity-50'
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}

export default Links