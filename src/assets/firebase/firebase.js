// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/app";
import "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXRA_-eQVL7pj8aEQXF8VQEoTxqI8qEWg",
  authDomain: "testp2p-39de4.firebaseapp.com",
  databaseURL: "https://testp2p-39de4-default-rtdb.firebaseio.com",
  projectId: "testp2p-39de4",
  storageBucket: "testp2p-39de4.appspot.com",
  messagingSenderId: "1035623282363",
  appId: "1:1035623282363:web:ac210588b6ee22ebe81b9e",
  measurementId: "G-0T125EDXYD",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
// const analytics = getAnalytics(app);

//Initialize values for the global states

//Pero primero necesitamos saber que servicio
// de STUN server utilizar para saber datos
// sobre mi presencia publica en la red
//Utilizare STUN servers de Google
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

//Creamos el localStream ->
const localStream = null;

//Creamos el remoteStream ->
const remoteStream = null;
