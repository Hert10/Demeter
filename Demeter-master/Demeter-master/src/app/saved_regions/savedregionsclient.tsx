'use client';
import BaseLayout from '../baseLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingModal from '../Loading';

type Location = {
  userId: string;
  country: string | null;
  region: string | null;
  coordinates: number[];
  timestamp: string;
  ready?: boolean;
  prediction?: any;
};

export default function Saved_regions_client({ user }: { user: any }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setLoading] = useState(false);
  
  const fetchLocations = async () => {
    const res = await fetch(`/api/get-locations/${user.id}`);
    const data = await res.json();
    
    // Check if prediction exists for each location
    const checkPredictions = data.map(async (loc: Location) => {
      // Check if prediction file exists
      try {
        const predictionRes = await fetch(`/api/check-prediction?lat=${loc.coordinates[1]}&lng=${loc.coordinates[0]}`);
        const predictionData = await predictionRes.json();
        return { ...loc, ready: predictionData.exists };
      } catch (error) {
        console.error('Error checking prediction:', error);
        return { ...loc, ready: false };
      }
    });
    
    const updatedLocations = await Promise.all(checkPredictions);
    setLocations(updatedLocations);
  };
  
  const deleteOne = async (lat: number, lng: number) => {
    await fetch(`/api/get-locations/${user.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    fetchLocations();
  };
  
  const getDateRange = () => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(today.getFullYear() - 20);
    const startDate = twentyYearsAgo.toISOString().split('T')[0].replace(/-/g, '');
    return { startDate, endDate };
  };
  
  const requestPrediction = async (lat: number, lng: number, index: number) => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();
    try {
      const res = await fetch('/api/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          startDate,
          endDate
        })
      });
      if (!res.ok) throw new Error('Failed to fetch prediction');
      const dataset = await res.json();
      console.log("Received dataset:", dataset);
      
      const updatedLocations = [...locations];
      updatedLocations[index].ready = true;
      updatedLocations[index].prediction = dataset.prediction;
      setLocations(updatedLocations);
      setLoading(false);
    } catch (error) {
      console.error('Prediction request failed:', error);
    }
  };
  
  const seePrediction = (lat: number, lng: number) => {
    window.location.href = `/prediction/${lat}/${lng}`;
  };

  const seeHistory = (lat:number, lng: number) => {
    window.location.href = `History/${lat}/${lng}`;
  }
  
  useEffect(() => { 
    fetchLocations(); 
  }, []);
  
  return (
    <BaseLayout isAuthenticated={true} username={user.username}>
      <div className="container mt-4">
        <h1 className="text-center display-3">Saved Regions</h1>
        {locations.length === 0 ? (
          <div className="alert alert-info">
            No saved locations.
          </div>
        ) : (
          <div className="list-group">
            {locations.map((loc, i) => (
              <div key={i} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold">
                      {loc.coordinates[1]}, {loc.coordinates[0]}
                    </span>
                    {' – '}
                    {loc.country}, {loc.region}
                    <div>
                      <small className="text-muted">
                        {new Date(loc.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <div>
                    {loc.ready ? (
                      <button
                        className="btn btn-outline-success btn-sm me-2"
                        onClick={() => seePrediction(loc.coordinates[1], loc.coordinates[0])}
                      >
                        See Prediction
                      </button>
                    ) : (<>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => requestPrediction(loc.coordinates[1], loc.coordinates[0], i)}
                      >
                        Request Prediction
                      </button>
                      <LoadingModal show={isLoading}/>
                      </>
                    )}
                    <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => seeHistory(loc.coordinates[0], loc.coordinates[1])}
                    >Historical Insights</button>
                    <button
                      onClick={() => deleteOne(loc.coordinates[0], loc.coordinates[1])}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseLayout>
  );
}