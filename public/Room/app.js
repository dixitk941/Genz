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
let roomSnapshot = null;

function init() {
    makeRoom().catch(error => {
        console.error("Failed to initialize:", error);
    });

    if (window.localStorage.getItem('interviewer') == 0) {
        $('#myModal').modal({
            backdrop: 'static'
        });
        $("#myModal").modal("show");
    }
    
    document.querySelector("#toggleCamera").addEventListener("click", toggleCamera);
    document.querySelector("#toggleMic").addEventListener("click", toggleMic);
    document.querySelector("#hangupBtn").addEventListener("click", hangUp);
}

async function makeRoom() {
    await openUserMedia();
    
    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    const roomId = urlParams.get("key");
    
    if (!roomId) {
        throw new Error("Room ID is missing.");
    }

    const boardLink = `https://genz-whiteboard.vercel.app/?key=${roomId}`;
    document.getElementById("board").setAttribute("src", boardLink);

    const name = window.localStorage.getItem('name');
    const chatLink = `https://genz-chat-six.vercel.app/?key=${roomId}&name=${name}`;
    document.getElementById("chat").setAttribute("src", chatLink);

    const db = firebase.firestore();
    roomRef = db.collection("rooms").doc(`${roomId}`);
    roomSnapshot = await roomRef.get();

    if (roomSnapshot.exists) {
        joinRoomById(roomId);
    } else {
        createRoomById();
    }

    return roomId;
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

    const roomId = getRoomIdFromUrl();
    launchlab(roomId);

    roomRef.set(roomWithOffer);

    peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) return;
        roomRef.collection("callerCandidates").add(event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    });

    roomRef.onSnapshot(async(snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data && data.answer) {
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        }
    });

    roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async(change) => {
            if (change.type === "added") {
                const data = change.doc.data();
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
        if (!event.candidate) return;
        calleeCandidatesCollection.add(event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
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
                const data = change.doc.data();
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
}

async function openUserMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });

    localStream = stream;
    document.querySelector("#localVideo").srcObject = stream;
    remoteStream = new MediaStream();
    document.querySelector("#remoteVideo").srcObject = remoteStream;
}

function toggleCamera() {
    const isEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !isEnabled;
}

function toggleMic() {
    const isEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !isEnabled;
}

async function hangUp() {
    const tracks = document.querySelector("#localVideo").srcObject.getTracks();
    tracks.forEach((track) => track.stop());

    if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
    }

    const roomId = getRoomIdFromUrl();
    if (roomId) {
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

    window.location.replace("../feedback/Feedback.html");
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

function getRoomIdFromUrl() {
    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    return urlParams.get("key");
}

init();
