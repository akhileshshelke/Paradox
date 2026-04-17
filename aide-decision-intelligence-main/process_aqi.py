import pandas as pd
import numpy as np

# Load the raw kaggle dataset
df = pd.read_csv(r"c:\Users\ANUPAM\Downloads\archive\AQI.csv")

# We want unique stations with lat/lng
# Each station has multiple rows for each pollutant (PM2.5, PM10, SO2, CO, etc)
# Let's pivot this to get baseline_pm25

# Extract PM2.5 rows
pm25_df = df[df['pollutant_id'] == 'PM2.5'][['station', 'pollutant_avg']].rename(columns={'pollutant_avg': 'baseline_pm25'})

# Drop duplicates from main df to get station info
stations = df[['state', 'city', 'station', 'latitude', 'longitude']].drop_duplicates(subset=['station'])

# Merge
merged = pd.merge(stations, pm25_df, on='station', how='left')

# Drop NA rows where latitude or longitude is missing
merged = merged.dropna(subset=['latitude', 'longitude'])

# Fill missing baseline_pm25 randomly or with mean
merged['baseline_pm25'] = merged['baseline_pm25'].replace('NA', np.nan).astype(float)
merged['baseline_pm25'] = merged['baseline_pm25'].fillna(60.0)

# Format for synthetic feed
# station_id,station_name,lat,lng,zone,baseline_pm25
out_df = pd.DataFrame()
out_df['station_id'] = merged['city'].str.lower().str.replace(' ', '_') + '-' + merged.index.astype(str)
out_df['station_name'] = merged['station']
out_df['lat'] = merged['latitude']
out_df['lng'] = merged['longitude']

# Assign random zones
zones = ['residential', 'industrial', 'traffic', 'commercial', 'park']
np.random.seed(42)
out_df['zone'] = np.random.choice(zones, size=len(out_df))
out_df['baseline_pm25'] = merged['baseline_pm25']

# Ensure numeric lat/lng
out_df['lat'] = pd.to_numeric(out_df['lat'], errors='coerce')
out_df['lng'] = pd.to_numeric(out_df['lng'], errors='coerce')
out_df = out_df.dropna(subset=['lat', 'lng'])

# Save to backend
out_df.to_csv(r"c:\Users\ANUPAM\Downloads\aide-decision-intelligence-main\aide-decision-intelligence-main\backend\app\data\delhi_stations.csv", index=False)
print(f"Exported {len(out_df)} stations to backend/data/stations.csv")
