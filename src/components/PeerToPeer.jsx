import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { editCall, addToCalls, db, getCall } from '../firebase/firebase';
import InitiateCall from './Call/InitiateCall/InitiateCall';
import startUserCamera from '../utils/camera';

function PeerToPeer() {
  const [callID, setCallID] = useState(null);
  const [remoteCallID, setRemoteCallID] = useState();
  const [showInitiateCall, setShowInitiateCall] = useState(true);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const remoteStreamRef = useRef();

  const localIceCandidates = [];

  const role = localStorage.getItem('role');

  useEffect(() => {
    startUserCamera(localVideoRef, remoteVideoRef, peerConnectionRef);
  }, []);

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  const handleCreateCall = async () => {
    const peerConnection = peerConnectionRef.current;
    // creamos la offer del caller
    const offerDescription = await peerConnection.createOffer(); // Aca va la RTCSessionDescription
    const offer = {
      offer: { sdp: offerDescription.sdp, type: offerDescription.type },
      createdAt: Date.now(),
    };

    // Crear el documento de la llamada
    const serverCallID = await addToCalls(offer);
    setCallID(serverCallID);

    if (serverCallID) {
      setShowInitiateCall(false);
    }

    await peerConnection.setLocalDescription(offerDescription); // aca va el SDP

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log(event.candidate);
        try {
          localIceCandidates.push(event.candidate.toJSON());
          // Agregar candidato a offerCandidates en la db
          editCall(serverCallID, { offerCandidates: localIceCandidates });
        } catch (error) {
          console.error(`Error adding offerCandidate to db: ${error}`);
        }
      }
    });

    // cada vez que cambia el documento con el id x entonces:
    const unsub = onSnapshot(doc(db, 'calls', serverCallID), async (doc) => {
      const currentCall = doc.data();

      try {
        if (currentCall.answer && !peerConnection.remoteDescription) {
          const remoteDescription = new RTCSessionDescription(
            currentCall.answer
          );
          await peerConnection.setRemoteDescription(remoteDescription);
        }
      } catch (error) {
        console.error(`Error adding remoteDescription: ${error}`);
      }

      try {
        if (currentCall.answerCandidates) {
          currentCall.answerCandidates.forEach((candidate) => {
            peerConnection.addIceCandidate(candidate).catch((error) => {
              console.error('Failed to add ICE candidate: ', error);
            });
          });
        }
      } catch (error) {
        console.error(`Error adding IceCandidate: ${error}`);
      }
    });

    peerConnection.addEventListener('iceconnectionstatechange', (event) => {
      // Este evento se dispara cuando el estado de la conexión ICE cambia.
      console.log(
        'ICE connection state change:',
        peerConnection.iceConnectionState
      );
    });

    peerConnection.addEventListener('negotiationneeded', () => {
      // Este evento se dispara cuando es necesario realizar una negociación (oferta o respuesta).
      console.log('Negotiation needed.');
    });

    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling State: ${peerConnection.signalingState}`);
    });
  };

  const handleInputChange = (event) => {
    setRemoteCallID(event.target.value);
    console.log(remoteCallID);
  };

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  const joinCallHandler = async () => {
    const peerConnection = peerConnectionRef.current;
    console.log(`en joinHandlcallID es: ${remoteCallID}`);

    try {
      //traer documento para leer aqui el remote
      const currentCall = await getCall(remoteCallID);
      const remoteDescription = new RTCSessionDescription(currentCall.offer);
      await peerConnection.setRemoteDescription(remoteDescription);
    } catch (error) {
      console.log('Error adding remoteDescription:', error);
    }

    try {
      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);

      editCall(remoteCallID, {
        answer: {
          sdp: answerDescription.sdp,
          type: answerDescription.type,
        },
      });
    } catch (error) {
      console.log('Error receiving offer or creating answer :', error);
    }

    // ESTE ES EL SNAPSHOT QUE SE DISPARA CUANDO LA LLAMADA CAMBIA
    const unsub = onSnapshot(
      doc(db, 'calls', remoteCallID),
      async (document) => {
        const currentCall = document.data();
        console.log(
          '🚀 ~ file: PeerToPeer.jsx:153 ~ currentCall:',
          currentCall
        );

        if (currentCall.offerCandidates) {
          currentCall.offerCandidates.forEach((candidate) => {
            peerConnection.addIceCandidate(candidate).catch((error) => {
              console.error('Failed to add ICE candidate: ', error);
            });
          });
        }
      }
    );

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        try {
          localIceCandidates.push(event.candidate.toJSON());
          // Agregar candidato a offerCandidates en la db
          editCall(remoteCallID, { answerCandidates: localIceCandidates });
        } catch (error) {
          console.error(`Error adding offerCandidate to db: ${error}`);
        }
      }
    });

    peerConnection.addEventListener('iceconnectionstatechange', (event) => {
      // Este evento se dispara cuando el estado de la conexión ICE cambia.
      console.log(
        'ICE connection state change:',
        peerConnection.iceConnectionState
      );
    });

    peerConnection.addEventListener('negotiationneeded', () => {
      // Este evento se dispara cuando es necesario realizar una negociación (oferta o respuesta).
      console.log('Negotiation needed.');
    });

    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`
      );
    });

    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling State: ${peerConnection.signalingState}`);
    });
  };

  const printRTCDescriptions = () => {
    console.log(
      `localRTC: ${peerConnectionRef.current.localDescription.type}${peerConnectionRef.localDescription.sdp}
      and remoteRTC: ${peerConnectionRef.current.remoteDescription.type}${peerConnectionRef.remoteDescription.sdp}`
    );
  };

  const printRTCState = () => {
    console.log(
      `State peerConecction: ${peerConnectionRef.current.connectionState}`
    );
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <span>
          <h3 className="text-lg text-white">Local Stream</h3>
          <video ref={localVideoRef} autoPlay />
        </span>
        <span>
          <h3 className="text-lg text-white">Remote Stream</h3>
          <video ref={remoteVideoRef} autoPlay />
        </span>
      </div>
      {role === 'caller' && showInitiateCall ? (
        <InitiateCall callID={callID} createCall={handleCreateCall} />
      ) : null}
      <h2 className="text-left text-lg text-white ">Call ID: {callID}</h2>
      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <h2>Call ID: {callID}</h2>
      <input type="text" onChange={handleInputChange} />
      <button type="button" onClick={joinCallHandler}>
        Join Call
      </button>
      {/* <button type="button" onClick={printRTCDescriptions}>
        printRTCDescriptions
      </button>
      <button type="button" onClick={printRTCState}>
        printRTC State
      </button> */}
    </>
  );
}

export default PeerToPeer;
