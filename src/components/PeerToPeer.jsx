/* eslint-disable jsx-a11y/media-has-caption */
import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  BsFillVolumeMuteFill,
  BsFillVolumeDownFill,
  BsFillVolumeUpFill,
} from 'react-icons/bs';
import { editCall, addToCalls, db, getCall } from '../firebase/firebase';
import InitiateCall from './Call/InitiateCall/InitiateCall';
import InputJoinCall from './Call/InputJoinCall/InputJoinCall';
import startUserCamera from '../utils/camera';

function PeerToPeer() {
  const [callID, setCallID] = useState(null);
  const [remoteCallID, setRemoteCallID] = useState();
  const [showInitiateCall, setShowInitiateCall] = useState(true);
  const [showInputJoinCall, setShowInputJoinCall] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState('high');
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();

  const localIceCandidates = [];

  const role = localStorage.getItem('role');

  useEffect(() => {
    startUserCamera(localVideoRef, remoteVideoRef, peerConnectionRef);
  }, []);

  useEffect(() => {
    console.log('se modifica local video ref');
    if (localVideoRef.current) {
      const handleVolumeChange = () => {
        setVolume(localVideoRef.current.volume);
        setIsMuted(localVideoRef.current.muted);

        if (localVideoRef.current.volume > 0) {
          localVideoRef.current.muted = false;
          // setIsMuted(localVideoRef.current
        }

        if (localVideoRef.current.muted || localVideoRef.current.volume === 0) {
          setVolumeLevel('muted');
        } else if (localVideoRef.current.volume >= 0.5) {
          setVolumeLevel('high');
        } else {
          setVolumeLevel('low');
        }
      };
      localVideoRef.current.addEventListener(
        'volumechange',
        handleVolumeChange
      );

      // Eliminar el event listener al desmontar el componente
      return () => {
        localVideoRef.current.removeEventListener(
          'volumechange',
          handleVolumeChange
        );
      };
    }
  }, [localVideoRef]);

  /// /////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////

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

  /// /////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////
  const joinCallHandler = async () => {
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

  // //////////////////////////////////////////////////////////////////
  // ///// VOLUME FUNCTIONS
  // //////////////////////////////////////////////////////////////////
  // const volumeLevel = 'muted';

  const toggleMute = () => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = !localVideoRef.current.muted;
      setIsMuted(localVideoRef.current.muted);
      if (localVideoRef.current.muted) {
        setVolume(0);
        localVideoRef.current.volume = 0;
      } else {
        // Assuming you have a way to get the previous non-muted volume value
        // setVolume((previousVolume) =>
        //   previousVolume === 0 ? 1 : previousVolume
        // );
        localVideoRef.current.volume = 0.5;
      }
    }
  };

  const onVolumeInputHandler = (event) => {
    const newVolume = event.target.value;
    localVideoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (localVideoRef.current.muted && newVolume === 0) {
      localVideoRef.current.muted = false;
      setIsMuted(false);
    } else if (!localVideoRef.current.muted && newVolume > 0) {
      localVideoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolume = (e) => {
    setVolume(e.target.volume);
  };

  return (
    <>
      <main className="flex flex-col md:flex-row">
        <div className="relative grow">
          <h3 className="absolute left-1 top-1 text-lg text-white">
            Local Stream
          </h3>
          <div
            className="group absolute bottom-2 left-1 z-50 flex cursor-pointer
           justify-center transition-opacity"
          >
            <div className="flex gap-1 opacity-50 transition-all duration-500 group-hover:opacity-100">
              <button type="button" className="" onClick={toggleMute}>
                <BsFillVolumeMuteFill
                  className={
                    volumeLevel === 'muted' ? 'block text-gray-100' : 'hidden'
                  }
                />
                <BsFillVolumeDownFill
                  className={
                    volumeLevel === 'low' ? 'block text-gray-100' : 'hidden'
                  }
                />
                <BsFillVolumeUpFill
                  className={
                    volumeLevel === 'high' ? 'block text-gray-100' : 'hidden'
                  }
                />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="any"
                value={volume}
                className="hidden w-0 origin-left scale-x-0 opacity-0
                transition-all group-hover:block group-hover:w-full
                group-hover:scale-x-100 group-hover:opacity-100"
                onInput={onVolumeInputHandler}
              />
            </div>
          </div>
          <video
            ref={localVideoRef}
            autoPlay
            className="-z-10 w-full"
            onVolumeChange={handleVolume}
          />
        </div>

        {/* <span className="relative grow">
          <h3 className="absolute left-1 top-1 text-lg text-white">
            Remote Stream
          </h3>
          <div>
            <video ref={localVideoRef} autoPlay className="w-full" muted />
          </div>
        </span> */}
      </main>
      {role === 'caller' && showInitiateCall ? (
        <InitiateCall callID={callID} createCall={handleCreateCall} />
      ) : null}
      <h2 className="text-left text-lg text-white ">Call ID: {callID}</h2>

      {role === 'callee' && showInputJoinCall ? (
        <InputJoinCall
          joinCall={joinCallHandler}
          setRemoteCallID={setRemoteCallID}
        />
      ) : null}
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
