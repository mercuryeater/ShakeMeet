import { doc, onSnapshot } from 'firebase/firestore';
import { editCall, addToCalls, db, getCall } from '../firebase/firebase';

export async function createCall(
  peerConnectionRef,
  setCallID,
  setShowInitiateCall
) {
  const localIceCandidates = [];

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
  const unsub = onSnapshot(doc(db, 'calls', serverCallID), async (document) => {
    const currentCall = document.data();

    try {
      if (currentCall.answer && !peerConnection.remoteDescription) {
        const remoteDescription = new RTCSessionDescription(currentCall.answer);
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

  peerConnection.addEventListener('iceconnectionstatechange', () => {
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
}

export async function joinCall(
  peerConnectionRef,
  remoteCallID,
  setShowInputJoinCall
) {
  const localIceCandidates = [];

  const peerConnection = peerConnectionRef.current;
  console.log(`en joinHandlcallID es: ${remoteCallID}`);

  try {
    // traer documento para leer aqui el remote
    const currentCall = await getCall(remoteCallID);
    const remoteDescription = new RTCSessionDescription(currentCall.offer);
    await peerConnection.setRemoteDescription(remoteDescription);
  } catch (error) {
    console.log('Error adding remoteDescription:', error);
  }

  if (peerConnection.remoteDescription) {
    setShowInputJoinCall(false);
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
  const unsub = onSnapshot(doc(db, 'calls', remoteCallID), async (document) => {
    const currentCall = document.data();
    console.log('🚀 ~ file: PeerToPeer.jsx:153 ~ currentCall:', currentCall);

    if (currentCall.offerCandidates) {
      currentCall.offerCandidates.forEach((candidate) => {
        peerConnection.addIceCandidate(candidate).catch((error) => {
          console.error('Failed to add ICE candidate: ', error);
        });
      });
    }
  });

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

  peerConnection.addEventListener('iceconnectionstatechange', () => {
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
}
