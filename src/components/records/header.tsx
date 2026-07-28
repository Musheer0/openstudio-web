import React from 'react'
import Links from './links'

const Header = () => {
  return (
    <nav className='w-full gap-5 border-b  py-2 px-4 flex items-center justify-between'>
        <div className="logo">
            <h1 className='text-xl font-bold'>OpenStudio<sup className='font-light text-xs'>web</sup></h1>
        </div>
        <Links/>
        <div className="user w-7 h-7 bg-primary rounded-full"></div>
    </nav>
  )
}

export default Header