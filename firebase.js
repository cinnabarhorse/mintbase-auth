import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

export default async function loadFirebase() {

    try {
        firebase.initializeApp({
            apiKey: "AIzaSyBNTnDvKEoQqwEyLPtoS8k_954kKQwo2DY", //process.env.FIREBASE_APIKEY, //"AIzaSyBr7Y_wIdJEBbgMaVKHrX2-Ki2jJOwJFBk",
            authDomain: "mintbasevote.firebaseapp.com", //process.env.FIREBASE_AUTHDOMAIN, //"worldsbestbook.firebaseapp.com",
            databaseURL: "https://mintbasevote.firebaseio.com", //process.env.FIREBASE_DATABASEURL, //"https://worldsbestbook.firebaseio.com",
            projectId: "mintbasevote",//process.env.FIREBASE_PROJECTID, //"worldsbestbook",
            storageBucket: "mintbasevote.appspot.com", //process.env.FIREBASE_STORAGEBUCKET,// "worldsbestbook.appspot.com",
            messagingSenderId: "64755260516", //process.env.FIREBASE_MESSAGINGSENDERID, //"436530275590",
            appId: "1:64755260516:web:18dfcaa5218c8ea821d371", //process.env.FIREBASE_APPID//"1:436530275590:web:7d744aafdf17d7cb",
            measurementId: "G-59ZXMQ7Y5M"
        });
        // firebase.analytics()

    } catch (err) {
        // we skip the "already exists" message which is
        // not an actual error when we're hot-reloading
        if (!/already exists/.test(err.message)) {
            console.error('Firebase initialization error', err.stack);
        }
    }



    return firebase
}