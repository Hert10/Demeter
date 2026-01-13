import requests
import pandas as pd
import sys
import os

def get_nasa_power_data(lat, lon, parameters, start_date, end_date):
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": parameters,
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start_date,
        "end": end_date,
        "format": "JSON"
    }
    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}", file=sys.stderr)
        return None

def convert_to_csv(data, filename):
    if not data:
        return None

    parameters = data["properties"]["parameter"]
    df = pd.DataFrame(parameters)
    df.index = pd.to_datetime(df.index)
    df.index.name = "DATE"
    df.reset_index(inplace=True)

    data_path = os.path.join(os.getcwd(), 'data', filename)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)

    # Save the CSV file
    df.to_csv(data_path, index=False)
    return filename  

if __name__ == "__main__":
    try:
        lat = float(sys.argv[1])
        lon = float(sys.argv[2])
        start_date = sys.argv[3]
        end_date = sys.argv[4]
        parameters = sys.argv[5]

        data = get_nasa_power_data(lat, lon, parameters, start_date, end_date)
        filename = f"nasa_power_data_{lat}_{lon}_{start_date}_{end_date}.csv"
        saved_file = convert_to_csv(data, filename)

        if saved_file:
            print(saved_file)  
        else:
            print("[]")  
    except Exception as e:
        print(f"Error occurred: {str(e)}", file=sys.stderr)
