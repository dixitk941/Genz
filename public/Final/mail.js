

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
var firebaseOrdersCollection = database.ref().child('Interview_details');

const KEY_SIZE = 15;

var rand = random(KEY_SIZE);

document.getElementById("schedule-form").addEventListener("submit", function(event) {
    event.preventDefault();
    document.getElementById("schedule-submit-btn").innerHTML = `sending...`;
    sendmail();
});


function sendmail() {

    rand = random(KEY_SIZE);
    submitdetails();
}

function random(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return (result);
}

function submitdetails() {
    var details = {
        Interviewer_name: $('#P1name').val(),
        Interviewee_name: $('#P2name').val(),
        Interviewee_email: $("#P2email").val(),
        Interviewer_email: $("#P1email").val(),
        Date_: $("#date-time").val(),
        Key: rand,
    };

    firebaseOrdersCollection.child(rand).set(details);

    sendtointerviewee();
    sendtointerviewer();
    sendtoremovirtual();
};


function sendtointerviewee() {
    Email.send({

        Host: "smtp.gmail.com",
        Username: "work.dixitk941@gmail.com",
        Password: "Maruti941@",
        To: $("#P2email").val(),
        From: "work.dixitk941@gmail.com",
        Subject: "Interview Confirmation",
        Body: "Hey " + $("#P2name").val() + "<br>" + "Your interview has been scheduled on " + $("#date-time").val().split("T")[0] + " at " + $("#date-time").val().split("T")[1] + "<br>." + "Visit the URL : https://genzconnect-f5082.web.app . Join the room with the key - " + rand + "E" + "<br>. Wish you the best.",
    })
}

function sendtointerviewer() {
    Email.send({

        Host: "smtp.gmail.com",
        Username: "work.dixitk941@gmail.com",
        Password: "Maruti941@",
        To: $("#P1email").val(),
        From: "work.dixitk941@gmail.com",
        Subject: "Interview Confirmation",
        Body: "You interview with " + $("#P2name").val() + " has been scheduled on " + $("#date-time").val().split("T")[0] + " at " + $("#date-time").val().split("T")[1] + "." + "<br> Visit the URL : https://removirtual-fa3b3.web.app/pre-interview/index.html . Join the room with the key - " + rand + "R" + "<br> Please be present 10 minutes before the scheduled time ",
    })
}


function sendtoremovirtual() {
    Email.send({

        Host: "smtp.gmail.com",
        Username: "work.dixitk941@gmail.com",
        Password: "Maruti941@",
        To: "work.dixitk941@gmail.com",
        From: "work.dixitk941@gmail.com",
        Subject: "Launch the lab",
        Body: $("#date-time").val().split(" ")[0] + " at " + $("#date-time").val().split(" ")[1] + " " + $("#date-time").val().split(" ")[2] + ". Please launch the lab and ensure it is functional .",
    }).then(
        e => {
            document.getElementById("schedule-submit-btn").innerHTML = `
            <audio autoplay>
                <source src="./assets/insight.mp3#t=00:00:01" type="audio/ogg">
            </audio>
            SENT
            <svg class="tick-svg" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>`;
            setTimeout(function() { document.getElementById("schedule-submit-btn").innerHTML = `SEND`;
                document.getElementById("schedule-form").reset(); }, 3000);
        }
    );
}

function sendreview() {
    Email.send({

        Host: "smtp.gmail.com",
        Username: "work.dixitk941@gmail.com",
        Password: "Maruti941@",
        //To: $("#P1email").val(),
        To: "dixitk941@gmail.com",
        From: "work.dixitk941@gmail.com",
        Subject: "Interview Confirmation",
        Body: "hello",
    })
}

//---- contact us -------

document.getElementById("contact-form").addEventListener("submit", function(event) {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    event.preventDefault();

    document.getElementById("contact-submit-btn").innerHTML = `sending...`;

    Email.send({
        Host: "smtp.gmail.com",
        Username: "work.dixitk941@gmail.com",
        Password: "Maruti941@",
        To: "work.dixitk941@gmail.com",
        From: $("#email").val(),
        Subject: $("#name").val() + "'s query",
        Body: $("#message").val(),
    }).then(
        e => {
            document.getElementById("contact-submit-btn").innerHTML = `
            <audio autoplay>
                <source src="./assets/insight.mp3#t=00:00:01" type="audio/ogg">
            </audio>
            SENT
            <svg class="tick-svg" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>`;
            setTimeout(function() { document.getElementById("contact-submit-btn").innerHTML = `SEND`;
                document.getElementById("contact-form").reset(); }, 3000);
        }
    );

});
