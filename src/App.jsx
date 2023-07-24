import { useRef, useState } from "react";
import { editCall, addToCalls, db } from "./firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./App.css";

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stunserver.org:3478",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

//Creamos el peerConnection
const peerConnection = new RTCPeerConnection(servers); //genera los ICE candidates

let localStream = null;

let remoteStream = null;

function App() {
  const [callID, setCallID] = useState(null);
  const [remoteCallID, setRemoteCallID] = useState();
  const [localIceCandidates, setLocalIceCandidates] = useState();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const handleWebcam = () => {
    startUserCamera();
  };

  const startUserCamera = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true },
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
    //creamos la offer del caller
    const offerDescription = await peerConnection.createOffer(); //Aca va la RTCSessionDescription
    const offer = {
      offer: { sdp: offerDescription.sdp, type: offerDescription.type },
      createdAt: Date.now(),
    };

    //Crear el documento de la llamada
    const serverCallID = await addToCalls(offer);
    setCallID(serverCallID);

    await peerConnection.setLocalDescription(offerDescription); //aca va el SDP

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        try {
          //Agregar candidato a offerCandidates en la db
          editCall(serverCallID, { offerCandidates: event.candidate.toJSON() });
        } catch (error) {
          console.error("Error adding offerCandidate to db: " + error);
        }
      }
    });

    // cada vez que cambia el documento con el id x entonces:
    const unsub = onSnapshot(doc(db, "calls", serverCallID), async (doc) => {
      const currentCall = doc.data();

      try {
        if (currentCall.answer && !peerConnection.remoteDescription) {
          const remoteDescription = new RTCSessionDescription(
            currentCall.answer
          );
          await peerConnection.setRemoteDescription(remoteDescription);
        }
      } catch (error) {
        console.error("Error adding remoteDescription: " + error);
      }

      if (currentCall.answerCandidates) {
        console.log(`esto es AnswerCandidates${currentCall.answerCandidates}`);
        peerConnection
          .addIceCandidate(currentCall.answerCandidates)
          .catch((error) => {
            console.error("Failed to add ICE candidate: ", error);
          });
      }
    });

    peerConnection.addEventListener("iceconnectionstatechange", (event) => {
      // Este evento se dispara cuando el estado de la conexión ICE cambia.
      console.log(
        "ICE connection state change:",
        peerConnection.iceConnectionState
      );
    });

    peerConnection.addEventListener("negotiationneeded", () => {
      // Este evento se dispara cuando es necesario realizar una negociación (oferta o respuesta).
      console.log("Negotiation needed.");
    });

    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log("Signaling State: " + peerConnection.signalingState);
    });
  };

  const handleInputChange = (event) => {
    setRemoteCallID(event.target.value);
    console.log(remoteCallID);
  };

  const joinCallHandler = async () => {
    console.log(`en joinHandlcallID es: ${remoteCallID}`);

    //ESTE ES EL SNAPSHOT QUE SE DISPARA CUANDO LA LLAMADA CAMBIA
    const unsub = onSnapshot(doc(db, "calls", remoteCallID), async (doc) => {
      const currentCall = doc.data();

      if (currentCall.offer && !peerConnection.remoteDescription) {
        const remoteDescription = new RTCSessionDescription(currentCall.offer);
        await peerConnection.setRemoteDescription(remoteDescription);

        const answerDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answerDescription);

        editCall(remoteCallID, {
          answer: { sdp: answerDescription.sdp, type: answerDescription.type },
        });
      }

      if (currentCall.offerCandidates) {
        console.log(`esto es offerCandidates${currentCall.offerCandidates}`);
        peerConnection
          .addIceCandidate(currentCall.offerCandidates)
          .catch((error) => {
            console.error("Failed to add ICE candidate: ", error);
          });
      }
    });

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log(
          "🚀 ~ file: App.jsx:75 ~ peerConnection.addEventListener ~ event.candidate:",
          event.candidate
        );
        try {
          //Agregar candidato a offerCandidates en la db
          editCall(remoteCallID, {
            answerCandidates: event.candidate.toJSON(),
          });
          console.log("Funciona el listener de AnswerCandidates");
        } catch (error) {
          console.error("Error adding answerCandidates to db: " + error);
        }
      }
    });

    peerConnection.addEventListener("iceconnectionstatechange", (event) => {
      // Este evento se dispara cuando el estado de la conexión ICE cambia.
      console.log(
        "ICE connection state change:",
        peerConnection.iceConnectionState
      );
    });

    peerConnection.addEventListener("negotiationneeded", () => {
      // Este evento se dispara cuando es necesario realizar una negociación (oferta o respuesta).
      console.log("Negotiation needed.");
    });

    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log("Signaling State: " + peerConnection.signalingState);
    });
  };

  const printRTCDescriptions = () => {
    console.log(
      `localRTC: ${peerConnection.localDescription.type}${peerConnection.localDescription.sdp}  
      and remoteRTC: ${peerConnection.remoteDescription.type}${peerConnection.remoteDescription.sdp}`
    );
  };

  const printRTCState = () => {
    console.log(`State peerConecction: ${peerConnection.connectionState}`);
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
      <input type="text" onChange={handleInputChange} />
      <button onClick={joinCallHandler}>Join Call</button>
      <button onClick={printRTCDescriptions}>printRTCDescriptions</button>
      <button onClick={printRTCState}>printRTC State</button>
      {/* <h2>4. Hangup</h2>

      <button id="hangupButton" disabled>
        Hangup
      </button> */}
    </>
  );
}

export default App;
