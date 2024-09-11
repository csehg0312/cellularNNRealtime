import asyncio
import json
from pathlib import Path
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay

# Global variable to store the received frames
frames = asyncio.Queue()

class VideoTransformTrack:
    def __init__(self, track):
        self.track = track
        self.kind = "video"
        self.id = str(id(self))

    async def recv(self):
        frame = await self.track.recv()
        # Store the frame in the global queue
        await frames.put(frame)
        return frame

async def handle_offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs = request.app['pcs']
    pcs.add(pc)

    relay = MediaRelay()

    @pc.on("track")
    def on_track(track):
        pc.addTrack(VideoTransformTrack(relay.subscribe(track)))

    # Set the remote description
    await pc.setRemoteDescription(offer)

    # Create an answer
    answer = await pc.createAnswer()

    # Set the local description
    await pc.setLocalDescription(answer)

    # Return the answer to the client
    return web.Response(
        content_type="application/json",
        text=json.dumps({
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type
        })
    )

async def handle_upload(request):
    # Implement your upload handling logic here
    return web.Response(text="Upload endpoint")

async def on_shutdown(app):
    # Close peer connections
    coros = [pc.close() for pc in app['pcs']]
    await asyncio.gather(*coros)
    app['pcs'].clear()
    