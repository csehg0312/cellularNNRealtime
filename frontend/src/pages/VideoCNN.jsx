//importing styles
import { createSignal, onMount } from "solid-js";
import "./VideoCNN.module.css";
import { Router } from "@solidjs/router";

//main function
function VideoCNN() {
    // let dataChannelRef;
    // let iceConnectionRef;
    // let iceGatheringRef;
    // let singnalingRef;
    let stunRef;
    let codecRef;
    let transformRef;
    let datachannnelRef;
    let startRef;
    let stopRef;
    let videoInputRef;
    let videoResRef;
    let mediaRef;

    const [pc, setPc] = createSignal(null);
    const [iceGatheringLog, setIceGatheringLog] = createSignal("");
    const [iceConnectionLog, setIceConnectionLog] = createSignal("");
    const [signalingLog, setSignalingLog] = createSignal("");
    const [offerSdp, setOfferSdp] = createSignal("");
    const [answerSdp, setAnswerSdp] = createSignal("");
    const [dataChannelLog, setDataChannelLog] = createSignal("");
    const [dc, setDc] = createSignal(null);
    const [dcInterval, setDcInterval] = createSignal(null);
    const [timeStart, setTimeStart] = createSignal(null);

    const [videoDevices, setVideoDevices] = createSignal([]);
    let [videoDeviceId, setVideoDeviceId] = createSignal("");

    onMount(() => {
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                const videoInputs = devices.filter(
                    (device) => device.kind === "videoinput",
                );
                // console.log(videoInputs);
                setVideoDevices(videoInputs);
            })
            .catch((e) => {
                alert(e);
            });

        // const negotiate = async () => {
        //
        // };
    });

    const negotiate = async () => {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            await new Promise((resolve) => {
                if (peerConnection.iceGatheringState === "complete") {
                    resolve();
                } else {
                    function checkState() {
                        if (peerConnection.iceGatheringState === "complete") {
                            peerConnection.removeEventListener(
                                "icegatheringstatechange",
                                checkState(),
                            );
                            resolve();
                        }
                    }
                    peerConnection.addEventListener(
                        "icegatheringstatechange",
                        checkState(),
                    );
                }
            });

            const localDescription = peerConnection.localDescription;
            let codec;

            codec = codecRef.value;
            if (codec !== "default") {
                localDescription.sdp = sdpFilterCodec(
                    "video",
                    codec,
                    localDescription.sdp,
                );
            }

            setOfferSdp(localDescription.sdp);

            const response = await fetch("/offer", {
                body: JSON.stringify({
                    sdp: localDescription.sdp,
                    type: localDescription.type,
                    video_transform: transformRef.value,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            });

            const answer = await response.json();
            setAnswerSdp(answer.sdp);
            await peerConnection.setRemoteDescription(answer);
        } catch (e) {
            alert(e);
        }
    };

    const createPeerConnection = () => {
        const config = {
            sdpSemantics: "unified-plan",
        };

        if (stunRef.checked) {
            config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }];
        }

        const peerConnection = new RTCPeerConnection(config);
        setPc(peerConnection);

        peerConnection.addEventListener(
            "icegatheringstatechange",
            () => {
                setIceGatheringLog(
                    iceGatheringLog() +
                        " -> " +
                        peerConnection.iceGatheringState,
                );
            },
            false,
        );
        setIceGatheringLog(peerConnection.iceGatheringState);

        peerConnection.addEventListener(
            "iceconnectionstatechange",
            () => {
                setIceConnectionLog(
                    iceConnectionLog() +
                        " -> " +
                        peerConnection.iceConnectionState,
                );
            },
            false,
        );
        setIceConnectionLog(peerConnection.iceConnectionState);

        peerConnection.addEventListener(
            "signalingstatechange",
            () => {
                setSignalingLog(
                    signalingLog() + " -> " + peerConnection.signalingState,
                );
            },
            false,
        );
        setSignalingLog(peerConnection.signalingState);

        peerConnection.addEventListener("track", (evt) => {
            document.getElementById("video").srcObject = evt.streams[0];
        });
    };

    const start = () => {
        startRef.style.display = "none";

        const peerConnection = createPeerConnection();
        setPc(peerConnection);

        // var start_time = null;

        const currentStamp = () => {
            if (timeStart() === null) {
                setTimeStart(new Date().getTime());
                return 0;
            } else {
                return new Date().getTime() - timeStart();
            }
        };

        if (datachannnelRef.checked) {
            const params = JSON.parse(datachannnelRef.value);

            const dataChannel = peerConnection.createDataChannel(
                "chat",
                params,
            );
            setDc(dataChannel);

            dataChannel.addEventListener("close", () => {
                clearInterval(dcInterval());
                setDataChannelLog(dataChannelLog() + "- close\n");
            });

            dataChannel.addEventListener("open", () => {
                setDataChannelLog(dataChannelLog() + "- open\n");
                setDcInterval(
                    setInterval(() => {
                        const message = "ping " + currentStamp();
                        setDataChannelLog(
                            dataChannelLog() + ">" + message + "\n",
                        );
                        dataChannel.send(message);
                    }, 1000),
                );
            });

            dataChannel.addEventListener("message", (evt) => {
                setDataChannelLog(dataChannelLog() + "<" + evt.data + "\n");

                if (evt.data.substring(0, 4) === "pong") {
                    const elapsedMs =
                        currentStamp() - parseInt(evt.data.substring(5), 10);
                    setDataChannelLog(
                        dataChannelLog() + " RTT" + elapsedMs + "ms/n",
                    );
                }
            });
        }

        const constraints = {
            video: false,
        };

        const videoConstraints = {};

        const device = videoInputRef.value;
        if (device) {
            videoConstraints.deviceId = { exact: device };
        }

        const resolution = videoResRef.value;
        if (resolution) {
            const dimensions = resolution.split("x");
            videoConstraints.width = parseInt(dimensions[0], 0);
            videoConstraints.height = parseInt(dimensions[1], 0);
        }
        constraints.video = Object.keys(videoConstraints).length
            ? videoConstraints
            : true;

        if (constraints.video) {
            mediaRef.style.display = "block";
        }
        Navigator.mediaDevices.getUserMedia(constraints).then(
            (stream) => {
                stream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, stream);
                });
                return negotiate();
            },
            (err) => {
                alert("Could not acquire media: " + err);
            },
        );
    };

    return (
        <div id="container">
            <div class="option">
                <input
                    id="use-datachannel"
                    checked="checked"
                    type="checkbox"
                    ref={datachannnelRef}
                />
                <label for="use-datachennel">Use datachennel</label>

                <select id="datachannel-params">
                    <option value={{ ordered: true }}>Ordered, reliable</option>
                    <option value={{ ordered: false, maxRetransmits: 0 }}>
                        Unordered, no retransmissions
                    </option>
                    <option value={{ ordered: false, maxPacketLifetime: 500 }}>
                        Unordered, 500ms lifetime
                    </option>
                </select>
            </div>
            <div class="option">
                <select value={videoDeviceId()} ref={videoInputRef}>
                    {videoDevices().map((device, index) => (
                        <option value={device.deviceId}>
                            {device.label || `Device #${index + 1}`}
                        </option>
                    ))}
                    <option value="" selected>
                        Default device
                    </option>
                </select>
                <select id="video-resolution" ref={videoResRef}>
                    <option value="" selected>
                        Default resolution
                    </option>
                    <option value="320x240">320x240</option>
                    <option value="640x480">640x480</option>
                    <option value="960x540">960x540</option>
                    <option value="1280x720">1280x720</option>
                </select>
                <select id="video-transform" ref={transformRef}>
                    <option value="none" selected>
                        No transform
                    </option>
                    <option value="cnn">Cellular neural network</option>
                </select>
                <select id="video-codec" ref={codecRef}>
                    <option value="default" selected>
                        Default codecs
                    </option>
                    <option value="VP8/90000">VP8</option>
                    <option value="H264/90000">H264</option>
                </select>
            </div>
            <div class="option">
                <input ref={stunRef} id="use-stun" type="checkbox" />
                <label for="use-stun">Use STUN server</label>
            </div>

            <button ref={startRef} id="start" onClick={start}>
                Start
            </button>
            <button id="stop" ref={stopRef} style="display: none" onClick={stop}>
                Stop
            </button>

            <h2>State</h2>
            <p>
                ICE gathering state: <span id="ice-gathering-state"></span>
            </p>
            <p>
                ICE connection state: <span id="ice-connection-state"></span>
            </p>
            <p>
                Signaling state: <span id="signaling-state"></span>
            </p>

            <div id="media" style="display: none" ref={mediaRef}>
                <h2>Media</h2>

                <video id="video" autoplay="true" playsinline="true"></video>
            </div>

            <h2>Data channel</h2>
            <pre id="data-channel" style="height: 200px;"></pre>

            <h2>SDP</h2>

            <h3>Offer</h3>
            <pre id="offer-sdp"></pre>

            <h3>Answer</h3>
            <pre id="answer-sdp"></pre>
        </div>
    );
}

export default VideoCNN;
