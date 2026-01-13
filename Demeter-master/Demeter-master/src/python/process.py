import pandas as pd
import numpy as np
import os
from scipy import stats
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional

class ClimateRiskAnalyzer:
    def __init__(self, min_data_points: int = 30, spi_windows: List[int] = [30, 60, 90, 180, 365]):
        self.min_data_points = min_data_points
        self.spi_windows = spi_windows
        self.climate_vars = [
            'T2M', 'T2M_MIN', 'T2M_MAX', 'GWETROOT', 'RH2M', 
            'ALLSKY_SFC_SW_DWN', 'WS2M', 'PRECTOTCORR'
        ]
        self.gamma_params = {}  # Store gamma distribution parameters for each SPI window
        self.daily_norms = {}    # Store daily normals for anomaly calculations

    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess NASA POWER data"""
        df = pd.read_csv(file_path)
        
        # Basic cleaning
        df.columns = df.columns.str.strip()
        df['DATE'] = pd.to_datetime(df['DATE'])
        df.set_index('DATE', inplace=True)
        
        # Validate required columns
        missing_vars = [var for var in self.climate_vars if var not in df.columns]
        if missing_vars:
            raise ValueError(f"Missing required columns: {missing_vars}")
            
        # Check data continuity
        self._validate_data_continuity(df)
        
        return df

    def _validate_data_continuity(self, df: pd.DataFrame):
        """Check for missing dates and data quality"""
        date_range = pd.date_range(start=df.index.min(), end=df.index.max())
        missing_dates = date_range.difference(df.index)
        if len(missing_dates) > 0:
            print(f"Warning: {len(missing_dates)} missing dates in the dataset")
        
        # Check for unrealistic values
        for var in self.climate_vars:
            if df[var].isna().sum() > 0:
                print(f"Warning: {var} has {df[var].isna().sum()} missing values")

    def calculate_spi(self, precip_series: pd.Series, window: int) -> pd.Series:
        """Calculate SPI for a specific time window with safeguards"""
        rolling_sums = precip_series.rolling(window=window, min_periods=window).sum()
        
        # Only fit gamma distribution to non-zero values with sufficient history
        non_zero = rolling_sums[rolling_sums > 0].dropna()
        
        if len(non_zero) < self.min_data_points:
            return pd.Series(np.nan, index=precip_series.index, name=f'SPI_{window}d')
        
        # Fit gamma distribution and store parameters
        try:
            shape, loc, scale = stats.gamma.fit(non_zero, floc=0)
            self.gamma_params[window] = (shape, loc, scale)
        except Exception as e:
            print(f"Warning: Gamma fit failed for window {window}: {str(e)}")
            return pd.Series(np.nan, index=precip_series.index, name=f'SPI_{window}d')
        
        # Calculate probability of zero precipitation
        prob_zero = len(rolling_sums[rolling_sums == 0]) / len(rolling_sums.dropna())
        prob_zero = max(0.001, min(0.5, prob_zero))  # Keep within reasonable bounds
        
        # Calculate SPI for each value
        spi_values = []
        for val in rolling_sums:
            if pd.isna(val):
                spi_values.append(np.nan)
            elif val == 0:
                # Use mixed distribution approach for zeros
                if prob_zero > 0:
                    # Limit extreme values from norm.ppf
                    spi = max(-4.0, stats.norm.ppf(prob_zero))
                    spi_values.append(min(spi, -0.1))  # Ensure zero precip gets negative SPI
                else:
                    spi_values.append(-1.0)  # Default value for zero precip
            else:
                try:
                    cdf = stats.gamma.cdf(val, shape, loc=loc, scale=scale)
                    # Ensure CDF is within reasonable range
                    cdf = max(0.001, min(0.999, cdf))
                    # Adjust for zero probability
                    if prob_zero > 0:
                        cdf = prob_zero + (1 - prob_zero) * cdf
                        cdf = max(0.001, min(0.999, cdf))  # Bound again after adjustment
                    # Limit extreme values from norm.ppf
                    spi = max(-4.0, min(4.0, stats.norm.ppf(cdf)))
                    spi_values.append(spi)
                except Exception:
                    spi_values.append(np.nan)
                    
        return pd.Series(spi_values, index=precip_series.index, name=f'SPI_{window}d')

    def calculate_all_spi(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate SPI for all specified windows"""
        result_df = df.copy()
        precip = df['PRECTOTCORR']
        
        for window in self.spi_windows:
            spi_series = self.calculate_spi(precip, window)
            result_df[spi_series.name] = spi_series
            
        return result_df

    def calculate_pet(self, df: pd.DataFrame) -> pd.Series:
        """Calculate Potential Evapotranspiration using Hargreaves method"""
        # Hargreaves simplified equation: PET = 0.0023 * Ra * (Tmean + 17.8) * sqrt(Tmax - Tmin)
        # Where Ra is extraterrestrial radiation (approximated by ALLSKY_SFC_SW_DWN)
        t_mean = (df['T2M_MAX'] + df['T2M_MIN']) / 2
        t_diff = df['T2M_MAX'] - df['T2M_MIN']
        pet = 0.0023 * df['ALLSKY_SFC_SW_DWN'] * (t_mean + 17.8) * np.sqrt(t_diff)
        return pet

    def calculate_spei(self, df: pd.DataFrame, window: int = 90) -> pd.Series:
        """Calculate Standardized Precipitation-Evapotranspiration Index with safeguards"""
        pet = self.calculate_pet(df).clip(0.1, 50)  # Ensure PET is in reasonable range
        water_balance = df['PRECTOTCORR'] - pet
        water_balance_sums = water_balance.rolling(window=window, min_periods=window).sum()
        
        # Fit a distribution (using gamma or pearson3)
        non_missing = water_balance_sums.dropna()
        if len(non_missing) < self.min_data_points:
            return pd.Series(np.nan, index=df.index, name=f'SPEI_{window}d')
            
        try:
            # Pearson3 often fits water balance data better than gamma
            params = stats.pearson3.fit(non_missing)
            
            # Safe computation of CDF and norm.ppf values
            spei_values = []
            for val in water_balance_sums:
                if pd.isna(val):
                    spei_values.append(np.nan)
                else:
                    try:
                        # Restrict CDF values to avoid infinity from norm.ppf
                        cdf = max(0.001, min(0.999, stats.pearson3.cdf(val, *params)))
                        spei = max(-4.0, min(4.0, stats.norm.ppf(cdf)))
                        spei_values.append(spei)
                    except:
                        spei_values.append(np.nan)
                        
            return pd.Series(spei_values, index=df.index, name=f'SPEI_{window}d')
        except Exception as e:
            print(f"Warning: SPEI calculation failed: {str(e)}")
            return pd.Series(np.nan, index=df.index, name=f'SPEI_{window}d')

    def calculate_soil_moisture_anomaly(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate soil moisture anomalies using Z-score method"""
        result_df = df.copy()
        sm_col = 'GWETROOT'
        
        # Calculate daily normals if not already calculated
        if not self.daily_norms.get(sm_col):
            daily_means = df[sm_col].groupby(df.index.dayofyear).mean()
            daily_stds = df[sm_col].groupby(df.index.dayofyear).std()
            self.daily_norms[sm_col] = (daily_means, daily_stds)
        
        daily_means, daily_stds = self.daily_norms[sm_col]
        
        anomalies = []
        for date, row in df.iterrows():
            day = date.dayofyear
            if day in daily_means.index and daily_stds[day] > 0:
                anomaly = (row[sm_col] - daily_means[day]) / daily_stds[day]
                anomalies.append(anomaly)
            else:
                anomalies.append(np.nan)
                
        result_df['SOIL_MOISTURE_ZSCORE'] = anomalies
        return result_df

    def calculate_vpd(self, df: pd.DataFrame) -> pd.Series:
        """Calculate Vapor Pressure Deficit (important for drought)"""
        # Calculate saturation vapor pressure (es) and actual vapor pressure (ea)
        es = 0.6108 * np.exp((17.27 * df['T2M']) / (df['T2M'] + 237.3))  # kPa
        ea = es * (df['RH2M'] / 100)
        vpd = es - ea
        return vpd
    
    def _add_severity_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add severity-related feature ratios with robust calculations"""
        try:
            # Safe calculation for drought severity ratio
            df['DROUGHT_SEVERITY_RATIO'] = np.zeros(len(df))
            valid_mask = ~df['SPI_30d'].isna() & ~df['SPI_90d'].isna()
            
            # Handle potential division by zero or near-zero
            denominator_mask = np.abs(df['SPI_30d']) > 0.1
            safe_mask = valid_mask & denominator_mask
            
            # Calculate only where denominator is safe
            df.loc[safe_mask, 'DROUGHT_SEVERITY_RATIO'] = (
                df.loc[safe_mask, 'SPI_90d'] / 
                (df.loc[safe_mask, 'SPI_30d'] + np.sign(df.loc[safe_mask, 'SPI_30d']) * 0.01)
            )
            
            # Handle where denominator is unsafe - use sign of SPI_90d * 10 as default
            unsafe_mask = valid_mask & ~denominator_mask
            if any(unsafe_mask):
                df.loc[unsafe_mask, 'DROUGHT_SEVERITY_RATIO'] = (
                    np.sign(df.loc[unsafe_mask, 'SPI_90d']) * 10
                )
            
            # Cap at reasonable bounds to avoid infinity
            df['DROUGHT_SEVERITY_RATIO'] = df['DROUGHT_SEVERITY_RATIO'].clip(-100, 100)
            
            # Similar approach for flood severity ratio
            df['FLOOD_SEVERITY_RATIO'] = np.zeros(len(df))
            denominator_mask = np.abs(df['SPI_90d']) > 0.1
            safe_mask = valid_mask & denominator_mask
            
            df.loc[safe_mask, 'FLOOD_SEVERITY_RATIO'] = (
                df.loc[safe_mask, 'SPI_30d'] / 
                (df.loc[safe_mask, 'SPI_90d'] + np.sign(df.loc[safe_mask, 'SPI_90d']) * 0.01)
            )
            
            unsafe_mask = valid_mask & ~denominator_mask
            if any(unsafe_mask):
                df.loc[unsafe_mask, 'FLOOD_SEVERITY_RATIO'] = (
                    np.sign(df.loc[unsafe_mask, 'SPI_30d']) * 10
                )
                
            df['FLOOD_SEVERITY_RATIO'] = df['FLOOD_SEVERITY_RATIO'].clip(-100, 100)
            
            # Make sure other calculations have guardrails against infinity
            if 'ESI' in df.columns:
                df['ESI'] = df['ESI'].clip(-10, 10)  # Reasonable bounds for ESI
                df['MOISTURE_STRESS'] = df['SOIL_MOISTURE_ZSCORE'] * df['ESI']
                df['MOISTURE_STRESS'] = df['MOISTURE_STRESS'].clip(-50, 50)
            else:
                df['MOISTURE_STRESS'] = df['SOIL_MOISTURE_ZSCORE'].clip(-5, 5)
                
            # Climate stress with bounds
            if 'VPD' in df.columns and 'TEMP_ANOMALY' in df.columns:
                df['VPD'] = df['VPD'].clip(0.01, 10)  # Reasonable bounds for VPD
                df['TEMP_ANOMALY'] = df['TEMP_ANOMALY'].clip(-20, 20)  # Reasonable temp anomaly bounds
                df['CLIMATE_STRESS'] = (df['VPD'] * df['TEMP_ANOMALY']) / (df['GWETROOT'].clip(0.1, 1.0))
                df['CLIMATE_STRESS'] = df['CLIMATE_STRESS'].clip(-100, 100)

        except KeyError as e:
            print(f"Warning: Missing required column for severity features: {str(e)}")
        except Exception as e:
            print(f"Warning: Error calculating severity features: {str(e)}")
        
        return df

    def _create_lagged_features(self, df: pd.DataFrame, lag_windows=[7, 14]) -> pd.DataFrame:
        """Create lagged features with selected windows"""
        result_df = df.copy()

        for lag in lag_windows:
            result_df[f'PRECTOTCORR_{lag}D_LAGGED'] = df['PRECTOTCORR'].shift(lag)
            for spi_window in [30, 60, 90]:
                spi_col = f'SPI_{spi_window}d'
                if spi_col in df.columns:
                    result_df[f'{spi_col}_{lag}D_LAGGED'] = df[spi_col].shift(lag)

            for ratio_col in ['DROUGHT_SEVERITY_RATIO', 'FLOOD_SEVERITY_RATIO']:
                if ratio_col in df.columns:
                    result_df[f'{ratio_col}_{lag}D_LAGGED'] = df[ratio_col].shift(lag)

            if 'SOIL_MOISTURE_ZSCORE' in df.columns:
                result_df[f'SOIL_MOISTURE_ZSCORE_{lag}D_LAGGED'] = df['SOIL_MOISTURE_ZSCORE'].shift(lag)

            if 'SPEI_90d' in df.columns:
                result_df[f'SPEI_90d_{lag}D_LAGGED'] = df['SPEI_90d'].shift(lag)

        result_df['DAYS_SINCE_RAIN_LAGGED'] = df['PRECTOTCORR'].rolling(30, min_periods=1).apply(
            lambda x: len(x) - np.argmax(x[::-1] > 1.0) - 1 if any(x > 1.0) else len(x)
        )

        return result_df


    def calculate_additional_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate all additional features for the model"""
        result_df = df.copy()
        
        # 1. SPI calculations
        result_df = self.calculate_all_spi(result_df)
        
        # 2. SPEI calculation
        result_df['SPEI_90d'] = self.calculate_spei(result_df, window=90)
        
        # 3. Soil moisture anomalies
        result_df = self.calculate_soil_moisture_anomaly(result_df)
        
        # 4. Vapor Pressure Deficit
        result_df['VPD'] = self.calculate_vpd(result_df)
        
        # 5. Temperature anomalies
        result_df['TEMP_ANOMALY'] = result_df['T2M'] - result_df['T2M'].rolling(30).mean()
        
        # 6. Evaporative Stress Index (simplified)
        pet = self.calculate_pet(result_df)
        result_df['ESI'] = (result_df['GWETROOT'] - pet) / pet
        
        # 7. Lagged features (previous month's conditions)
        for lag in [30, 60, 90]:
            for col in ['SPI_30d', 'SPEI_90d', 'SOIL_MOISTURE_ZSCORE']:
                if col in result_df.columns:
                    result_df[f'{col}_LAG{lag}'] = result_df[col].shift(lag)
                    
        # 8. Add severity metrics and extra lags
        result_df = self._add_severity_features(result_df)
        result_df = self._create_lagged_features(result_df, lag_windows=[7, 14])
                
        return result_df
    def _sanitize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove infinite values and clip extreme values to reasonable ranges"""
        result_df = df.copy()
        
        # First, replace infinities with NaN
        result_df = result_df.replace([np.inf, -np.inf], np.nan)
        
        # Get numeric columns
        numeric_cols = result_df.select_dtypes(include=np.number).columns.tolist()
        
        # Check for columns with extreme values
        for col in numeric_cols:
            if col == 'CONDITION_CODE' or col.startswith('MONTH') or col.startswith('DAY'):
                continue  # Skip categorical and cyclical features
                
            # Calculate percentiles for column
            q1, q99 = result_df[col].quantile([0.01, 0.99])
            iqr = q99 - q1
            lower_bound = q1 - 3 * iqr
            upper_bound = q99 + 3 * iqr
            
            # Clip extreme values but keep NaNs
            mask = ~result_df[col].isna()
            result_df.loc[mask, col] = result_df.loc[mask, col].clip(lower_bound, upper_bound)
        
        return result_df
    
    def classify_conditions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Classify drought/flood conditions using multiple indicators"""
        result_df = df.copy()
        conditions = []
        
        # Define percentiles for classification
        def get_percentile(val, window_data):
            if pd.isna(val) or len(window_data.dropna()) < 30:
                return np.nan
            return stats.percentileofscore(window_data.dropna(), val) / 100
        
        for date, row in result_df.iterrows():
            # Calculate percentiles for key indicators
            spi30_pctl = get_percentile(row.get('SPI_30d', np.nan), 
                                      result_df['SPI_30d'])
            spi90_pctl = get_percentile(row.get('SPI_90d', np.nan), 
                                      result_df['SPI_90d'])
            spei_pctl = get_percentile(row.get('SPEI_90d', np.nan),
                                     result_df['SPEI_90d'])
            sm_pctl = get_percentile(row.get('SOIL_MOISTURE_ZSCORE', np.nan),
                                   result_df['SOIL_MOISTURE_ZSCORE'])
            
            # Classification logic based on percentiles
            condition = "NORMAL"
            
            # Flood conditions (check short-term indicators)
            if (spi30_pctl > 0.98 or 
                (spi30_pctl > 0.9 and sm_pctl > 0.9)):
                condition = "SEVERE_FLOOD_RISK"
            elif (spi30_pctl > 0.9 or 
                  (spi30_pctl > 0.8 and sm_pctl > 0.8)):
                condition = "MODERATE_FLOOD_RISK"
            elif spi30_pctl > 0.8:
                condition = "SLIGHT_FLOOD_RISK"
                
            # Drought conditions (check longer-term indicators)
            elif (spei_pctl < 0.02 or 
                  (spi90_pctl < 0.05 and sm_pctl < 0.1)):
                condition = "SEVERE_DROUGHT_RISK"
            elif (spei_pctl < 0.1 or 
                  (spi90_pctl < 0.1 and sm_pctl < 0.2)):
                condition = "MODERATE_DROUGHT_RISK"
            elif spei_pctl < 0.2 or spi90_pctl < 0.2:
                condition = "SLIGHT_DROUGHT_RISK"
                
            conditions.append(condition)
        
        result_df['CONDITION'] = conditions
        result_df['CONDITION_CODE'] = result_df['CONDITION'].map({
            'SEVERE_FLOOD_RISK': 3,
            'MODERATE_FLOOD_RISK': 2,
            'SLIGHT_FLOOD_RISK': 1,
            'NORMAL': 0,
            'SLIGHT_DROUGHT_RISK': -1,
            'MODERATE_DROUGHT_RISK': -2,
            'SEVERE_DROUGHT_RISK': -3
        })
        
        return result_df

    import os

    def process_file(self, input_path: str, output_path: str):
        """Process a single file with all enhancements"""
        print(f"Processing {input_path}...")
        
        try:
            # 1. Load and validate data
            df = self.load_data(input_path)
            
            # 2. Calculate all features
            df = self.calculate_additional_features(df)
            
            # 3. Sanitize features to remove infinities and extreme values
            df = self._sanitize_features(df)
            
            # 4. Classify conditions
            df = self.classify_conditions(df)
            
            # 5. Save results
            df.to_csv(output_path)
            print(f"Successfully processed and saved to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error processing {input_path}: {str(e)}")
            return False

    def process_folder(self, input_folder: str, output_folder: str):
        """Process all CSV files in a folder that start with 'nasa'"""
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
            
        processed = 0
        for filename in os.listdir(input_folder):
            if filename.startswith("nasa") and filename.endswith(".csv"):
                input_path = os.path.join(input_folder, filename)
                output_path = os.path.join(output_folder, f"enhanced_{filename}")
                
                if self.process_file(input_path, output_path):
                    processed += 1
                    
        print(f"\nProcessing complete. {processed} files processed successfully.")

if __name__ == "__main__":
    analyzer = ClimateRiskAnalyzer()
    
    input_folder = "platform/data"  
    output_folder = "platform/data/proc"  
    
    analyzer.process_folder(input_folder, output_folder)
