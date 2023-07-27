import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { editCall, addToCalls, db } from '../firebase/firebase';

const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stunserver.org:3478',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Creamos el peerConnection
const peerConnection = new RTCPeerConnection(servers); // genera los ICE candidates

let localStream = null;

let remoteStream = null;

function PeerToPeer() {
  const [callID, setCallID] = useState(null);
  const [remoteCallID, setRemoteCallID] = useState();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  let localIceCandidates = [];

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

  useEffect(() => {
    startUserCamera();
  }, []);

  const handleCreateCall = async () => {
    // creamos la offer del caller
    const offerDescription = await peerConnection.createOffer(); // Aca va la RTCSessionDescription
    const offer = {
      offer: { sdp: offerDescription.sdp, type: offerDescription.type },
      createdAt: Date.now(),
    };

    // Crear el documento de la llamada
    const serverCallID = await addToCalls(offer);
    setCallID(serverCallID);

    await peerConnection.setLocalDescription(offerDescription); // aca va el SDP

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        // try {
        //   // Agregar candidato a offerCandidates en la db
        //   editCall(serverCallID, { offerCandidates: event.candidate.toJSON() });
        // } catch (error) {
        //   console.error(`Error adding offerCandidate to db: ${error}`);
        // }

        try {
          localIceCandidates.push(event.candidate.toJSON());
        } catch (error) {
          console.error(`Error adding offerCandidate to db: ${error}`);
        }
      } else {
        editCall(serverCallID, localIceCandidates);
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
          console.log(
            `esto es AnswerCandidates${currentCall.answerCandidates}`
          );
          peerConnection
            .addIceCandidate(currentCall.answerCandidates)
            .catch((error) => {
              console.error('Failed to add ICE candidate: ', error);
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

  const joinCallHandler = async () => {
    console.log(`en joinHandlcallID es: ${remoteCallID}`);

    // ESTE ES EL SNAPSHOT QUE SE DISPARA CUANDO LA LLAMADA CAMBIA
    const unsub = onSnapshot(
      doc(db, 'calls', remoteCallID),
      async (document) => {
        const currentCall = document.data();
        console.log(
          '🚀 ~ file: PeerToPeer.jsx:153 ~ currentCall:',
          currentCall
        );

        try {
          const remoteDescription = new RTCSessionDescription(
            currentCall.offer
          );
          await peerConnection.setRemoteDescription(remoteDescription);
        } catch (error) {
          console.log('Error adding remoteDescription:', error);
        }

        try {
          if (!currentCall.answer) {
            const answerDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answerDescription);

            editCall(remoteCallID, {
              answer: {
                sdp: answerDescription.sdp,
                type: answerDescription.type,
              },
            });
          }
        } catch (error) {
          console.log('Error receiving offer or creating answer :', error);
        }

        if (currentCall.offerCandidates) {
          // console.log(`esto es offerCandidates${currentCall.offerCandidates}`);
          // peerConnection
          //   .addIceCandidate(currentCall.offerCandidates)
          //   .catch((error) => {
          //     console.error('Failed to add ICE candidate: ', error);
          //   });
          if (currentCall.offerCandidates) {
            currentCall.offerCandidates.forEach((candidate) => {
              peerConnection.addIceCandidate(candidate).catch((error) => {
                console.error('Failed to add ICE candidate: ', error);
              });
            });
          }
        }
      }
    );

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        try {
          // Agregar candidato a offerCandidates en la db
          editCall(remoteCallID, {
            answerCandidates: event.candidate.toJSON(),
          });
        } catch (error) {
          console.error(`Error adding answerCandidates to db: ${error}`);
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
      `localRTC: ${peerConnection.localDescription.type}${peerConnection.localDescription.sdp}
      and remoteRTC: ${peerConnection.remoteDescription.type}${peerConnection.remoteDescription.sdp}`
    );
  };

  const printRTCState = () => {
    console.log(`State peerConecction: ${peerConnection.connectionState}`);
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <span>
          <h3>Local Stream</h3>
          <video ref={localVideoRef} autoPlay />
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video ref={remoteVideoRef} autoPlay />
        </span>
      </div>

      <h2>2. Create a new Call</h2>
      <button type="button" onClick={handleCreateCall}>
        Create Call (offer)
      </button>

      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <h2>Call ID: {callID}</h2>
      <input type="text" onChange={handleInputChange} />
      <button type="button" onClick={joinCallHandler}>
        Join Call
      </button>
      <button type="button" onClick={printRTCDescriptions}>
        printRTCDescriptions
      </button>
      <button type="button" onClick={printRTCState}>
        printRTC State
      </button>
    </>
  );
}

export default PeerToPeer;
