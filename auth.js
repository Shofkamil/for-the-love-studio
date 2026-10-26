// Firebase Authentication + Firestore (user role). Loaded by app.js only when CONFIG.FIREBASE is set.
const V = '10.12.2';
const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
const fa = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
const fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);

let auth, db, notify;

export async function init(config, onChange) {
  notify = onChange;
  const app = initializeApp(config);
  auth = fa.getAuth(app);
  db = fs.getFirestore(app);
  await fa.setPersistence(auth, fa.browserLocalPersistence); // stay signed in
  fa.onAuthStateChanged(auth, async user => onChange(user, user ? await getRole(user.uid) : null));
}

async function getRole(uid) {
  try { return (await fs.getDoc(fs.doc(db, 'users', uid))).data()?.role || null; } catch { return null; }
}

async function saveRole(user, role) {
  await fs.setDoc(fs.doc(db, 'users', user.uid), { role, email: user.email, createdAt: fs.serverTimestamp() }, { merge: true });
  notify(user, role); // the auth listener fired before the role existed
}

export const signIn = (email, password) => fa.signInWithEmailAndPassword(auth, email, password);

export async function signUp(email, password, role) {
  const { user } = await fa.createUserWithEmailAndPassword(auth, email, password);
  await saveRole(user, role);
}

export async function google(role) {
  const { user } = await fa.signInWithPopup(auth, new fa.GoogleAuthProvider());
  if (!(await getRole(user.uid))) await saveRole(user, role);
}

export const signOut = () => fa.signOut(auth);
