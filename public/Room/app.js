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
let roomId = null;

// Initialize Firebase Storage
const storage = firebase.storage();

function init() {
    makeRoom();
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

async function uploadFile(file) {
    const storageRef = storage.ref().child(`files/${roomId}/${file.name}`);
    await storageRef.put(file);
    return storageRef.getDownloadURL();
}

async function downloadFile(fileName) {
    const storageRef = storage.ref().child(`files/${roomId}/${fileName}`);
    const url = await storageRef.getDownloadURL();
    return url;
}

var elem = document.documentElement;

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

if (window.localStorage.getItem('interviewer') == 0) {
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);

    function exitHandler() {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            $('#warning').modal({
                backdrop: 'static'
            });
            $("#warning").modal("show");
        }
    }
}

async function makeRoom() {
    await openUserMedia();
    const querystring = window.location.search;
    const urlParams = new URLSearchParams(querystring);
    roomId = urlParams.get("key");
    
    var boardLink = "https://genz-whiteboard.vercel.app/?key=" + roomId;
    document.getElementById("board").setAttribute("src", boardLink);
    
    name = window.localStorage.getItem('name');
    var chatLink = "https://genz-chat-six.vercel.app/?key=" + roomId + "&name=" + name;
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
    const db = firebase.firestore();
    console.log("Create PeerConnection with configuration: ", configuration);
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

    roomId = await uploadFile(new Blob([JSON.stringify(roomWithOffer)], { type: 'application/json' }));

    const roomRef = db.collection("rooms").doc(roomId);

    // Code for collecting ICE candidates
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
                let data = change.doc.data();
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });

    return roomId;
}

async function joinRoomById(roomId) {
    console.log(roomSnapshot);
    console.log("Create PeerConnection with configuration: ", configuration);
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
                let data = change.doc.data();
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

    document.querySelector("#localVideo").srcObject = stream;
    localStream = stream;

    remoteStream = new MediaStream();
    document.querySelector("#remoteVideo").srcObject = remoteStream;

    document.querySelector("#toggleCamera").disabled = false;
    document.querySelector("#toggleMic").disabled = false;
    document.querySelector("#hangupBtn").disabled = false;
}

function toggleCamera() {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
}

function toggleMic() {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
}

async function hangUp(e) {
    const tracks = document.querySelector("#localVideo").srcObject.getTracks();
    tracks.forEach((track) => {
        track.stop();
    });

    if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
    }

    document.querySelector("#localVideo").srcObject = null;
    document.querySelector("#remoteVideo").srcObject = null;
    document.querySelector("#hangupBtn").disabled = true;
    document.querySelector("#currentRoom").innerText = "";

    window.location.replace("../feedback/Feedback.html");

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
