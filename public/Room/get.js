var firebaseConfig = {
    apiKey: "AIzaSyCYdeigPuvdKyVj0rG53IoUZHaVyawyVZY",
    authDomain: "genzconnect-f5082.firebaseapp.com",
    databaseURL: "https://genzconnect-f5082-default-rtdb.firebaseio.com",
    projectId: "genzconnect-f5082",
    storageBucket: "genzconnect-f5082.appspot.com",
    messagingSenderId: "761396074376",
    appId: "1:761396074376:web:ce2c9a3560a78194698c3d",
    measurementId: "G-ZFNR03PDPM",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var fire = database.ref().child("Lab_details");
var val;

function getlab(roomId) {
    val = roomId;
    fire.on("value", gotData);

    function gotData(data) {
        data = data.val();
        let keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] == roomId) {
                document.getElementById("lab").setAttribute("src", data[keys[i]].two);
                initWebRTC(roomId);
            }
        }
    }
}

function initWebRTC(roomId) {
    const configuration = {
        iceServers: [{
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        }],
        iceCandidatePoolSize: 10,
    };

    let peerConnection = null;
    let localStream = null;
    let remoteStream = null;
    let roomDialog = null;
    let createdRoomDialog = null;
    let roomRef = null;
    let roomSnapshot = null;

    makeRoom(roomId);

    function makeRoom() {
        localStream = new MediaStream();
        document.getElementById("localVideo").srcObject = localStream;

        const db = firebase.firestore();
        roomRef = db.collection("rooms").doc(roomId);

        peerConnection = new RTCPeerConnection(configuration);
        peerConnection.addEventListener("icecandidate", handleIceCandidate);
        peerConnection.addEventListener("track", handleTrack);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener("iceconnectionstatechange", handleIceConnectionStateChange);
        peerConnection.addEventListener("connectionstatechange", handleConnectionStateChange);
        peerConnection.addEventListener("signalingstatechange", handleSignalingStateChange);
    }

    async function handleIceCandidate(event) {
        if (event.candidate) {
            const candidate = event.candidate.toJSON();
            await roomRef.collection("candidates").add(candidate);
        }
    }

    function handleTrack(event) {
        const stream = event.streams[0];
        document.getElementById("remoteVideo").srcObject = stream;
    }

    function handleIceConnectionStateChange() {
        console.log(`ICE connection state changed to ${peerConnection.iceConnectionState}`);
    }

    function handleConnectionStateChange() {
        console.log(`Connection state changed to ${peerConnection.connectionState}`);
    }

    function handleSignalingStateChange() {
        console.log(`Signaling state changed to ${peerConnection.signalingState}`);
    }
}

function init() {
    // Your initialization code
}

// Example usage:
// getlab("your_room_id");
// init();