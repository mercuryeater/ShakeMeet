import { useRef } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyBXRA_-eQVL7pj8aEQXF8VQEoTxqI8qEWg",
  authDomain: "testp2p-39de4.firebaseapp.com",
  databaseURL: "https://testp2p-39de4-default-rtdb.firebaseio.com",
  projectId: "testp2p-39de4",
  storageBucket: "testp2p-39de4.appspot.com",
  messagingSenderId: "1035623282363",
  appId: "1:1035623282363:web:ac210588b6ee22ebe81b9e",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

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
    const callCollectionRef = collection(db, "calls");

    // const callCollection = await getDocs(collection(db, "calls"));
    const callDocsSnapshot = await getDocs(callCollectionRef);

    let offerCandidatesCollection = null;

    let answerCandidatesCollection = null;

    callDocsSnapshot.forEach((callDoc) => {
      // Aquí puedes acceder a los datos del documento principal usando callDoc.data()
      const callId = callDoc.id;

      // Para acceder a las subcolecciones, puedes seguir un enfoque similar:
      offerCandidatesCollection = collection(callDoc.ref, "offerCandidates");
      answerCandidatesCollection = collection(callDoc.ref, "answerCandidates");

      // A partir de aquí, puedes realizar operaciones en las subcolecciones (por ejemplo, agregar documentos).
    });

    // Get candidates for caller, save to db
    peerConnection.onicecandidate = (event) => {
      event.candidate &&
        offerCandidatesCollection.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callCollection.doc("SOME_ID").set({ offer });

    // Listen for remote answer
    callCollectionRef.doc("SOME_ID").onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    answerCandidatesCollection.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
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

      <input id="callInput" />
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
