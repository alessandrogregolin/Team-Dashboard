// Initialize Firebase
var config = {
  apiKey: "AIzaSyDPUVzTbLP9_jwIt62EH3qoW17kTeR_rqI",
  authDomain: "team-dashboard-e5af8.firebaseapp.com",
  databaseURL: "https://team-dashboard-e5af8.firebaseio.com",
  projectId: "team-dashboard-e5af8",
  storageBucket: "",
  messagingSenderId: "690832044379"
};
firebase.initializeApp(config);

var db = firebase.firestore();
// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

var currentUser;
var teamID;

let checkboxes = ['shooting', 'dribbling', 'passing', 'schemes', 'athletics', 'aerobic'];
let playersId = [];
let playerPresence = [];
let playerStat = [];
let categories = [];

//creating a default declarator method for my event
function Event(type, description, date, categories, presence, opponentTeam, gameDate, homeScore, opponentScore, gameComment, statistics) {
  this.type = type;
  this.description = description;
  this.date = date;
  this.categories = categories;
  this.presence = presence;
  this.opponentTeam = opponentTeam;
  this.gameDate = gameDate;
  this.homeScore = homeScore;
  this.opponentScore = opponentScore;
  this.gameComment = gameComment;
  this.statistics = statistics;
}

let myEvent = new Event();

window.onload = function () {
  //emptying all inputs on the page when page reloads
  let inputs = document.getElementsByClassName("form-control");
  for (i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  };

  //Listening for a change in the description field
  document.getElementById('trainingDescription').addEventListener('input', function (evt) {
    myEvent.description = this.value;
  });

  //listening for a change in the date input
  document.getElementById('trainingDate').addEventListener('input', function () {
    let date = new Date(this.value);
    myEvent.date = date.getTime();

    let currentDate = new Date();
    if (date > currentDate) {
      document.getElementById('presenceContainer').style.visibility = "hidden";
      document.getElementById('futureEvent').style.display = "block";
      myEvent.presence = "future event";
    } else {
      document.getElementById('presenceContainer').style.visibility = "visible";
      document.getElementById('futureEvent').style.display = "none";
      myEvent.presence = "";
    };
  });

  //Listening change for every category and then uplaoding it to the event
  checkboxes.forEach(function (checkboxId) {
    let myCheck = document.getElementById(checkboxId);
    let labelID = checkboxId + "Label";
    let myCheckLabel = document.getElementById(labelID);

    if (myCheck.checked == true) {
      myCheck.checked = false;
    };

    myCheck.addEventListener('input', function () {
      if (this.checked == true) {
        myCheckLabel.style.backgroundColor = "#BEBEBE";
        categories.push(this.id);
        myEvent.categories = categories;
      } else {
        myCheckLabel.style.backgroundColor = "white";
        let elemIndex = categories.indexOf(this.id)
        categories.splice(elemIndex, 1);
        myEvent.categories = categories;
      };
    });
  });

  //When the user wants to add a team, all teams on the database are retrieved to let the user serach
  document.getElementById("opponentTeam").addEventListener("focus", function () {
    console.log("focus");
    document.getElementById("teamChoice").innerHTML = "";
    db.collection("teams").limit(10).get().then(function (teamsQuery) {
      teamsQuery.forEach(function (team) {
        let thisTeam = [team.data().name, "logo url"];
        let datalist = document.getElementById("teamChoice");
        let option = document.createElement("option");
        option.data = team;
        option.value = thisTeam[0];
        $(option).appendTo(datalist);
      });
    });
  });

  //The user can then search between the existsing team and 
  document.getElementById("opponentTeam").addEventListener("input", function (e) {
    myEvent.opponentTeam = this.value;
  });

  document.getElementById('gameDate').addEventListener('input', function () {
    let date = new Date(this.value);
    let currentDate = new Date();
    myEvent.gameDate = date.getTime();
    if (date > currentDate) {
      document.getElementById('scoreFields').style.visibility = "hidden";
      document.getElementById('statsContainer').style.visibility = "hidden";
      myEvent.opponentScore = "future";
      myEvent.homeScore = "future";
      myEvent.statistics = "future event";
      document.getElementById('futureEventStats').style.display = "block";
      document.getElementById('futureEventScore').style.display = "block"

    } else {
      document.getElementById('scoreFields').style.visibility = "visible";
      document.getElementById('statsContainer').style.visibility = "visible";
      myEvent.statistics = [];
      myEvent.homeScore = "";
      myEvent.statistics = "";
      document.getElementById('futureEventStats').style.display = "none";
      document.getElementById('futureEventScore').style.display = "none"
    }
    console.log(myEvent.gameDate);
    console.log(myEvent.homeScore);
    console.log(myEvent.opponentScore);
  });

  document.getElementById("gameComment").addEventListener("input", function () {
    myEvent.gameComment = this.value;
  });

  document.getElementById("homeScore").addEventListener("input", function () {
    myEvent.homeScore = this.value;
    console.log(myEvent);
  });

  document.getElementById("opponentScore").addEventListener("input", function () {
    myEvent.opponentScore = this.value;
    console.log(myEvent);
  });
};

//checking if user is logged in or not
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    window.currentUser = user;
    //retrieve the team and the teamID
    getTeamId();
  } else {
    // No user is signed in.
    window.location.href = "index.html";
  }
});

//Get the id of the team of the trainer
function getTeamId() {
  db.collection("users").doc(currentUser.uid).get().then(function (userData) {
    window.teamID = userData.data().teamID;
    getTeam(userData.data().teamID);
  });
};

/** getting details about the team, adding the player Id to my list of players
so I can check at the end if the fiedl has been completed for evey player
and creating one presence field for evey player*/
function getTeam(id) {
  db.collection("teams").doc(id).collection("players").get().then(function (playersQuery) {
    playersQuery.forEach(function (player) {
      playersId.push(player.data().playerID);
      createPresenceField(player);
      createStatField(player);
    });
  }).catch(function (error) {
    console.log("there was an error getting details on the team and the players")
  });
};

//getting position of elements in a 2d array
function getIndexOfElem(array, elem) {
  for (var i = 0; i < array.length; i++) {
    var index = array[i].indexOf(elem);
    if (index > -1) {
      return [i, index];
    }
  }
};

function changeViewTraining() {
  let trainingBtn = document.getElementById('trainingBtn');
  let gameBtn = document.getElementById('gameBtn');
  trainingBtn.style.backgroundColor = "#BEBEBE";
  gameBtn.style.backgroundColor = "white";
  myEvent.type = "training";
  document.getElementById("trainingFields").style.display = "block";
  document.getElementById("gameFields").style.display = "none";

};

function changeViewGame() {
  let trainingBtn = document.getElementById('trainingBtn');
  let gameBtn = document.getElementById('gameBtn');
  gameBtn.style.backgroundColor = "#BEBEBE";
  trainingBtn.style.backgroundColor = "white";
  myEvent.type = "game";
  document.getElementById("trainingFields").style.display = "none";
  document.getElementById("gameFields").style.display = "block";

};

function createPresenceField(player) {
  let presenceContainer = document.getElementById("presenceContainer");

  let colMd6 = document.createElement("div");
  colMd6.classList.add("col-md-6");
  colMd6.style.padding = "15px";
  $(colMd6).appendTo(presenceContainer);

  let playerNameDiv = document.createElement("div");
  playerNameDiv.style.width = "50%";
  playerNameDiv.style.float = "left";
  playerNameDiv.style.border = "1px solid orange";
  playerNameDiv.style.borderRight = "0";
  playerNameDiv.style.paddingLeft = "5px";
  playerNameDiv.style.backgroundColor = "white";
  $(playerNameDiv).appendTo(colMd6);

  let playerNameSpan = document.createElement("span");
  playerNameSpan.style.fontWeight = "bold";
  playerNameSpan.innerHTML = player.data().name;
  playerNameSpan.style.float = "left";
  $(playerNameSpan).appendTo(playerNameDiv);

  let buttonsDiv = document.createElement("div");
  buttonsDiv.style.width = "50%";
  buttonsDiv.style.float = "right";
  buttonsDiv.style.border = "1px solid orange";
  buttonsDiv.style.borderLeft = "0";
  buttonsDiv.style.paddingRight = "20px";
  buttonsDiv.style.textAlign = "right";
  buttonsDiv.style.backgroundColor = "white";
  $(buttonsDiv).appendTo(colMd6);

  let presence = [];
  let buttonCheck = document.createElement('a');
  buttonCheck.style.marginRight = "10px";
  buttonCheck.style.cursor = "pointer";
  buttonCheck.addEventListener("click", function () {
    //checks if the presence has already been added, if not adds to array and signs it as present
    presence = [player.data().playerID, true];
    let index = getIndexOfElem(playerPresence, player.data().playerID);
    if (index !== undefined) {
      playerPresence[index[0]] = presence;
      myEvent.presence = playerPresence;
    } else {
      playerPresence.push(presence);
      myEvent.presence = playerPresence;
    };
    checkItem.style.color = "green";
    crossItem.style.color = "grey";
  });
  $(buttonCheck).appendTo(buttonsDiv);

  let buttonCross = document.createElement('a');
  buttonCross.style.cursor = "pointer";
  buttonCross.addEventListener("click", function () {
    //checks if the presence has already been added, if not adds to array and signs it as absent
    presence = [player.data().playerID, false];
    //Gets index of 
    let index = getIndexOfElem(playerPresence, player.data().playerID);
    if (index !== undefined) {
      playerPresence[index[0]] = presence;
      myEvent.presence = playerPresence;
    } else {
      playerPresence.push(presence);
      myEvent.presence = playerPresence;
    };
    crossItem.style.color = "red";
    checkItem.style.color = "grey";
  });
  $(buttonCross).appendTo(buttonsDiv);

  let checkItem = document.createElement('i');
  checkItem.classList.add("fas", "fa-check");
  checkItem.style.color = "grey";
  $(checkItem).appendTo(buttonCheck);

  let crossItem = document.createElement('i');
  crossItem.classList.add("fas", "fa-times");
  crossItem.style.color = "grey";
  $(crossItem).appendTo(buttonCross);
};

function createStatField(player) {
  let presenceContainer = document.getElementById("statsContainer");

  let colMd6 = document.createElement("div");
  colMd6.classList.add("col-md-6");
  colMd6.style.padding = "15px";
  $(colMd6).appendTo(presenceContainer);

  let playerNameDiv = document.createElement("div");
  playerNameDiv.style.width = "50%";
  playerNameDiv.style.float = "left";
  playerNameDiv.style.border = "1px solid orange";
  playerNameDiv.style.borderBottom = "1px solid grey";
  playerNameDiv.style.borderRight = "0";
  playerNameDiv.style.paddingLeft = "5px";
  playerNameDiv.style.backgroundColor = "white";
  $(playerNameDiv).appendTo(colMd6);

  let playerNameSpan = document.createElement("span");
  playerNameSpan.style.fontWeight = "bold";
  playerNameSpan.innerHTML = player.data().name;
  playerNameSpan.style.float = "left";
  $(playerNameSpan).appendTo(playerNameDiv);

  let buttonsDiv = document.createElement("div");
  buttonsDiv.style.width = "50%";
  buttonsDiv.style.float = "right";
  buttonsDiv.style.border = "1px solid orange";
  buttonsDiv.style.borderLeft = "0";
  buttonsDiv.style.borderBottom = "1px solid grey";
  buttonsDiv.style.paddingRight = "20px";
  buttonsDiv.style.textAlign = "right";
  buttonsDiv.style.backgroundColor = "white";
  $(buttonsDiv).appendTo(colMd6);

  let statsDiv = document.createElement("div");
  statsDiv.style.width = "100%";
  statsDiv.style.height = "50px";
  statsDiv.style.float = "right";
  statsDiv.style.border = "1px solid orange";
  statsDiv.style.borderTop = "0";
  statsDiv.style.backgroundColor = "white";
  statsDiv.style.padding = "5px";
  $(statsDiv).appendTo(colMd6);

  let pointsInput = document.createElement("input");
  pointsInput.setAttribute("type", "number");
  pointsInput.setAttribute("id", "points");
  pointsInput.style.width = "calc(100% / 3)";
  pointsInput.classList.add("form-inputs");
  pointsInput.placeholder = "Points";
  pointsInput.style.margin = "5px";
  pointsInput.style.textIndent = "5px";
  pointsInput.style.color = "grey";
  $(pointsInput).appendTo(statsDiv);

  let assistsInput = document.createElement("input");
  assistsInput.setAttribute("type", "number");
  assistsInput.setAttribute("id", "assists");
  assistsInput.style.width = "calc(100% / 3)";
  assistsInput.classList.add("form-inputs");
  assistsInput.placeholder = "Assists";
  assistsInput.style.textIndent = "5px";
  assistsInput.style.margin = "5px";
  assistsInput.style.color = "grey";
  $(assistsInput).appendTo(statsDiv);

  let reboundsInput = document.createElement("input");
  reboundsInput.setAttribute("type", "number");
  reboundsInput.setAttribute("id", "rebounds");
  reboundsInput.style.width = "calc(100% / 3 - 30px)";
  reboundsInput.classList.add("form-inputs");
  reboundsInput.placeholder = "Rebounds";
  reboundsInput.style.textIndent = "5px";
  reboundsInput.style.margin = "5px";
  reboundsInput.style.color = "grey";
  $(reboundsInput).appendTo(statsDiv);

  let stat = [];
  let buttonCheck = document.createElement('a');
  buttonCheck.style.marginRight = "10px";
  buttonCheck.style.cursor = "pointer";
  //change this to eliminate the cross or check
  buttonCheck.addEventListener("click", function () {

    //checks if the stat has already been added, if not adds to array and signs it as added
    let points = pointsInput.value;
    let assists = assistsInput.value;
    let rebounds = reboundsInput.value;
    //Checking if some value has actually been given
    if (points == "" && assists == "" && rebounds == "") {
      checkItem.classList.add("fa-upload");
      checkItem.classList.remove("fa-sync-alt");

    } else {
      stat = [player.data().playerID, points, assists, rebounds];
      let index = getIndexOfElem(playerStat, player.data().playerID);
      if (index !== undefined) {
        playerStat[index[0]] = stat;
        myEvent.statistics = playerStat;
        console.log(myEvent);
        checkItem.classList.remove("fa-upload");
        checkItem.classList.add("fa-sync-alt");
      } else {
        playerStat.push(stat);
        myEvent.statistics = playerStat;
        console.log(myEvent);
        checkItem.classList.remove("fa-upload");
        checkItem.classList.add("fa-sync-alt");
      };
      checkItem.style.color = "green";
      crossItem.style.color = "grey";
    }

  });
  $(buttonCheck).appendTo(buttonsDiv);

  let buttonCross = document.createElement('a');
  buttonCross.style.cursor = "pointer";
  buttonCross.addEventListener("click", function () {
    //checks if the presence has already been added, if not adds to array and signs it as absent
    let points = pointsInput.value;
    let assists = assistsInput.value;
    let rebounds = reboundsInput.value;
    if (points == "" && assists == "" && rebounds == "") {

    } else {
      stat = [player.data().playerID, points, assists, rebounds];
      //Gets index of 
      let index = getIndexOfElem(playerStat, player.data().playerID);
      if (index !== undefined) {
        playerStat.splice(index[0], 1);
        myEvent.statistics = playerStat;
        console.log(myEvent);
        checkItem.classList.remove("fa-sync-alt");
        checkItem.classList.add("fa-upload");
      } else {
        //The statistic is not in the array yet
        console.log(myEvent);
      };
      crossItem.style.color = "red";
      checkItem.style.color = "grey";
    };
  });
  $(buttonCross).appendTo(buttonsDiv);

  let checkItem = document.createElement('i');
  checkItem.classList.add("fas", "fa-upload");
  checkItem.style.color = "grey";
  $(checkItem).appendTo(buttonCheck);

  let crossItem = document.createElement('i');
  crossItem.classList.add("fas", "fa-times");
  crossItem.style.color = "grey";
  $(crossItem).appendTo(buttonCross);
};


function checkEvent() {
  //If all field have been completed, then upload
  //Otherwise ask the user to fill all values+
  console.log(myEvent);
  let numOfPlayers = playersId.length;
  let numOfPresence = playerPresence.length;
  let invalid = [];
  if (myEvent.type == undefined || myEvent.type == "") {
    invalid.push("type");
  } else if (myEvent.type == "training") {
    //enter fields validation for training
    if (myEvent.presence == "future event") {

    } else if (numOfPresence < numOfPlayers) {
      //The presence field has not been completed for all players
      invalid.push("presence");
    };
    if (myEvent.description == undefined || myEvent.description == "") {
      //The description has not been filled up
      invalid.push("description");
    };
    if (myEvent.date == undefined || myEvent.date == "") {
      //The date has not been filled up
      invalid.push("date");
    };
    if (myEvent.categories == undefined) {
      invalid.push("categories");
    } else {
      if (myEvent.categories.length == 0) {
        invalid.push("categories");
      };
    };
  } else if (myEvent.type == "game") {
    //enter validation for game event
    if (myEvent.opponentTeam == undefined || myEvent.opponentTeam == "") {
      invalid.push("opponentTeam");
    };
    if (myEvent.homeScore == undefined || myEvent.homeScore == "") {
      invalid.push("homeScore");
    } else if (myEvent.homeScore == "future") {

    };
    if (myEvent.opponentScore == undefined || myEvent.opponentScore == "") {
      invalid.push("opponentScore");
    } else if (myEvent.opponentScore == "future") {

    };
    if (myEvent.gameDate == undefined || myEvent.gameDate == "") {
      invalid.push("gameDate");
    };
    if (myEvent.gameComment == undefined || myEvent.gameComment == "") {
      invalid.push("gameComment");
    };
    if (myEvent.statistics == undefined || myEvent.statistics.length == 0) {
      invalid.push("statistics");
    }
  };
  return invalid;
};

function uploadEvent() {
  //clearing all alert spans to check if now the field has been filled in
  let alertSpan = document.getElementsByClassName("alertSpan");
  for (i = 0; i < alertSpan.length; i++) {
    alertSpan[i].style.display = "none";
  };
  let fieldsMissing = checkEvent();
  console.log(fieldsMissing);

  if (fieldsMissing.length == 0) {
    //All fields have been completed, now upload the event
    if (myEvent.type == "training") {
      uploadTraining();
    } else if (myEvent.type == "game") {
      uploadGame();
    } else {
      console.log("There was an error as no event object was found");
    };
  } else {
    //Some field has not been completed, return which field has not been completed and display error span
    fieldsMissing.forEach(function (field) {
      switch (field) {
        case "presence":
          document.getElementById("presenceAlert").style.display = "block";
          break;
        case "description":
          document.getElementById("descriptionAlert").style.display = "block";
          break;
        case "date":
          document.getElementById("dateAlert").style.display = "block";
          break;
        case "categories":
          document.getElementById("categoryAlert").style.display = "block";
          break;
        case "type":
          document.getElementById("typeAlert").style.display = "block";
          break;
        case "opponentTeam":
          document.getElementById("opponentTeamAlert").style.display = "block";
          break;
        case "opponentScore":
          document.getElementById("opponentScoreAlert").style.display = "block";
          break;
        case "homeScore":
          document.getElementById("homeScoreAlert").style.display = "block";
          break;
        case "gameDate":
          document.getElementById("gameDateAlert").style.display = "block";
          break;
        case "gameComment":
          document.getElementById("gameCommentAlert").style.display = "block";
          break;
        case "statistics":
          document.getElementById("gameStatsAlert").style.display = "block";
          break;
      };
    });
  };
};

function uploadTraining() {
  let training = {
    type: myEvent.type,
    description: myEvent.description,
    date: myEvent.date,
    categories: myEvent.categories
  };

  let eventRef = db.collection("teams").doc(teamID).collection("events");
  eventRef.add(training).then(function (eventUploaded) {
    //Uploaded training event successfully
    let eventKey = eventUploaded.id;
    let presenceArray = myEvent.presence;
    let uploaded = presenceArray.length;

    if (myEvent.presence == "future event") {
      //The event is future, there will be no presence
      window.location.reload();
    } else {
      //Upload presence for the players
      presenceArray.forEach(function (playerPresence) {
        db.collection("teams").doc(teamID).collection("events").doc(eventKey).collection("presence").doc(playerPresence[0]).set({
          present: playerPresence[1]
        }).then(function () {
          uploaded = uploaded - 1;
          if (uploaded == 0) {
            //upload finished, now upload to the player directory
            let uploadedToPlayer = presenceArray.length;
            presenceArray.forEach(function (presence) {
              let playerID = presence[0];
              let playerEventRef = db.collection("users").doc(playerID).collection("events").doc(eventKey).set({
                type: myEvent.type,
                description: myEvent.description,
                date: myEvent.date,
                categories: myEvent.categories,
                presence: presence[1]
              }).then(function () {
                //Training event correclty uploaded to the user directory
                uploadedToPlayer = uploadedToPlayer - 1;
                if (uploadedToPlayer == 0) {
                  console.log("training event upload finished to the player directory");
                  //upload finished to the player document, entire upload finished now reload page
                  window.location.reload();
                };
              }).catch(function (error) {
                //There was an error uploading the event to the user directory
                console.log("There was an error uploading the event to the user directory", error.description);
              });
            });


            window.location.reload();
          };
        }).catch(function (error) {
          //An error occurred when uploading presence for the players
          console.log(error.message);
        });
      });
    };
  }).catch(function (error) {
    //An error occurred while uploading the event, please try again later
    console.log(error.message);
  });
};

function uploadGame() {
  let game = {
    type: myEvent.type,
    opponentTeam: myEvent.opponentTeam,
    homeScore: myEvent.homeScore,
    opponentScore: myEvent.opponentScore,
    date: myEvent.gameDate,
    gameComment: myEvent.gameComment
  };
  let eventRef = db.collection("teams").doc(teamID).collection("events");
  eventRef.add(game).then(function (eventUploaded) {
    //Uploaded training event successfully
    let eventKey = eventUploaded.id;
    let eventStats = myEvent.statistics;
    let uploaded = eventStats.length;
    console.log(myEvent.statistics);
    if (myEvent.statistics == "future event") {
      //The event is future, no statistics needed so just refresh the page
      window.location.reload();
    } else {
      //Upload the game statistics individually and both in the game document and in the player document
      eventStats.forEach(function (playerStat) {
        db.collection("teams").doc(teamID).collection("events").doc(eventKey).collection("statistics").doc(playerStat[0]).set({
          points: playerStat[1],
          assists: playerStat[2],
          rebounds: playerStat[3]
        }).then(function () {
          console.log("event uploaded correctly");
          uploaded = uploaded - 1;
          if (uploaded == 0) {
            console.log("upload finished to the game directory");
            //upload finished to the game document, now upload to the player document
            let uploadedToPlayer = eventStats.length;
            eventStats.forEach(function (playerStat) {
              let playerId = playerStat[0];
              console.log(playerId)
              db.collection("users").doc(playerId).collection("events").doc(eventKey).set({
                opponent: myEvent.opponentTeam,
                gameDate: myEvent.gameDate,
                gameComment: myEvent.gameComment,
                type: myEvent.type,
                points: playerStat[1],
                assists: playerStat[2],
                rebounds: playerStat[3]
              }).then(function () {
                console.log("event uploaded correctly");
                uploadedToPlayer = uploadedToPlayer - 1;
                if (uploadedToPlayer == 0) {
                  console.log("upload finished to the player directory");
                  //upload finished to the player document, entire upload finished now reload page
                  window.location.reload();
                };
              });
            });
          };
        });
      });
    };
  }).catch(function (error) {
    //An error occurred while uploading the event, please try again later
    console.log(error.message);
  });
};