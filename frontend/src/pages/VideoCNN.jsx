import { createSignal, createEffect, onCleanup, onMount, For } from 'solid-js';

const VideoCNN = () => {
  const [dataChannelLog, setDataChannelLog] = createSignal('');
  const [iceConnectionLog, setIceConnectionLog] = createSignal('');
  const [iceGatheringLog, setIceGatheringLog] = createSignal('');
  const [signalingLog, setSignalingLog] = createSignal('');
  const [offerSdp, setOfferSdp] = createSignal('');
  const [answerSdp, setAnswerSdp] = createSignal('');
  const [showStart, setShowStart] = createSignal(true);
  const [showStop, setShowStop] = createSignal(false);
  const [showMedia, setShowMedia] = createSignal(false);
  
  // New state variables for media devices
  const [audioInputs, setAudioInputs] = createSignal([]);
  const [videoInputs, setVideoInputs] = createSignal([]);
  const [selectedAudioInput, setSelectedAudioInput] = createSignal('');
  const [selectedVideoInput, setSelectedVideoInput] = createSignal('');

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
      } else {
        document.getElementById('audio').srcObject = evt.streams[0];
      }
    });

    return pc;
  };

  const enumerateInputDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

      setAudioInputs(audioInputDevices);
      setVideoInputs(videoInputDevices);

      if (audioInputDevices.length > 0) {
        setSelectedAudioInput(audioInputDevices[0].deviceId);
      }
      if (videoInputDevices.length > 0) {
        setSelectedVideoInput(videoInputDevices[0].deviceId);
      }
    } catch (e) {
      console.error('Error enumerating devices:', e);
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

      const audioCodec = document.getElementById('audio-codec').value;
      if (audioCodec !== 'default') {
        sdp = sdpFilterCodec('audio', audioCodec, sdp);
      }

      const videoCodec = document.getElementById('video-codec').value;
      if (videoCodec !== 'default') {
        sdp = sdpFilterCodec('video', videoCodec, sdp);
      }

      setOfferSdp(sdp);

      const response = await fetch('/offer', {
        body: JSON.stringify({
          sdp: sdp,
          type: localDesc.type,
          video_transform: document.getElementById('video-transform').value,
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
      audio: document.getElementById('use-audio').checked,
      video: document.getElementById('use-video').checked,
    };

    if (constraints.audio) {
      constraints.audio = { deviceId: { exact: selectedAudioInput() } };
    }

    if (constraints.video) {
      constraints.video = { deviceId: { exact: selectedVideoInput() } };

      const resolution = document.getElementById('video-resolution').value;
      if (resolution) {
        const [width, height] = resolution.split('x').map(Number);
        constraints.video = { ...constraints.video, width, height };
      }
    }

    if (constraints.audio || constraints.video) {
      if (constraints.video) {
        setShowMedia(true);
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        await negotiate();
      } catch (err) {
        console.error('Could not acquire media:', err);
      }
    } else {
      await negotiate();
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
    enumerateInputDevices();
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
      <h2>WebRTC</h2>
      <div>
        <h3>Media Devices</h3>
        <div>
          <label for="audio-input">Audio Input: </label>
          <select
            id="audio-input"
            value={selectedAudioInput()}
            onChange={(e) => setSelectedAudioInput(e.target.value)}
          >
            <For each={audioInputs()}>
              {(device) => (
                <option value={device.deviceId}>
                  {device.label || `Audio Device ${device.deviceId.substr(0, 5)}`}
                </option>
              )}
            </For>
          </select>
        </div>
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
        <audio id="audio" autoplay="true"></audio>
        <video id="video" autoplay="true" playsinline="true"></video>
      </div>
    </div>
  );
};

export default VideoCNN;