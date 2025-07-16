const firebaseConfig = {
  apiKey: "AIzaSyBuP5HZ72obwWBXxubIygcMykbc1OtHnX0",
  authDomain: "location-track-eef6b.firebaseapp.com",
  projectId: "location-track-eef6b",
  storageBucket: "location-track-eef6b.firebasestorage.app",
  messagingSenderId: "473306500870",
  appId: "1:473306500870:web:5ec2fc77c35f31adc5d887",
  measurementId: "G-45TGXDF75D"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => loadDashboard())
    .catch(alert);
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => loadDashboard())
    .catch(alert);
}

function logout() {
  auth.signOut().then(() => location.reload());
}

function createTrackLink() {
  const user = auth.currentUser;
  if (!user) return;

  const linkRef = db.collection("users").doc(user.uid).collection("links").doc();
  linkRef.set({ createdAt: new Date().toISOString() }).then(() => {
    const fullLink = `${window.location.origin}/track.html?id=${linkRef.id}`;
    const li = document.createElement("li");
    li.innerHTML = `<a href="${fullLink}" target="_blank">${fullLink}</a>`;
    document.getElementById("linkList").appendChild(li);
  });
}

function loadDashboard() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  const user = auth.currentUser;

  db.collection("users").doc(user.uid).collection("links").get().then(snapshot => {
    const list = document.getElementById("linkList");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const link = `${window.location.origin}/track.html?id=${doc.id}`;
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
      list.appendChild(li);
    });
  });
}

auth.onAuthStateChanged(user => {
  if (user) loadDashboard();
});
