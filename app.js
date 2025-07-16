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

const baseUrl = "https://siddu-k.github.io/loctrack/";

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
  if (!user) return alert("Not logged in");

  const linkRef = db.collection("users").doc(user.uid).collection("links").doc();
  linkRef.set({ createdAt: new Date().toISOString() }).then(() => {
    loadDashboard(); // reload dashboard after creating link
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
      const linkId = doc.id;
      const link = `${baseUrl}track.html?id=${linkId}`;

      // Create list item container
      const li = document.createElement("li");
      li.style.marginBottom = "1.5em";

      // Link anchor
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.target = "_blank";
      anchor.textContent = link;

      // Show Logs button
      const btn = document.createElement("button");
      btn.textContent = "Show Logs";
      btn.style.marginLeft = "1em";
      btn.onclick = () => showLogs(linkId, li);

      // Container for logs output
      const logsDiv = document.createElement("div");
      logsDiv.style.marginTop = "0.5em";
      logsDiv.style.fontSize = "0.9em";
      logsDiv.style.whiteSpace = "pre-wrap";
      logsDiv.style.maxHeight = "200px";
      logsDiv.style.overflowY = "auto";
      logsDiv.style.border = "1px solid #ccc";
      logsDiv.style.padding = "0.5em";
      logsDiv.style.display = "none"; // hidden initially

      li.appendChild(anchor);
      li.appendChild(btn);
      li.appendChild(logsDiv);
      list.appendChild(li);
    });
  });
}

function showLogs(linkId, li) {
  const logsDiv = li.querySelector("div");
  if (logsDiv.style.display === "block") {
    // Hide logs if already visible
    logsDiv.style.display = "none";
    return;
  }

  logsDiv.textContent = "Loading logs...";
  logsDiv.style.display = "block";

  db.collection("tracks").doc(linkId).collection("logs")
    .orderBy("timestamp", "desc")
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        logsDiv.textContent = "No logs found.";
        return;
      }

      logsDiv.innerHTML = ""; // Clear previous content

      snapshot.forEach(doc => {
        const data = doc.data();

        // Create container for each log entry
        const entry = document.createElement("div");
        entry.style.marginBottom = "1em";

        // Format time
        const time = new Date(data.timestamp).toLocaleString();

        // Google Maps link for coordinates
        const mapsLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

        entry.innerHTML = `
          <strong>Time:</strong> ${time} <br>
          <strong>Lat:</strong> ${data.latitude} <br>
          <strong>Lng:</strong> ${data.longitude} <br>
          <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
        `;

        logsDiv.appendChild(entry);
      });
    })
    .catch(err => {
      logsDiv.textContent = "Error loading logs: " + err.message;
    });
}

auth.onAuthStateChanged(user => {
  if (user) loadDashboard();
});
