'use client';

import { ReactNode } from 'react';
import UserMenu from './User_menu';

interface BaseLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  username?: string;
}

export default function BaseLayout({ children, isAuthenticated = false, username }: BaseLayoutProps) {
  return (
    <>
      {/* Navigation */}
      {isAuthenticated? (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
        <div className="container">
        <a className="navbar-brand fw-bold text-success" href="#">
          <i className="bi bi-cloud-sun me-2"></i>
          Demeter
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link active" href="/dashboard">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">History</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/saved_regions">Regions</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/help">Help</a>
            </li>
          </ul>
          <div className="d-flex">
            
              <>
              <span className="text-success fw-bold">
                   <UserMenu username = {username}/>
                </span>
              </>
           
          </div>
        </div>
      </div>
    </nav>
        
        ):(
        <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
          <div className="container">
          <a className="navbar-brand fw-bold text-success" href="#">
            <i className="bi bi-cloud-sun me-2"></i>
            Demeter
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Climate Alerts</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/help">Help</a>
              </li>
            </ul>
            <div className="d-flex">
              
                <>
                  <a href="/login" className="btn btn-outline-success me-2">
                    Sign In
                  </a>
                  <a href="/register" className="btn btn-success">
                    Join Now
                  </a>
                </>
             
            </div>
          </div>
        </div>
      </nav>)}
      

      {/* Main Content */}
      <main className="flex-grow-1">
        {children}
      </main>

      {/* Footer (unchanged) */}
      <footer className="py-5 bg-dark text-white">
        <div className="container py-4">
          {/* ... same as before ... */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-0 text-muted">© {new Date().getFullYear()} Demeter. Protecting farmers worldwide.</p>
            <div className="d-flex mt-3 mt-md-0">
              <a href="#" className="text-white me-3" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
              <a href="#" className="text-white me-3" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white" aria-label="Email"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
