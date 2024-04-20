const configuration = {
    iceServers: [{
        urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    }, ],
    iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let createdRoomDialog = null;
let roomId = null;
let roomRef = null;
let roomSnapshot = null;

async function init() {
    await openUserMedia();
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

var elem = document.documentElement;

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

async function joinRoom(roomId) {
    document.querySelector("#joinBtn").disabled = true;
    localStream = await openUserMedia();
    roomRef = firebase.database().ref('rooms/' + roomId);
    roomRef.on('value', roomSnapshot => {
        setupPeerConnection(roomSnapshot.val().iceServers);
        setupDataChannel();
        createRemoteStream(roomId);
    });
}

async function createRoom() {
    document.querySelector("#createBtn").disabled = true;
    const roomId = firebase.database().ref('rooms').push().key;
    window.localStorage.setItem('interviewer', 1);
    roomRef = firebase.database().ref('rooms/' + roomId);
    await roomRef.set({
        iceServers: JSON.stringify(configuration.iceServers),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
    openFullscreen();
    window.location.href = "index.html?room=" + roomId;
}

async function openUserMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    document.querySelector('#localVideo').srcObject = stream;
    return stream;
}

function makeRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
        joinRoom(roomId);
    } else {
        createRoom();
    }
}

function setupPeerConnection(iceServers) {
    peerConnection = new RTCPeerConnection({
        iceServers: JSON.parse(iceServers),
    });
    peerConnection.onicecandidate = handleIceCandidate;
    peerConnection.ontrack = handleRemoteStream;
}

function setupDataChannel() {
    const dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onopen = (event) => {
        dataChannel.send('Hello World!');
    };
    dataChannel.onmessage = (event) => {
        console.log('Got message:', event.data);
    };
}

function handleIceCandidate(event) {
    if (event.candidate) {
        roomRef.update({
            'iceCandidates': firebase.database.ServerValue.ARRAY_UNION([{
                candidate: event.candidate.candidate,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                sdpMid: event.candidate.sdpMid,
            }]),
        });
    }
}

function handleRemoteStream(event) {
    const mediaStream = event.streams[0];
    const remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = mediaStream;
}

async function createRemoteStream(roomId) {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
        const remoteStream = new MediaStream();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        roomRef.update({
            'offer': {
                type: offer.type,
                sdp: offer.sdp,
            },
        });
        roomRef.on('child_added', async (data) => {
            if (!remoteStream.getVideoTracks().length || !remoteStream.getAudioTracks().length) {
                const remoteDesc = new RTCSessionDescription(data.val());
                await peerConnection.setRemoteDescription(remoteDesc);
                if (remoteDesc.type === 'offer') {
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    roomRef.update({
                        'answer': {
                            type: answer.type,
                            sdp: answer.sdp,
                        },
                    });
                }
            }
        });
    }
}
async function addIceCandidate(candidate) {
    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (err) {
        console.error('Failed to add ICE candidate', err);
    }
}

async function main() {
    firebase.initializeApp(firebaseConfig);
    firebase.database().ref('rooms').on('child_added', (roomSnapshot) => {
        const roomId = roomSnapshot.key;
        const candidate = roomSnapshot.val().iceCandidates[0];
        if (candidate) {
            addIceCandidate(new RTCIceCandidate(candidate));
        }
    });
    makeRoom();
}

main();
