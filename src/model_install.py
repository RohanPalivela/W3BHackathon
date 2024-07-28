from dotenv import load_dotenv
import requests
import os

load_dotenv()

MODEL_URL = os.getenv('MODEL_URL')

print(MODEL_URL)

def download_file_from_dropbox(dropbox_url, destination):
    """Download a file from Dropbox using a direct download link."""
    response = requests.get(dropbox_url, stream=True)
    response.raise_for_status()  # Check for errors
    
    # Save the file
    with open(destination, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)
    
    print(f'File downloaded and saved as {destination}')

# Dropbox link with direct download parameter
dropbox_url = MODEL_URL
destination = 'model.joblib'
download_file_from_dropbox(dropbox_url, destination)