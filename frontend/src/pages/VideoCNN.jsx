import { createSignal, createEffect, onCleanup, onMount, For } from 'solid-js';

const WebRTCComponent = () => {
  const [dataChannelLog, setDataChannelLog] = createSignal('');
  const [iceConnectionLog, setIceConnectionLog] = createSignal('');
  const [iceGatheringLog, setIceGatheringLog] = createSignal('');
  const [signalingLog, setSignalingLog] = createSignal('');
  const [offerSdp, setOfferSdp] = createSignal('');
  const [answerSdp, setAnswerSdp] = createSignal('');
  const [showStart, setShowStart] = createSignal(true);
  const [showStop, setShowStop] = createSignal(false);
  const [showMedia, setShowMedia] = createSignal(false);
  
  // State variables for video devices
  const [videoInputs, setVideoInputs] = createSignal([]);
  const [selectedVideoInput, setSelectedVideoInput] = createSignal('');

  //Close variables
  const [isOpen, setIsOpen] = createSignal(true);

  //Peerconnection, datachannel and interval variable
  let pc = null;
  let dc = null;
  let dcInterval = null;

  const createPeerConnection = () => {
    const config = {
      sdpSemantics: 'unified-plan',
      iceServers: document.getElementById('use-stun').checked
        ? [{ urls: ['stun:stun.l.google.com:19302'] }]
        : [],
    };

    pc = new RTCPeerConnection(config);

    pc.addEventListener('icegatheringstatechange', () => {
      setIceGatheringLog(prev => prev + ' -> ' + pc.iceGatheringState);
    });

    pc.addEventListener('iceconnectionstatechange', () => {
      setIceConnectionLog(prev => prev + ' -> ' + pc.iceConnectionState);
    });

    pc.addEventListener('signalingstatechange', () => {
      setSignalingLog(prev => prev + ' -> ' + pc.signalingState);
    });

    pc.addEventListener('track', (evt) => {
      if (evt.track.kind === 'video') {
        document.getElementById('video').srcObject = evt.streams[0];
      }
    });

    return pc;
  };

  const enumerateVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

      setVideoInputs(videoInputDevices);

      if (videoInputDevices.length > 0) {
        setSelectedVideoInput(videoInputDevices[0].deviceId);
      }
    } catch (e) {
      console.error('Error enumerating video devices:', e);
    }
  };

  const negotiate = async () => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
        }
      });

      const localDesc = pc.localDescription;
      let sdp = localDesc.sdp;

      // const videoCodec = document.getElementById('video-codec').value;
      // if (videoCodec !== 'default') {
      //   sdp = sdpFilterCodec('video', videoCodec, sdp);
      // }

      setOfferSdp(sdp);

      const response = await fetch('/offer', {
        body: JSON.stringify({
          sdp: sdp,
          type: localDesc.type,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const answer = await response.json();
      setAnswerSdp(answer.sdp);
      await pc.setRemoteDescription(answer);
    } catch (e) {
      console.error(e);
    }
  };

  const start = async () => {
    setShowStart(false);
    pc = createPeerConnection();

    let timeStart = null;

    const currentStamp = () => {
      if (timeStart === null) {
        timeStart = new Date().getTime();
        return 0;
      } else {
        return new Date().getTime() - timeStart;
      }
    };

    if (document.getElementById('use-datachannel').checked) {
      const parameters = JSON.parse(document.getElementById('datachannel-parameters').value);
      dc = pc.createDataChannel('chat', parameters);

      dc.addEventListener('close', () => {
        clearInterval(dcInterval);
        setDataChannelLog(prev => prev + '- close\n');
      });

      dc.addEventListener('open', () => {
        setDataChannelLog(prev => prev + '- open\n');
        dcInterval = setInterval(() => {
          const message = `ping ${currentStamp()}`;
          setDataChannelLog(prev => prev + `> ${message}\n`);
          dc.send(message);
        }, 1000);
      });

      dc.addEventListener('message', (evt) => {
        setDataChannelLog(prev => prev + `< ${evt.data}\n`);
        if (evt.data.substring(0, 4) === 'pong') {
          const elapsedMs = currentStamp() - parseInt(evt.data.substring(5), 10);
          setDataChannelLog(prev => prev + ` RTT ${elapsedMs} ms\n`);
        }
      });
    }

    const constraints = {
      video: { deviceId: { exact: selectedVideoInput() } }
    };

    // const resolution = document.getElementById('video-resolution').value;
    // if (resolution) {
    //   const [width, height] = resolution.split('x').map(Number);
    //   constraints.video = { ...constraints.video, width, height };
    // }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      setShowMedia(true);
      await negotiate();
    } catch (err) {
      console.error('Could not acquire media:', err);
    }

    setShowStop(true);
  };

  const stop = () => {
    setShowStop(false);

    if (dc) {
      dc.close();
    }

    if (pc.getTransceivers) {
      pc.getTransceivers().forEach(transceiver => {
        if (transceiver.stop) {
          transceiver.stop();
        }
      });
    }

    pc.getSenders().forEach(sender => {
      sender.track.stop();
    });

    setTimeout(() => {
      pc.close();
    }, 500);
  };

  const sdpFilterCodec = (kind, codec, realSdp) => {
    var allowed = []
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')

    var lines = realSdp.split('\n');

    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }

        if (isKind) {
            var match = lines[i].match(codecRegex);
            if (match) {
                allowed.push(parseInt(match[1]));
            }

            match = lines[i].match(rtxRegex);
            if (match && allowed.includes(parseInt(match[2]))) {
                allowed.push(parseInt(match[1]));
            }
        }
    }
  };

  onMount(() => {
    enumerateVideoDevices();
  });

  onCleanup(() => {
    if (dc) {
      dc.close();
    }
    if (pc) {
      pc.close();
    }
  });

  return (
    <div>
      <h2>Video WebRTC</h2>
      <div>
        <h3>Settings:</h3>
        <div class='border border-black shadow-md mx-auto flex flex-col px-2 gap-2' >
        <button 
          class='self-end text-gray-500 hover:text-gray-700'
          onClick={() => setIsOpen(!isOpen())}
        >
          {isOpen() ? '▼ Close' : '▶ Open'}
        </button>
        {isOpen() && (
          <>
            <label for="use-datachannel">Use Datachannel?</label>
            <input type='checkbox' id='use-datachannel' />
            <select id="datachannel-parameters">
              <option value='{"ordered": true}'>Ordered, reliable</option>
              <option value='{"ordered": false, "maxRetransmits": 0}'>Unordered, no retransmissions</option>
              <option value='{"ordered": false, "maxPacketLifetime": 500}'>Unordered, 500ms lifetime</option>
            </select>
            <select id="video-codec">
              <option value="default" selected>Default codecs</option>
              <option value="VP8/90000">VP8</option>
              <option value="H264/90000">H264</option>
            </select>
            <select id="video-resolution">
              <option value="" selected>Default resolution</option>
              <option value="320x240">320x240</option>
              <option value="640x480">640x480</option>
              <option value="960x540">960x540</option>
              <option value="1280x720">1280x720</option>
            </select>
            <label for="use-stun">Use stun?</label>
            <input type='checkbox' id='use-stun' />
          </>
        )}
        </div>
        <h3>Video Devices</h3>
        <div>
        <label for="video-input">Video Input: </label>
          <select
            id="video-input"
            value={selectedVideoInput()}
            onChange={(e) => setSelectedVideoInput(e.target.value)}
          >
            <For each={videoInputs()}>
              {(device) => (
                <option value={device.deviceId}>
                  {device.label || `Video Device ${device.deviceId.substr(0, 5)}`}
                </option>
              )}
            </For>
          </select>
        </div>
      </div>
      <div>
        <button onClick={start} style={{ display: showStart() ? 'inline-block' : 'none' }}>Start</button>
        <button onClick={stop} style={{ display: showStop() ? 'inline-block' : 'none' }}>Stop</button>
      </div>
      <h3>Data Channel</h3>
      <pre id="data-channel">{dataChannelLog()}</pre>
      <h3>ICE Connection State</h3>
      <p id="ice-connection-state">{iceConnectionLog()}</p>
      <h3>ICE Gathering State</h3>
      <p id="ice-gathering-state">{iceGatheringLog()}</p>
      <h3>Signaling State</h3>
      <p id="signaling-state">{signalingLog()}</p>
      <h3>SDP Offer</h3>
      <pre id="offer-sdp">{offerSdp()}</pre>
      <h3>SDP Answer</h3>
      <pre id="answer-sdp">{answerSdp()}</pre>
      <div id="media" style={{ display: showMedia() ? 'block' : 'none' }}>
        <h3>Media</h3>
        <video id="video" autoplay="true" playsinline="true"></video>
      </div>
    </div>
  );
};

export default WebRTCComponent;