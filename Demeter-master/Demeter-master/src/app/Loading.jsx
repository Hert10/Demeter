'use client';
import { useState } from 'react';

export default function LoadingModal({ show }) {
  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content d-flex flex-column align-items-center justify-content-center text-center p-5">
          <div className="spinner-border text-primary mb-4" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Processing your prediction...</h5>
          <h4>This may take up to 5 minutes.</h4>
        </div>
      </div>
    </div>
  );
}
