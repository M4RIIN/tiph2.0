import { initializeApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD-wnX0-g7v16K9YowKY0_opAHhNcPASco",
    authDomain: "tiph2-0-cfce6.firebaseapp.com",
    projectId: "tiph2-0-cfce6",
    storageBucket: "tiph2-0-cfce6.firebasestorage.app",
    messagingSenderId: "159305793228",
    appId: "1:159305793228:web:f34d9007f459cd0486cc69",
};


const app = initializeApp(firebaseConfig)

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
