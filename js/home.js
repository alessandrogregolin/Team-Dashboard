var config = {
  apiKey: "AIzaSyDPUVzTbLP9_jwIt62EH3qoW17kTeR_rqI",
  authDomain: "team-dashboard-e5af8.firebaseapp.com",
  databaseURL: "https://team-dashboard-e5af8.firebaseio.com",
  projectId: "team-dashboard-e5af8",
  storageBucket: "",
  messagingSenderId: "690832044379"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
var db = firebase.firestore();
// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

var currentUser;

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    window.currentUser = user;
    checkUser();
  } else {
    // No user is signed in.
    window.location.href = "index.html";
  }
});

window.onload = function () {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  };


};

var teamID;

//Here checking wether the user is new or not and then if he is not checking what user type he is(trainer or player) and changiong info displayed on dashboard
function checkUser() {
  if (currentUser.displayName == null) {
    //The user is new and therefore set it up
    //Already see if he is a player or trainer and change db setting upon that
    if (localStorage.getItem('userType') == "trainer") {
      addUserTrainer();
    } else if (localStorage.getItem('userType') == "player") {
      addUserPlayer();
    };
  } else {
    //The user already exists, now check if he is a trainer or player
    //Here check if the user logged in is a trainer or a player and tehrefore change the amount of information dispalyed in the dahsboard
    var userRef = db.collection("users").doc(currentUser.uid);
    userRef.get().then(function (doc) {
      if (doc.exists) {
        //The user data exists, now read it and check if user is a trainer or not
        if (doc.data().userType == "trainer") {
          //The user is a trainer
          var teamID = doc.data().teamID;
          window.teamID = teamID;
          console.log("user is trainer");
          checkTeam(teamID);
        } else if (doc.data().userType == "player") {
          //The user is a player
          console.log("user is player");
          //Check if he is part of a team, if he is not anymore ask him to delete the account
          var teamID = doc.data().teamID;
          window.teamID = teamID;
          db.collection("teams").doc(teamID).collection("players").doc(currentUser.uid).get().then(function (player) {
            if (player.exists) {
              //The user is part of a team, if he is not block the database and ask to delete the account
              console.log("The user is part of a team");
            } else {
              //The user is not part of a team
              var name = prompt("You are not part of a valid team. Please enter your name to confirm the deletion of the account, leave blank to cancel and try again later", "");
              if (name == null || name == "") {
                window.location.reload();
              } else if (name == doc.data().name) {
                //Here delete the user
                //Delete the user from the users database
                db.collection("users").doc(currentUser.uid).delete().then(function () {
                  var user = firebase.auth().currentUser;
                  user.delete().then(function () {
                    // User deleted.
                    window.location.reload();
                  }).catch(function (error) {
                    // An error happened.
                    alert("You will be logged out. Please login back into the dashboard");
                    setTimeout(function () {
                      firebase.auth().signOut().then(function () {
                        // Sign-out successful.
                      }).catch(function (error) {
                        // An error happened.
                      });
                    }, 1500);
                  });
                }).catch(function (error) {
                  //Error removing user from database
                  alert("there was an error removing the user form the database, try again");
                });
              } else {
                var r = confirm("The name entered is incorrect, try again");
                if (r == true) {
                  window.location.reload();
                } else {
                  window.localtion.reload();
                }
              };
            }
          })
        };
      } else {
        // doc.data() will be undefined in this case
        console.log("There is no document on database for this user");
      };
    });
  };
};

function addUserTrainer() {
  //Add the user as a trainer
  var userData = {
    name: localStorage.getItem('trainerName'),
    userType: localStorage.getItem('userType'),
    teamName: localStorage.getItem('teamName')
  };
  //getting a reference to the database, in the users directory
  let ref = db.collection("users").doc(currentUser.uid);
  db.collection("users").doc(currentUser.uid).set(userData).then(function () {
    //User correctly added to users directory, now create the team associated with the trainer, in the teams directory
    db.collection("teams").add({
      name: localStorage.getItem('teamName'),
      trainerID: currentUser.uid
    }).then(function (newTeamRef) {
      console.log("The team has been successfully created on the database");
      //adding the teamID to the user account and adding the trainer id to the team

      db.collection("users").doc(currentUser.uid).update({
        teamID: newTeamRef.id
      });

      db.collection("teams").doc(newTeamRef.id).update({
        teamID: newTeamRef.id
      });

      //Changing the trainer name to the entered details in the index.html sign-up form
      currentUser.updateProfile({
        displayName: localStorage.getItem('trainerName')
      }).then(function () {
        //Update succesful
        localStorage.clear();
        /*running the checkUser function, which checks if the trainer already has a team or if a player 
        is in a team or has been kicked out*/
        checkUser();
      }).catch(function (error) {
        console.log("error at line 74, updating user display name", error.message);
      });

    }).catch(function (error) {
      //Here a red pupup that appears on the database and infroms the user is created
      alert("There was an error creating your team on the database, please refresh the page to try again");
      console.log(error.message);
    });

  }).catch(function (error) {
    //There was an error when uploading the user to the database
    console.log("There was an error uplaoding the trainer user to the database", error.message);
    //Try again
    chechUser();
  });
};

function addUserPlayer() {
  //Add the user as a player
  var userData = {
    name: localStorage.getItem('trainerName'),
    userType: localStorage.getItem('userType'),
    teamID: localStorage.getItem('teamName')
  };

  //Add the user to the user directory of the database
  let ref = db.collection("users").doc(currentUser.uid);
  db.collection("users").doc(currentUser.uid).set(userData).then(function () {
    //Adding user data to the users directory of database and updating displayName
    //Here add the player also the his team directory
    var teamID = localStorage.getItem('teamName');
    db.collection("teams").doc(teamID).collection("players").doc(currentUser.uid).set({
      name: localStorage.getItem('trainerName'),
      playerID: currentUser.uid
    }).then(function () {
      //Correctly uploaded player to the team, change displayname and clear localStorage
      var name = localStorage.getItem('trainerName');
      currentUser.updateProfile({
        displayName: name
      }).then(function () {
        //The user was correctly created and the displayname changed
        localStorage.clear();
        //Run it again
        checkUser();
      }).catch(function (error) {
        alert("There was an error updating the user, trying again");
        checkUser();
      });
    })
  });
}

//Functions to generate a random ID which is then pushed to the team
function guid() {
  return "s-s-sss".replace(/s/g, s4);
};

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

//Function to chech the correct setup of the team
function checkTeam(teamID) {



  let teamRef = db.collection("teams").doc(teamID);
  teamRef.get().then(function (team) {
    if (team.exists) {
      //The team has been set up, now check if there are already at least 5 players

      getEvents(teamID);
      teamRef.collection("players").get().then(function (players) {
        console.log(players.size);
        if (players.size != 0) {
          console.log("There are players enrolled in the team")
        } else {
          console.log("There are no players in the team");
          //There are no players enrolled in the team
          document.getElementById('teamAlert').innerHTML = "<b>There are no players enrolled in the team, ask your players to create an account and use the following data when registering</b>";
          document.getElementById('teamID').innerHTML = team.data().teamID;
          $('#modalTriggerBtn').click();
        };
      });
    } else {
      console.log("The team still has to be created");
      checkUser();
    };
  }).catch(function (error) {
    //Error retrieving data from the database
    alert("There was a problem retrieving the team information. Please check your internet connection and try again", error.message);
    console.log("Error getting document:", error);
  });
};

let pastEventsArray = [];

function getEvents(teamID) {
  //Here get all events (games and training sessions) of the team and displays them from the most recent to the oldest
  let trainingRef = db.collection("teams").doc(teamID).collection("events");
  trainingRef.orderBy("date").get().then(function (query) {
    let querySize = query.size;
    let count = 0;
    query.forEach(function (event) {
      count++;
      console.log(querySize);
      console.log(count);
      if (count <= querySize) {
        if (event.data().date < Date.now()) {
          console.log("event expired");
          //The event has expired
          pastEventsArray.push(event);
        } else {
          console.log("future event")
          displayEventCard(event, "eventsContainer");
        };
      };
      if (count == querySize) {
        flipEvents();
      };
    });
  });
};

//This function takes the events queried and if they are expired it reverses the order and then appends tem in the past events container
function flipEvents() {
  let pastEventsFlipped = pastEventsArray.reverse();
  pastEventsFlipped.forEach(function (pastEvent) {
    displayEventCard(pastEvent, "expiredEventsContainer");
  });
};

function displayEventCard(event, containerId) {
  //Now that I have retrieved the events, add them to the page
  let eventsContainer = document.getElementById(containerId);

  let eventRow = document.createElement("div");
  eventRow.classList.add("row", "eventRow");
  eventRow.style.borderBottom = "1px solid black";
  eventRow.style.height = "130px";
  $(eventRow).appendTo(eventsContainer);

  let dateTypeDiv = document.createElement("div");
  dateTypeDiv.classList.add("col-md-4");
  dateTypeDiv.style.marginTop = "10px";
  $(dateTypeDiv).appendTo(eventRow);

  let typeIcon = document.createElement("i");
  if (event.data().type == "training") {
    typeIcon.classList.add("fas", "fa-shoe-prints", "fa-lg");
  } else if (event.data().type == "game") {
    typeIcon.classList.add("fas", "fa-trophy", "fa-lg");
    if (parseInt(event.data().homeScore) < parseInt(event.data().opponentScore)) {
      //The game was lost
      typeIcon.style.color = "red";
    } else if (parseInt(event.data().homeScore) > parseInt(event.data().opponentScore)) {
      //The game was won
      typeIcon.style.color = "green";
    } else if (parseInt(event.data().homeScore) == parseInt(event.data().opponentScore)) {
      //The game was tied
      typeIcon.style.color = "orange";
    };
  };
  typeIcon.style.marginRight = "10px";
  typeIcon.style.borderBottom = "1px solid orange";
  typeIcon.style.padding = "10px";
  $(typeIcon).appendTo(dateTypeDiv);

  let dateSpan = document.createElement("span");
  let date = new Date(event.data().date);
  dateSpan.innerHTML = date.toDateString();
  dateSpan.style.borderBottom = "1px solid orange";
  dateSpan.style.padding = "8px";
  dateSpan.style.fontWeight = "bold";
  $(dateSpan).appendTo(dateTypeDiv);

  let detailsDiv = document.createElement("div");
  detailsDiv.classList.add("col-md-4", "text-center", "align-center", "align-self-center");
  $(detailsDiv).appendTo(eventRow);

  let detailsSpan = document.createElement("span");
  detailsSpan.style.fontWeight = "bold";
  $(detailsSpan).appendTo(detailsDiv);

  if (event.data().type == "training") {
    detailsSpan.innerHTML = event.data().description;
  } else {
    detailsSpan.innerHTML = event.data().opponentTeam;
    //If the event is a game, also add the game result
    let resultRow = document.createElement("div");
    resultRow.classList.add("row", "justify-content-center");
    resultRow.style.marginTop = "10px";
    $(resultRow).appendTo(detailsDiv);
    if (event.data().homeScore == "future") {
      //The event is future, do not display results, display event is future
    } else {
      let homeResult = document.createElement("div");
      homeResult.style.border = "2px solid orange";
      homeResult.innerHTML = event.data().homeScore;
      homeResult.style.padding = "10px";
      homeResult.style.marginRight = "10px";
      homeResult.style.fontWeight = "bold";
      $(homeResult).appendTo(resultRow);

      let vs = document.createElement("div");
      vs.style.fontWeight = "bold";
      vs.style.textAlign = "center";
      vs.innerHTML = "VS"
      vs.style.padding = "10px";
      $(vs).appendTo(resultRow);

      let opponentResult = document.createElement("div");
      opponentResult.style.border = "2px solid orange";
      opponentResult.innerHTML = event.data().opponentScore;
      opponentResult.style.padding = "10px";
      opponentResult.style.marginLeft = "10px";
      opponentResult.style.fontWeight = "bold";
      $(opponentResult).appendTo(resultRow);
    }
  };

  let openDiv = document.createElement("div");
  openDiv.classList.add("col-md-4", "text-right");
  openDiv.style.lineHeight = "130px";
  openDiv.style.cursor = "pointer";
  $(openDiv).appendTo(eventRow);
  openDiv.addEventListener("click", function () {
    document.getElementById('playerStatsColumns').innerHTML = "";
    document.getElementById('playerPresence').innerHTML = "";
    document.getElementById('trainingCategories').innerHTML = "";
    configureEventModal(event);
    $("#eventModalTrigger").click();
  });

  let openBtn = document.createElement("a");
  openBtn.style.verticalAlign = "center";
  $(openBtn).appendTo(openDiv);

  let openIcon = document.createElement("i");
  openIcon.classList.add("fas", "fa-arrow-right")
  $(openIcon).appendTo(openBtn);
};

//create the modal to display the event details
function configureEventModal(event) {
  let eventType = event.data().type;
  let eventDate = new Date(event.data().date).toDateString();
  let currentDate = new Date();
  document.getElementById('eventDate').innerHTML = eventDate;
  if (eventType == "training") {
    //The event is of type training, get all of the information
    document.getElementById('gameModal').style.display = "none";
    document.getElementById('trainingModal').style.display = "initial";
    document.getElementById('eventType').classList.remove("fa-trophy");
    document.getElementById('eventType').classList.add("fa-shoe-prints");

    document.getElementById('trainingDescription').innerHTML = event.data().description;

    //displaying categories
    event.data().categories.forEach(function (category) {
      console.log
      let categoryContainer = document.getElementById('trainingCategories');
      let card = document.createElement("div");
      card.classList.add("card", "col-md-3", "categoryCard");
      $(card).appendTo(categoryContainer);

      let cardBody = document.createElement("div");
      cardBody.classList.add("card-body", "text-center");
      $(cardBody).appendTo(card);

      let categoryH4 = document.createElement("h4");
      categoryH4.innerHTML = category;
      $(categoryH4).appendTo(cardBody);
    });

    //displaying presence if the event is past and there are statistics
    if (event.data().date <= currentDate) {
      //The event has past therefore there is presence, display it
      document.getElementById('playerPresence').style.display = "block";
      displayPlayerPresence(event);
    } else {
      //The event is future, do not show any presence
      document.getElementById('playerPresence').style.display = "none";
    };

  } else if (eventType == "game") {
    //The event is of type game
    document.getElementById('gameModal').style.display = "initial";
    document.getElementById('trainingModal').style.display = "none";
    document.getElementById('eventType').classList.remove("fa-shoe-prints");
    document.getElementById('eventType').classList.add("fa-trophy");
    document.getElementById("eventHomeScore").innerHTML = event.data().homeScore;
    document.getElementById("eventOpponentScore").innerHTML = event.data().opponentScore;
    document.getElementById("opponentTeam").innerHTML = event.data().opponentTeam;
    document.getElementById("eventComment").innerHTML = event.data().gameComment;
    //Create a card for every player that has statistics and display it
    displayPlayerStats(event);
  };
};

//Display the presence for the players if the event was past
function displayPlayerPresence(event) {
  let eventKey = event.id;
  console.log("displayplayerPresence");
  let eventPresenceRef = db.collection("teams").doc(teamID).collection("events").doc(eventKey).collection("presence");
  eventPresenceRef.get().then(function (presenceQuery) {
    presenceQuery.forEach(function (presence) {
      let userID = presence.id;
      db.collection("users").doc(userID).get().then(function (playerData) {
        let playerPresence = document.getElementById('playerPresence');

        let row = document.createElement("div");
        row.classList.add("row", "presenceRow");
        $(row).appendTo(playerPresence);

        let colMd6Name = document.createElement("div");
        colMd6Name.classList.add("col-md-6");
        $(colMd6Name).appendTo(row);

        let nameH4 = document.createElement("h4");
        nameH4.innerHTML = playerData.data().name;
        $(nameH4).appendTo(colMd6Name);

        let colMd6Presence = document.createElement("div");
        colMd6Presence.classList.add("col-md-6", "text-right");
        $(colMd6Presence).appendTo(row);

        let presenceH5 = document.createElement("h5");
        if (presence.data().present == true) {
          presenceH5.innerHTML = "Present";
          presenceH5.style.color = "#006622"
        } else {
          presenceH5.innerHTML = "Absent";
          presenceH5.style.color = "#990000"
        }
        $(presenceH5).appendTo(colMd6Presence);

      }).catch(function (error) {
        //There was an error hetting the information on the user
        console.log("There was an error getting the information on the user", error.description);
      });
    });
  }).catch(function (error) {
    //There was a problem getting the presence for the players
    console.log("There was an error getting presentce for the event", error.description);
  });
};

//Display player stats in the event modal
function displayPlayerStats(event) {
  let eventKey = event.id;
  let eventStatsRef = db.collection("teams").doc(teamID).collection("events").doc(eventKey).collection("statistics");
  //get the single player statistics
  eventStatsRef.get().then(function (statsQuery) {
    statsQuery.forEach(function (query) {

      let userID = query.id;
      //get info on the user 
      //Create a card for every player that has statistics and display it
      let playerStatsColumns = document.getElementById("playerStatsColumns");

      let playerCard = document.createElement("div");
      playerCard.classList.add("card", "text-center", "p-1");
      $(playerCard).appendTo(playerStatsColumns);

      let cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
      $(cardBody).appendTo(playerCard);

      db.collection("users").doc(userID).get().then(function (playerData) {
        playerName = playerData.data().name;
        let cardTitle = document.createElement("h5");
        cardTitle.style.fontWeight = "bold";
        cardTitle.classList.add("card-title");
        cardTitle.innerHTML = playerName;
        $(cardTitle).appendTo(cardBody);

        let statsDiv = document.createElement("div");
        statsDiv.classList.add("row");
        $(statsDiv).appendTo(cardBody);

        let pointsDiv = document.createElement("div");
        pointsDiv.classList.add("col-md-4", "text-center");
        pointsDiv.style.padding = "0";
        $(pointsDiv).appendTo(statsDiv);

        let pointsText = document.createElement("b");
        pointsText.innerHTML = "Points";
        pointsText.style.fontSize = "1.4vw";
        $(pointsText).appendTo(pointsDiv);

        let pointsbr = document.createElement("br");
        $(pointsbr).appendTo(pointsDiv);

        let points = document.createElement("span");
        points.innerHTML = parseInt(query.data().points);
        points.style.color = "orange";
        points.style.fontSize = "3vw";
        $(points).appendTo(pointsDiv);

        let assistsDiv = document.createElement("div");
        assistsDiv.classList.add("col-md-4", "text-center");
        assistsDiv.style.padding = "0";
        $(assistsDiv).appendTo(statsDiv);

        let assistsText = document.createElement("b");
        assistsText.innerHTML = "Assits";
        assistsText.style.fontSize = "1.4vw";
        $(assistsText).appendTo(assistsDiv);

        let assistsbr = document.createElement("br");
        $(assistsbr).appendTo(assistsDiv);

        let assists = document.createElement("span");
        assists.innerHTML = parseInt(query.data().assists);
        assists.style.color = "orange";
        assists.style.fontSize = "3vw";
        $(assists).appendTo(assistsDiv);

        let reboundsDiv = document.createElement("div");
        reboundsDiv.classList.add("col-md-4", "text-center");
        reboundsDiv.style.padding = "0";
        $(reboundsDiv).appendTo(statsDiv);

        let reboundsText = document.createElement("b");
        reboundsText.innerHTML = "Reb";
        reboundsText.style.fontSize = "1.4vw";
        $(reboundsText).appendTo(reboundsDiv);

        let reboundsBr = document.createElement("br");
        $(reboundsBr).appendTo(reboundsDiv);

        let rebounds = document.createElement("span");
        rebounds.innerHTML = parseInt(query.data().rebounds);
        rebounds.style.color = "orange";
        rebounds.style.fontSize = "3vw";
        $(rebounds).appendTo(reboundsDiv);

      }).catch(function (error) {
        //There was an error getting the player information and statistics
        console.log("There was an error getting the information on the user");
      });
    });
  }).catch(function (error) {
    //error getting the stats
    console.log("There was an error getting the statistics for this event");
  });
};

//This function logs out the user
function logout() {
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
    window.location.href = "index.html";
  }).catch(function (error) {
    // An error happened.
    window.alert("It appears you are offline. Check your internet connection and try again");
  });
};