export default async function startUserCamera() {
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
