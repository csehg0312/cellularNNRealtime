import cv2
import numpy as np
import io
import asyncio
import base64
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaRecorder
from PIL import Image, UnidentifiedImageError 
from pathlib import Path

# Path to the dist directory
dist_path = Path(__file__).parent / "dist"

class ImageProcessorTrack(VideoStreamTrack):
    """
    A video track that applies image processing to the frames it receives.
    """
    def __init__(self, track):
        super().__init__()  # Initializes the base VideoStreamTrack class
        self.track = track

    async def recv(self):
        frame = await self.track.recv()

        # Convert frame to image
        img = frame.to_ndarray(format="bgr24")

        # Apply image processing (e.g., grayscale)
        processed_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Convert back to VideoFrame
        new_frame = VideoStreamTrack.from_ndarray(processed_img, format="gray")

        return new_frame

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
        
        if image is None:
            print("Error: Unable to decode image. The file may be invalid or unsupported.")
            return web.Response(status=400, text="Invalid image file")
        
        print("Image successfully decoded")

        # Process the image (example: convert to grayscale)
        processed_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

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

async def handle_offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params['sdp'], type=params['type'])

    pc = RTCPeerConnection()

    # Recorder to save received video to a file
    recorder = MediaRecorder("received.mp4")

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        async def on_message(message):
            print(f"Received message: {message}")
            if message == "BYE":
                await recorder.stop()

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        print(f"ICE connection state is {pc.iceConnectionState}")
        if pc.iceConnectionState == "failed":
            await pc.close()

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            pc.addTrack(ImageProcessorTrack(track))
            recorder.addTrack(track)

        @track.on("ended")
        async def on_ended():
            print("Track ended")
            await recorder.stop()

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type
    })

# Serve static files from the dist/assets directory
app = web.Application()
app.router.add_post('/upload', handle_upload)
app.router.add_post('/offer', handle_offer)

# Serve static assets from dist/assets
app.router.add_static('/assets/', path=dist_path / 'assets', name='assets')

# Serve the main index.html
async def handle_index(request):
    return web.FileResponse(dist_path / "index.html")

app.router.add_get('/', handle_index)

if __name__ == '__main__':
    web.run_app(app, port=8000)
