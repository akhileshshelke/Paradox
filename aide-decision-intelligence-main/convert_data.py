import pandas as pd
import numpy as np

def convert_aqi_dataset(input_path, output_path):
    df = pd.read_csv(input_path)
    
    # Standardize column naming if needed (already seems good)
    # Filter for PM2.5 to get baselines
    pm25_df = df[df['pollutant_id'] == 'PM2.5'].copy()
    
    # Create station entries
    # We need: station_id, station_name, lat, lng, zone, baseline_pm25
    
    # Group by station to get unique coordinates
    stations = df.groupby(['station', 'latitude', 'longitude', 'city']).size().reset_index()
    
    # Map PM2.5 baselines
    baselines = pm25_df.groupby('station')['pollutant_avg'].mean().to_dict()
    
    # Fallback for stations without PM2.5: check PM10
    pm10_df = df[df['pollutant_id'] == 'PM10'].copy()
    pm10_baselines = pm10_df.groupby('station')['pollutant_avg'].mean().to_dict()
    
    final_rows = []
    for _, row in stations.iterrows():
        sid = row['station'].lower().replace(' ', '-').replace(',', '').replace('.', '')
        # Add city prefix to ensure uniqueness if needed, but station names often include city
        
        name = row['station']
        lat = row['latitude']
        lng = row['longitude']
        
        b25 = baselines.get(name, np.nan)
        if np.isnan(b25):
            # Estimate from PM10 if available (PM2.5 is usually ~0.6 of PM10 in India)
            b10 = pm10_baselines.get(name, 60)
            b25 = b10 * 0.6
            
        # Assign a zone based on city name or random
        zones = ['residential', 'commercial', 'industrial', 'traffic', 'park']
        zone = np.random.choice(zones, p=[0.3, 0.3, 0.15, 0.15, 0.1])
        
        final_rows.append({
            'station_id': sid,
            'station_name': name,
            'lat': lat,
            'lng': lng,
            'zone': zone,
            'baseline_pm25': round(b25, 1)
        })
        
    out_df = pd.DataFrame(final_rows)
    # Deduplicate station_id
    out_df['station_id'] = out_df['station_id'] + '-' + out_df.index.astype(str)
    
    out_df.to_csv(output_path, index=False)
    print(f"Converted {len(out_df)} stations saved to {output_path}")

if __name__ == "__main__":
    convert_aqi_dataset(
        r"c:\Users\ANUPAM\Downloads\aide-decision-intelligence-main\data\AQI.csv",
        r"C:\Users\ANUPAM\Downloads\aide-decision-intelligence-main\aide-decision-intelligence-main\backend\app\data\india_stations.csv"
    )
