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

function init() {
    makeRoom();
    document.querySelector("#toggleCamera").addEventListener("click", toggleCamera);
    document.querySelector("#toggleMic").addEventListener("click", toggleMic);
    document.querySelector("#hangupBtn").addEventListener("click", hangUp);
}

async function openUserMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    document.querySelector("#localVideo").srcObject = stream;
    localStream = stream;
    remoteStream = new MediaStream();
    document.querySelector("#remoteVideo").srcObject = remoteStream;
    document.querySelector("#toggleCamera").disabled = false;
    document.querySelector("#toggleMic").disabled = false;
    document.querySelector("#hangupBtn").disabled = false;
}

async function makeRoom() {
    await openUserMedia();
    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    const roomId = urlParams.get("key");
    document.getElementById("board").setAttribute("src", `https://removirtual-board.herokuapp.com/?key=${roomId}`);
    const db = firebase.firestore();
    roomRef = db.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();

    if (roomSnapshot.exists) {
        joinRoomById(roomId);
    } else {
        createRoomById();
    }
}

async function createRoomById() {
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const roomWithOffer = {
        offer: {
            type: offer.type,
            sdp: offer.sdp,
        },
    };
    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    const roomId = urlParams.get("key");
    const roomRef = await db.collection("rooms").doc(roomId);

    roomRef.set(roomWithOffer);

    const callerCandidatesCollection = roomRef.collection("callerCandidates");
    peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
            console.log("Got final candidate!");
            return;
        }
        console.log("Got candidate: ", event.candidate);
        callerCandidatesCollection.add(event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
            console.log("Add a track to the remoteStream:", track);
            remoteStream.addTrack(track);
        });
    });

    roomRef.onSnapshot(async(snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data && data.answer) {
            console.log("Got remote description: ", data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        }
    });

    roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async(change) => {
            if (change.type === "added") {
                let data = change.doc.data();
                console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
}

async function joinRoomById(roomId) {
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
    peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
            console.log("Got final candidate!");
            return;
        }
        console.log("Got candidate: ", event.candidate);
        calleeCandidatesCollection.add(event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
            console.log("Add a track to the remoteStream:", track);
            remoteStream.addTrack(track);
        });
    });

    const offer = roomSnapshot.data().offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    const roomWithAnswer = {
        answer: {
            type: answer.type,
            sdp: answer.sdp,
        },
    };
    await roomRef.update(roomWithAnswer);

    roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async(change) => {
            if (change.type === "added") {
                let data = change.doc.data();
                console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
}

function toggleCamera() {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    updateToggleIcon("#toggleCameraIcon", videoTrack.enabled);
}

function toggleMic() {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    updateToggleIcon("#toggleMicIcon", audioTrack.enabled);
}

function updateToggleIcon(selector, enabled) {
    const icon = document.querySelector(selector);
    icon.classList.toggle("fa-microphone", enabled);
    icon.classList.toggle("fa-microphone-slash", !enabled);
}

async function hangUp() {
    const tracks = localStream.getTracks();
    tracks.forEach(track => track.stop());

    if (peerConnection) {
        peerConnection.close();
    }

    document.querySelector("#localVideo").srcObject = null;
    document.querySelector("#remoteVideo").srcObject = null;

    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    const roomId = urlParams.get("key");
    if (roomId) {
        const db = firebase.firestore();
        const roomRef = db.collection("rooms").doc(roomId);
        const calleeCandidates = await roomRef.collection("calleeCandidates").get();
        calleeCandidates.forEach(async(candidate) => {
            await candidate.delete();
        });
        const callerCandidates = await roomRef.collection("callerCandidates").get();
        callerCandidates.forEach(async(candidate) => {
            await candidate.delete();
        });
        await roomRef.delete();
    }
}

function registerPeerConnectionListeners() {
    peerConnection.addEventListener("icegatheringstatechange", () => {
        console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener("connectionstatechange", () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange", () => {
        console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}

init();