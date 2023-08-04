/* eslint-disable jsx-a11y/media-has-caption */
import { useRef, useState, useEffect } from 'react';
import {
  BsFillVolumeMuteFill,
  BsFillVolumeDownFill,
  BsFillVolumeUpFill,
  BsTypeH1,
} from 'react-icons/bs';
import { CgMiniPlayer } from 'react-icons/cg';
import InitiateCall from './InitiateCall/InitiateCall';
import InputJoinCall from './InputJoinCall/InputJoinCall';
import startUserCamera from '../../utils/camera';
import { createCall, joinCall } from '../../utils/callFunctions';

function Call() {
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

  const role = localStorage.getItem('role');

  useEffect(() => {
    startUserCamera(localVideoRef, remoteVideoRef, peerConnectionRef);
  }, []);

  useEffect(() => {
    console.log('se modifica local video ref');
    if (remoteVideoRef.current) {
      const handleVolumeChange = () => {
        setVolume(remoteVideoRef.current.volume);
        setIsMuted(remoteVideoRef.current.muted);

        if (remoteVideoRef.current.volume > 0) {
          remoteVideoRef.current.muted = false;
        }

        if (
          remoteVideoRef.current.muted ||
          remoteVideoRef.current.volume === 0
        ) {
          setVolumeLevel('muted');
        } else if (remoteVideoRef.current.volume >= 0.5) {
          setVolumeLevel('high');
        } else {
          setVolumeLevel('low');
        }
      };
      remoteVideoRef.current.addEventListener(
        'volumechange',
        handleVolumeChange
      );

      return () => {
        // Check if remoteVideoRef.current is not null before removing the event listener
        if (remoteVideoRef.current) {
          remoteVideoRef.current.removeEventListener(
            'volumechange',
            handleVolumeChange
          );
        }
      };
    }
  }, [remoteVideoRef]);

  /// /////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////
  const handleCreateCall = () => {
    createCall(peerConnectionRef, setCallID, setShowInitiateCall);
  };

  const joinCallHandler = () => {
    joinCall(peerConnectionRef, remoteCallID, setShowInputJoinCall);
  };

  // //////////////////////////////////////////////////////////////////
  // ///// VOLUME FUNCTIONS

  const toggleMute = () => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = !localVideoRef.current.muted;
      setIsMuted(localVideoRef.current.muted);
      if (localVideoRef.current.muted || isMuted) {
        setVolume(0);
        localVideoRef.current.volume = 0;
      } else {
        localVideoRef.current.volume = 0.5;
      }
    }
  };

  const onVolumeInputHandler = (event) => {
    const newVolume = event.target.value;
    remoteVideoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (remoteVideoRef.current.muted && newVolume === 0) {
      remoteVideoRef.current.muted = false;
      setIsMuted(false);
    } else if (!remoteVideoRef.current.muted && newVolume > 0) {
      remoteVideoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolume = (e) => {
    setVolume(e.target.volume);
  };

  // //////////////////////////////////////////////////////////////////
  // ///// MINI PLAYER FUNCTION

  const toggleMiniPlayer = () => {
    remoteVideoRef.current.requestPictureInPicture();
  };

  return (
    <>
      <main className="flex flex-col md:flex-row">
        <div className="relative grow">
          <h3 className="absolute left-1 top-1 text-lg text-white">
            Remote Stream
          </h3>
          <div
            className="group absolute bottom-2 left-1 z-30 flex cursor-pointer
           justify-center rounded-md bg-black/40 p-1 transition-opacity"
          >
            <div
              className="flex gap-1 text-xl opacity-50 transition-all
            duration-500 group-hover:opacity-100"
            >
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
          <div
            className="group absolute bottom-2 right-1 z-50 flex cursor-pointer
           justify-center rounded-md  bg-black/40 p-1 text-xl"
          >
            <button type="button" onClick={toggleMiniPlayer}>
              <CgMiniPlayer className="text-gray-100 opacity-50 transition-opacity hover:opacity-100" />
            </button>
          </div>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="-z-0 w-full"
            onVolumeChange={handleVolume}
          />
        </div>

        <span className="relative grow">
          <h3 className="absolute left-1 top-1 text-lg text-white">
            Local Stream
          </h3>
          <div>
            <video ref={localVideoRef} autoPlay className="w-full" muted />
          </div>
        </span>
      </main>
      {role === 'caller' ? (
        <h2 className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-left text-2xl text-lime-200">
          <span className=" text-white">
            Share this code to answer the call:{' '}
          </span>{' '}
          {callID}
        </h2>
      ) : null}

      {role === 'caller' && showInitiateCall ? (
        <InitiateCall callID={callID} createCall={handleCreateCall} />
      ) : null}

      {role === 'callee' && showInputJoinCall ? (
        <InputJoinCall
          joinCall={joinCallHandler}
          setRemoteCallID={setRemoteCallID}
        />
      ) : null}
    </>
  );
}

export default Call;
