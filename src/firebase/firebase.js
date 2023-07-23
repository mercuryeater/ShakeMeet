import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_BASE_API_KEY,
  authDomain: "testp2p-39de4.firebaseapp.com",
  databaseURL: "https://testp2p-39de4-default-rtdb.firebaseio.com",
  projectId: "testp2p-39de4",
  storageBucket: "testp2p-39de4.appspot.com",
  messagingSenderId: "1035623282363",
  appId: "1:1035623282363:web:ac210588b6ee22ebe81b9e",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp);

//Aca entrega la referencia a la coleccion que se le pase
export function getCollection(collectionName) {
  return collection(db, collectionName);
}

export async function getCalls() {
  const callsRef = getCollection("calls");
  const snapshot = await getDocs(callsRef);

  //POR QUE ACA NO ME IMPRIME EL OBJETO?
  const callList = snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    };
  });
  return callList;
}

export async function addToCalls(data) {
  const callsRef = getCollection("calls");

  try {
    const addedToCalls = await addDoc(callsRef, data);
    console.log("Document written with ID: ", addedToCalls.id);
    return addedToCalls.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

export async function editCall(callID, editData) {
  const callsRef = getCollection("calls");
  try {
    const specificCallRef = await updateDoc(doc(callsRef, callID), {
      ...editData,
    });

    console.log("Document edited with ID: ", callID);
  } catch (error) {
    console.error("Error editing document: ", error);
  }
}

// export async function snapshotCall(callID) {
//   const callsRef = getCollection("calls");
//   const unsub = onSnapshot(doc(callsRef, callID), (doc) => {
//     // console.log("Current snapshotCall: ", doc.data());
//     return doc.data;
//   });
//   return unsub;
// }

export async function snapshotCall(callID) {
  const callsRef = getCollection("calls");

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(doc(callsRef, callID), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        resolve(data); // Resuelve la promesa con los datos del documento
      } else {
        reject(new Error("El documento no existe."));
      }
    });
  });
}
