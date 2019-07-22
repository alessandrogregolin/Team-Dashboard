
var config = {
    apiKey: "AIzaSyDPUVzTbLP9_jwIt62EH3qoW17kTeR_rqI",
    authDomain: "team-dashboard-e5af8.firebaseapp.com",
    databaseURL: "https://team-dashboard-e5af8.firebaseio.com",
    projectId: "team-dashboard-e5af8",
    storageBucket: "",
    messagingSenderId: "690832044379"
};
firebase.initializeApp(config);

var database = firebase.database();
var db = firebase.firestore();
// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location.href = "home.html";
    } else {
        // No user is signed in.
    }
});

function login() {
    let emailField = document.getElementById('email');
    let passwordField = document.getElementById('password');

    firebase.auth().signInWithEmailAndPassword(emailField.value, passwordField.value).then(function () {
        window.location.href = "home.html";
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
};

function subscribeViewChange() {
    document.getElementById('loginView').style.display = "none";
    document.getElementById('subscribeView').style.display = "initial";
};

function loginViewChange(){
    document.getElementById('subscribeView').style.display = "none";
    document.getElementById('loginView').style.display = "initial"; 
};

function trainerView(){
    document.getElementById('teamID').style.display = "none";
    document.getElementById('teamName').style.display = "initial";
    document.getElementById('subscribeBtn').setAttribute("onclick", "trainerSubscribe()");
    document.getElementById('playerSubscribe').style.backgroundColor = "white";
    document.getElementById('playerSubscribe').style.color = "orange";
    document.getElementById('trainerSubscribe').style.backgroundColor = "orange";
    document.getElementById('trainerSubscribe').style.color = "white";
};

function playerView(){
    document.getElementById('teamID').style.display = "initial";
    document.getElementById('teamName').style.display = "none";
    document.getElementById('subscribeBtn').setAttribute("onclick", "playerSubscribe()");
    document.getElementById('trainerSubscribe').style.backgroundColor = "white";
    document.getElementById('trainerSubscribe').style.color = "orange";
    document.getElementById('playerSubscribe').style.backgroundColor = "orange";
    document.getElementById('playerSubscribe').style.color = "white";
};

function trainerSubscribe(){
    var name = document.getElementById('nameSurname').value; 
    var email = document.getElementById('emailSubscribe').value;
    var password = document.getElementById('passwordSubscribe').value;
    var teamName = document.getElementById('teamName').value;
    //This will save the name to localStorage so that it can be saved once in the portal
    localStorage.setItem("trainerName", name);
    localStorage.setItem("userType", "trainer");
    localStorage.setItem("teamName", teamName);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
        //The user was created successfully, now save the data on datbase and then log them in
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
        // ...
      });
};

function playerSubscribe(){
    var name = document.getElementById('nameSurname').value; 
    var email = document.getElementById('emailSubscribe').value;
    var password = document.getElementById('passwordSubscribe').value;
    var teamID = document.getElementById('teamID').value;
    //This will save the name to localStorage so that it can be saved once in the portal
    localStorage.setItem("trainerName", name);
    localStorage.setItem("userType", "player");
    localStorage.setItem("teamName", teamID);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
        //The user was created successfully, now save the data on datbase and then log them in
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
       alert(errorMessage);
        // ...
      });
};