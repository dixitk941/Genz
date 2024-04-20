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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var firebaseOrdersCollection = database.ref().child('Lab_details');

async function launchlab(roomId) {
    var content;
    console.log("here, in the room");
    await $.get(
        "https://google.com",
        function(data) {
            content = data;
            console.log(content.one);
            console.log(content.two);
            var details = {
                one: content.one,
                two: content.two
            };
            firebaseOrdersCollection.child(roomId).set(details);
        }
    );
    document.getElementById("lab").setAttribute("src", content.one);
    initWebRTC(roomId);
}

function getlab(roomId) {
    var val = roomId;
    firebaseOrdersCollection.on("value", gotData);

    function gotData(data) {
        var scores = data.val();
        console.log(scores);
        console.log("inside");
        console.log(roomId);
        var keys = Object.keys(scores);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (keys[i] == roomId) {
                console.log("found");
                var two = scores[k].two;
                document.getElementById("lab").setAttribute("src", two);
                console.log(two);
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
    let roomRef = null;

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