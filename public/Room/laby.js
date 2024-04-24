var firebaseConfig = {
    apiKey: "AIzaSyCYdeigPuvdKyVj0rG53IoUZHaVyawyVZY",
    authDomain: "genzconnect-f5082.firebaseapp.com",
    databaseURL: "https://genzconnect-f5082-default-rtdb.firebaseio.com",
    projectId: "genzconnect-f5082",
    storageBucket: "genzconnect-f5082.appspot.com",
    messagingSenderId: "761396074376",
    appId: "1:761396074376:web:ce2c9a3560a78194698c3d",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var firebaseOrdersCollection = database.ref().child('Lab_details');

async function launchlab(roomId) {
    var content;
    console.log("here, in the room");
    await $.get(
        "rightly-striking-peacock.ngrok-free.app",
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
            }
        }
    }
}
