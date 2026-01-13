import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';

const ClimateInsights = ({ lat, lng }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('5y'); // Options: '1y', '3y', '5y', 'all'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/find-processed?lat=${lat}&lng=${lng}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sort by date ascending
        data.sort((a, b) => new Date(a.DATE).getTime() - new Date(b.DATE).getTime());
        
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lng]);

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (!weatherData.length) return [];
    
    const currentDate = new Date();
    let cutoffDate = new Date();
    
    switch (timeframe) {
      case '1y':
        cutoffDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case '3y':
        cutoffDate.setFullYear(currentDate.getFullYear() - 3);
        break;
      case '5y':
        cutoffDate.setFullYear(currentDate.getFullYear() - 5);
        break;
      case 'all':
      default:
        return weatherData;
    }
    
    return weatherData.filter(item => new Date(item.DATE) >= cutoffDate);
  };

  const filteredData = getFilteredData();
  
  // Format data for charts
  const chartData = filteredData.map(item => ({
    date: new Date(item.DATE).toLocaleDateString(),
    spi30d: parseFloat(item.SPI_30d) || 0,
    spi30dLag30: parseFloat(item.SPI_30d_LAG30) || 0,
    prec: parseFloat(item.PRECTOTCORR) || 0,
    soilMoisture: parseFloat(item.SOIL_MOISTURE_ZSCORE) || 0,
    soilMoistureLag7d: parseFloat(item.SOIL_MOISTURE_ZSCORE_7D_LAGGED) || 0,
    esi: parseFloat(item.ESI) || 0,
    daysSinceRain: parseFloat(item.DAYS_SINCE_RAIN_LAGGED) || 0,
    droughtSeverity: parseFloat(item.DROUGHT_SEVERITY_RATIO) || 0,
    floodSeverity: parseFloat(item.FLOOD_SEVERITY_RATIO) || 0,
    spei90dLag7d: parseFloat(item.SPEI_90d_7D_LAGGED) || 0
  }));

  // Simplify data for charts - keep every Nth point to improve performance
  const simplifyData = (data, count = 50) => {
    if (data.length <= count) return data;
    const step = Math.ceil(data.length / count);
    return data.filter((_, i) => i % step === 0);
  };
  
  const simplifiedData = simplifyData(chartData);

  // Calculate moving averages for precipitation (30-day window)
  const calculateMovingAvg = (data, field, windowSize = 30) => {
    return data.map((item, index) => {
      const window = data.slice(Math.max(0, index - windowSize + 1), index + 1);
      const sum = window.reduce((acc, curr) => acc + (curr[field] || 0), 0);
      return {
        ...item,
        [`${field}MA`]: window.length > 0 ? sum / window.length : 0
      };
    });
  };
  
  const dataWithMovingAvgs = calculateMovingAvg(simplifiedData, 'prec');

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 fw-bold mb-3">Climate Insights for {lat}, {lng}</h1>
          
          {loading && <p>Loading weather data...</p>}
          {error && <p className="text-danger">Error: {error}</p>}
          
          <div className="mb-3">
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${timeframe === '1y' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('1y')}
              >
                1 Year
              </button>
              <button 
                className={`btn btn-sm ${timeframe === '3y' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('3y')}
              >
                3 Years
              </button>
              <button 
                className={`btn btn-sm ${timeframe === '5y' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('5y')}
              >
                5 Years
              </button>
              <button 
                className={`btn btn-sm ${timeframe === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('all')}
              >
                All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="row g-4">
          {/* SPI and Precipitation Combined Chart */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title h5 fw-bold">Drought Index (SPI-30d) & Precipitation</h3>
                <div style={{ height: "400px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={simplifiedData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(simplifiedData.length / 15)}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={[-3, 3]} 
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        label={{ value: 'SPI-30d', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        label={{ value: 'Precipitation (mm)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <CartesianGrid y={0} stroke="rgba(0, 0, 0, 0.2)" strokeDasharray="3 3" />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="spi30d" 
                        name="SPI 30-Day" 
                        stroke="#8884d8" 
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="spi30dLag30" 
                        name="SPI 30-Day (30-day lag)" 
                        stroke="#82ca9d" 
                        dot={false}
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="prec" 
                        name="Daily Precipitation" 
                        fill="#a4caed" 
                        opacity={0.7}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="small text-secondary mt-2">
                  This chart combines the SPI-30d drought index with actual precipitation, 
                  helping to visualize the relationship between rainfall events and drought conditions.
                </div>
              </div>
            </div>
          </div>

          {/* Soil Moisture and ESI */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h3 className="card-title h5 fw-bold">Soil Moisture & Evaporative Stress</h3>
                <div style={{ height: "350px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simplifiedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(simplifiedData.length / 10)}
                      />
                      <YAxis 
                        domain={[-3, 3]} 
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        label={{ value: 'Z-Score', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <CartesianGrid y={0} stroke="rgba(0, 0, 0, 0.2)" strokeDasharray="3 3" />
                      <Line 
                        type="monotone" 
                        dataKey="soilMoisture" 
                        name="Soil Moisture Z-Score" 
                        stroke="#8b5cf6" 
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="soilMoistureLag7d" 
                        name="Soil Moisture (7-day lag)" 
                        stroke="#c084fc" 
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="esi" 
                        name="Evaporative Stress Index" 
                        stroke="#10b981" 
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="spei90dLag7d" 
                        name="SPEI-90d (7-day lag)" 
                        stroke="#047857" 
                        strokeDasharray="3 3"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="small text-secondary mt-2">
                  Soil moisture and evaporative stress indices show how drought conditions 
                  affect water availability for plants and ecosystems.
                </div>
              </div>
            </div>
          </div>

          {/* Days Since Rain & Severity Ratios */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h3 className="card-title h5 fw-bold">Drought & Flood Severity</h3>
                <div style={{ height: "350px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={simplifiedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(simplifiedData.length / 10)}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={[0, dataWithMovingAvgs.length ? Math.max(...dataWithMovingAvgs.map(d => d.daysSinceRain * 1.1)) : 30]} 
                        label={{ value: 'Days Since Rain', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 1]}
                        label={{ value: 'Severity Ratio', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar 
                        yAxisId="left"
                        dataKey="daysSinceRain" 
                        name="Days Since Rain" 
                        fill="#fbbf24" 
                        opacity={0.7}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="droughtSeverity" 
                        name="Drought Severity Ratio" 
                        stroke="#b91c1c" 
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="floodSeverity" 
                        name="Flood Severity Ratio" 
                        stroke="#1d4ed8" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="small text-secondary mt-2">
                  This chart shows the length of dry periods and the relative severity of drought and flood conditions,
                  helping to identify extreme events.
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Explanation */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title h5 fw-bold mb-3">Understanding Climate Metrics</h3>
                
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  <div className="col">
                    <h4 className="h6 fw-bold">SPI (Standardized Precipitation Index)</h4>
                    <p className="small">
                      Quantifies precipitation deficit over different timescales. Values below -1 indicate drought conditions,
                      while values above 1 indicate unusually wet conditions.
                    </p>
                  </div>
                  
                  <div className="col">
                    <h4 className="h6 fw-bold">Soil Moisture Z-Score</h4>
                    <p className="small">
                      Indicates how current soil moisture compares to historical averages.
                      Negative values suggest drier than normal conditions.
                    </p>
                  </div>
                  
                  <div className="col">
                    <h4 className="h6 fw-bold">ESI (Evaporative Stress Index)</h4>
                    <p className="small">
                      Measures the ratio of actual to potential evapotranspiration, indicating plant water stress.
                      Negative values suggest vegetation is experiencing water stress.
                    </p>
                  </div>
                  
                  <div className="col">
                    <h4 className="h6 fw-bold">Drought & Flood Severity Ratios</h4>
                    <p className="small">
                      Values closer to 1 indicate more severe drought or flood conditions relative to historical patterns.
                      These metrics help identify extreme climate events.
                    </p>
                  </div>
                  
                  <div className="col">
                    <h4 className="h6 fw-bold">Days Since Rain</h4>
                    <p className="small">
                      The number of consecutive days without significant precipitation.
                      Longer periods indicate extended dry spells that can intensify drought conditions.
                    </p>
                  </div>
                  
                  <div className="col">
                    <h4 className="h6 fw-bold">Lagged Indicators</h4>
                    <p className="small">
                      Metrics with "lag" in their name show conditions from previous periods (7, 30, 60, or 90 days prior).
                      These help identify delayed effects and trends in climate patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateInsights;