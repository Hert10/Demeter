'use client';

import { useEffect, useState } from 'react';
import BaseLayout from '../../../baseLayout'; 
import { useParams } from 'next/navigation';

export default function Prediction_Page({ user }: { user: any }) {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  
  const lat = params.Lat as string;
  const lng = params.lng as string;

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/find-prediction?lat=${lat}&lng=${lng}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch prediction: ${res.status}`);
        }
        
        const data = await res.json();
        setPredictionData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setError('Failed to load prediction data');
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) {
      fetchPrediction();
    }
  }, [lat, lng]);

  if (loading) {
    return (
    <BaseLayout isAuthenticated={true} username={user.username}>
        <div className="container mt-4">
          <h1 className="text-center">Loading prediction data...</h1>
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout isAuthenticated={true} username={user.username}>
        <div className="container mt-4">
          <div className="alert alert-danger">
            <h2>Error</h2>
            <p>{error}</p>
            <a href="/saved_regions" className="btn btn-primary">
              Back to Saved Regions
            </a>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (!predictionData) {
    return (
      <BaseLayout isAuthenticated={true} username={user.username}>
        <div className="container mt-4">
          <div className="alert alert-warning">
            <h2>No Prediction Data Found</h2>
            <p>Could not find prediction data for coordinates: {lat}, {lng}</p>
            <a href="/saved_regions" className="btn btn-primary">
              Back to Saved Regions
            </a>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout isAuthenticated={true} username={user.username}>
      <div className="container mt-4">
        <h1 className="text-center">Prediction for Location: {lat}, {lng}</h1>
        
        {/* Display forecast summary */}
        <div className="card mb-4">
          <div className="card-header">
            <h2>Forecast Summary</h2>
          </div>
          <div className="card-body">
            <p>Status: {predictionData.success ? 'Success' : 'Failed'}</p>
            <p>Total forecast days: {predictionData.forecast?.length || 0}</p>
          </div>
        </div>
        
        {/* Display forecast details */}
        <h2>Daily Forecast</h2>
        <div className="row">
          {predictionData.forecast && predictionData.forecast.map((day, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card" style={{borderLeft: `5px solid ${day.color}`}}>
                <div className="card-header">
                  <strong>{day.date}</strong>
                </div>
                <div className="card-body">
                  <p><strong>Condition:</strong> {day.condition.replace(/_/g, ' ')}</p>
                  <p><strong>Confidence:</strong> {(day.confidence * 100).toFixed(1)}%</p>
                  
                  <h6>Probabilities:</h6>
                  <ul className="list-group">
                    {Object.entries(day.probabilities).map(([condition, prob]) => (
                      <li key={condition} className="list-group-item d-flex justify-content-between align-items-center">
                        {condition.replace(/_/g, ' ')}
                        <span className="badge bg-primary rounded-pill">
                          {(Number(prob) * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        
        
        <div className="mt-4 mb-4">
          <a href="/saved_regions" className="btn btn-primary">
            Back to Saved Regions
          </a>
        </div>
      </div>
    </BaseLayout>
  );
}