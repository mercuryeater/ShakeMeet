import { useRef, useState } from "react";
import { getCalls, addToCalls } from "./firebase/firebase";
import "./App.css";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

//Creamos el peerConnection
const peerConnection = new RTCPeerConnection(servers); //genera los ICE candidates

let localStream = null;

let remoteStream = null;

function App() {
  const [callID, setCallID] = useState();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const handleWebcam = () => {
    startUserCamera();
  };

  const startUserCamera = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localVideoRef.current.srcObject = localStream;
    localVideoRef.current.play();

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    remoteStream = new MediaStream();

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    remoteVideoRef.current.srcObject = remoteStream;
    remoteVideoRef.current.play();
  };

  const handleCreateCall = async () => {
    //Get candidates for caller, save to db
    // peerConnection.onicecandidate = (event) => {
    //   event.candidate && offerCandidates.
    // }

    setCallID();

    //creamos la offer del caller
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription); //aca va el SDP

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    // getCalls();
    addToCalls(offer);
  };

  return (
    <>
      <h2>1. Start your Webcam</h2>
      <div style={{ display: "flex" }}>
        <span>
          <h3>Local Stream</h3>
          <video ref={localVideoRef} autoPlay></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video ref={remoteVideoRef} autoPlay></video>
        </span>
      </div>

      <button onClick={handleWebcam}>Start webcam</button>
      <h2>2. Create a new Call</h2>
      <button type="button" onClick={handleCreateCall}>
        Create Call (offer)
      </button>

      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <h2>Call ID: {callID}</h2>
      <button id="answerButton" disabled>
        AnswerCLASS
      </button>

      <h2>4. Hangup</h2>

      <button id="hangupButton" disabled>
        Hangup
      </button>
    </>
  );
}

export default App;
