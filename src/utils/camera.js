export default async function startUserCamera(
  localVideoRef,
  remoteVideoRef,
  peerConnectionRef
) {
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
  peerConnectionRef.current = new RTCPeerConnection(servers); // genera los ICE candidates
  const peerConnection = peerConnectionRef.current;

  let localStream = null;

  let remoteStream = null;
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
}
