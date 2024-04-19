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

let database = firebase.database();
let fire = database.ref().child("Interview_details");
var val;

function validate() {
    //           console.log(document.getElementById("P1name").value);
    val = document.getElementById("room_key").value;
    valname = document.getElementById("room_name").value;
    window.localStorage.setItem('name', valname);
    if (val.endsWith('R')) {
        window.localStorage.setItem('interviewer', 1);
    } else {
        window.localStorage.setItem('interviewer', 0);
    }
    console.log(window.localStorage.getItem('interviewer'));
    val = val.slice(0, -1);
    console.log(val);
    document.getElementById("form").reset();

    fire.on("value", gotData);

    function gotData(data) {
        data = data.val();
        console.log(data);
        let keys = Object.keys(data);
        var present = keys.includes(val);
        if (present == true) {
            url = "../Room/room.html?key=" + val;
            console.log(present);
            window.location.replace(url);
        } else {
            alert("Stay Calm And Enter The Correct Key!");
        }
    }
}
