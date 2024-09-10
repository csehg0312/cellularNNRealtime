from julia.api import Julia
jl = Julia(compiled_modules=False)

import cv2
import numpy as np
import asyncio
import base64
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaRecorder, MediaRelay, MediaPlayer, MediaBlackhole
from PIL import Image, UnidentifiedImageError 
from pathlib import Path
from cnn_v1 import cnnCall
from av import VideoFrame
from use_rtc import handle_offer, on_shutdown, process_frames

# Path to the dist directory
dist_path = Path(__file__).parent / "dist"
pcs = set()
relay = MediaRelay()

async def handle_upload(request):
    try:
        # Reading the multipart data
        reader = await request.multipart()
        field = await reader.next()

        # Check if the field is actually an uploaded file
        if field.name != 'file':
            return web.Response(status=400, text="No file uploaded")

        print("Image received")

        # Read the data from the field
        data = await field.read(decode=True)
        
        # Convert data to string to strip the base64 header
        data_str = data.decode('utf-8')
        
        # Check for the base64 header and strip it
        if data_str.startswith('data:image'):
            # Strip the data URL prefix
            base64_data = data_str.split(',')[1]
        else:
            return web.Response(status=400, text="Invalid image format")

        # Decode the Base64 string to raw image bytes
        image_data = base64.b64decode(base64_data)
        
        # Convert the binary data to a numpy array
        np_array = np.frombuffer(image_data, np.uint8)

        # Decode the numpy array into an image
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        if image is None:
            print("Error: Unable to decode image. The file may be invalid or unsupported.")
            return web.Response(status=400, text="Invalid image file")
        
        print("Image successfully decoded")

        # Read the selected size field
        fields = {}
        while True:
            field = await reader.next()
            if field is None:
                break
            
            if field.name in ['keep_original_size', 'size', 'invert_size']:
                value = await field.read(decode=True)
                value = value.decode('utf-8')
                fields[field.name] = value
            else:
                break

            
        keep_original_size = fields.get('keep_original_size')
        selected_size = fields.get('size')
        invert_size = fields.get('invert_size')
        
        if keep_original_size.lower() == 'false':
            # Resize the image based on the selected size
            width, height = map(int, selected_size.split('x'))
            if invert_size.lower() == 'true':
                width, height = height, width  # invert sizes
            image = cv2.resize(image, (width, height))
        # Call the Julia ODE solver via the cnnCall function
        processed_image = cnnCall(image)

        # Encode the processed image back to bytes
        success, encoded_image = cv2.imencode('.png', processed_image)

        if not success:
            return web.Response(status=500, text="Failed to encode image")

        print("Image successfully processed and encoded")

        # Return the processed image
        return web.Response(body=encoded_image.tobytes(), content_type='image/png')

    except Exception as e:
        print(f"Error: {str(e)}")
        return web.Response(status=500, text="Internal server error")

# Serve static files from the dist/assets directory
app = web.Application()
app.router.add_post('/upload', handle_upload)
app.router.add_post('/offer', handle_offer)
app['pcs'] = set()

# Serve static assets from dist/assets
app.router.add_static('/assets/', path=dist_path / 'assets', name='assets')

app.on_shutdown.append(on_shutdown)

# Serve the main index.html
async def handle_index(request):
    return web.FileResponse(dist_path / "index.html")

app.router.add_get('/', handle_index)

# Start frame processing
asyncio.get_event_loop().create_task(process_frames())

if __name__ == '__main__':
    web.run_app(app, port=8000)
