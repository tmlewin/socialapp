import React from 'react'
import './css/Header.css'

export default function Header() {
    return (
        <div className="header">
            <h2>Socially Social</h2>
            <p onClick={()=>{
                localStorage.removeItem('user')
                window.location.reload();
            }}>Logout</p>
        </div>
    )
}
