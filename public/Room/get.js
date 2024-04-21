var firebaseConfig = {
    apiKey: "AIzaSyCYdeigPuvdKyVj0rG53IoUZHaVyawyVZY",
    authDomain: "genzconnect-f5082.firebaseapp.com",
    databaseURL: "https://genzconnect-f5082-default-rtdb.firebaseio.com",
    projectId: "genzconnect-f5082",
    storageBucket: "genzconnect-f5082.appspot.com",
    messagingSenderId: "761396074376",
    appId: "1:761396074376:web:ce2c9a3560a78194698c3d",
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
                document.getElementById("lab").setAttribute("src", keys[i].two);
            }
        }
    }
}
