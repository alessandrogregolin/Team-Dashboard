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

function checkUser() {
    //Here check if the user logged in is a trainer or a player and tehrefore change the amount fo information dispalyed in the dahsboard
    var userRef = db.collection("users").doc(currentUser.uid);
    userRef.get().then(function (doc) {
        if (doc.exists) {
            //The user data exists, now read it and check if user is a trainer or not
            if (doc.data().userType == "trainer") {
                //The user is a trainer
                var teamID = doc.data().teamID;
                document.getElementById("teamID").innerHTML = teamID;
                document.getElementById('manageTeamBtn').style.display = "block";
                retrieveTeam(teamID, doc.data().userType);

            } else if (doc.data().userType == "player") {
                //The user is a player
                var teamID = doc.data().teamID;
                window.teamID = doc.data().teamID;
                window.playerID = currentUser.uid;
                retrieveTeam(teamID, doc.data().userType);
            };
        } else {
            // doc.data() will be undefined in this case
            console.log("There is no document on database for this user");
        };
    });
};

//Manage all of the information of the team, including players
function retrieveTeam(teamID, userType) {
    let teamRef = db.collection("teams").doc(teamID);
    teamRef.collection("players").get().then(function (playersSnap) {
        playersSnap.forEach(function (player) {
            //Here manage every player singularly, add the player to the page
            let playerCardsContainer = document.getElementById('playerCardsContainer');

            let card = document.createElement('div');
            card.classList.add('card');
            card.style.width = "14rem";
            card.style.border = "none";

            let userCardDiv = document.createElement('div');
            userCardDiv.style.height = "204.35px";
            userCardDiv.style.width = "224px";
            $(userCardDiv).appendTo(card);

            let userCardSettingsDiv = document.createElement('div');
            userCardSettingsDiv.style.textAlign = "center";
            userCardSettingsDiv.style.height = "204.35px";
            userCardSettingsDiv.style.width = "224px";
            userCardSettingsDiv.style.display = "none";
            userCardSettingsDiv.style.lineHeight = "204.35px";
            userCardSettingsDiv.style.border = "2px solid orange";
            userCardSettingsDiv.style.borderRadius = "6px";
            $(userCardSettingsDiv).appendTo(userCardDiv);

            let buttonRow = document.createElement('div');
            buttonRow.style.width = "100%";
            buttonRow.style.verticalAlign = "middle";
            $(buttonRow).appendTo(userCardSettingsDiv);

            let infoButton = document.createElement('a');
            infoButton.setAttribute("id", "infoButtonUser");
            infoButton.style.cursor = "pointer";
            infoButton.style.marginRight = "10px";
            let infoIcon = document.createElement('i');
            infoIcon.classList.add('fas', 'fa-info-circle', 'fa-2x');
            infoIcon.style.color = "orange";
            $(infoIcon).appendTo(infoButton);
            $(infoButton).appendTo(buttonRow);
            infoButton.addEventListener("click", function () {
                //Here open a modal where the trainer or players can view info of the player
                setUpPlayerModal("info", player, teamID);
            });

            if (userType == "trainer") {
                let settingsButton = document.createElement('a');
                settingsButton.setAttribute("id", "settingsButtonUser");
                settingsButton.style.cursor = "pointer";
                let settingsIcon = document.createElement('i');
                settingsIcon.classList.add('fas', 'fa-cog', 'fa-2x');
                settingsIcon.style.color = "orange";
                $(settingsIcon).appendTo(settingsButton);
                $(settingsButton).appendTo(buttonRow);
                settingsButton.addEventListener("click", function () {
                    //Here open a modal where the trainer can change settings of the player
                    setUpPlayerModal("settings", player, teamID);
                });
            } else {};

            let playerImage = document.createElement('img');
            playerImage.classList.add('card-img');
            playerImage.setAttribute("src", "img/playerCardBg.png");
            $(playerImage).appendTo(userCardDiv);

            $(userCardDiv).hover(function () {
                $(playerImage).css("display", "none");
                $(userCardSettingsDiv).css("display", "block");
            }, function () {
                $(playerImage).css("display", "initial");
                $(userCardSettingsDiv).css("display", "none");
            });

            let cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'text-center');
            $(cardBody).appendTo(card);

            let playerName = document.createElement('h5');
            playerName.innerHTML = player.data().name;
            $(playerName).appendTo(cardBody);
            playerName.style.color = "orange";

            $(card).appendTo(playerCardsContainer);

        });
    }).catch(function (error) {
        //There was an error retrieving the data for the players
    })

};

var playerChangedID;
var teamPlayerChangedID;

function setUpPlayerModal(type, player, teamID) {
    //Here change the info showed in the modal wether the modal needs to be on settings or on information
    if (type == "info") {
        //The user clicked info, present the info of the player in a modal
        document.getElementById('playerName').innerHTML = player.data().name;
        document.getElementById('playerPosition').innerHTML = player.data().playerPosition;
        document.getElementById('playerNumber').innerHTML = player.data().playerNum;
        let gamesPlayed = document.getElementById('gamesPlayed');
        let assistsScored = document.getElementById('assistsScored');
        let pointsScored = document.getElementById('pointsScored');
        let reboundsScored = document.getElementById('reboundsScored');


        let presentTraining = 0;
        let absentTraining = 0;
        let totalNumOfTraining = 0;
        let totalNumOfGames = 0;
        let totalPoints = 0;
        let totalAssists = 0;
        let totalRebounds = 0;

        // Here calculate the training percentage based on how many training sessions the player was present against all training sessions of the team
        let trainingSessionsQuery = db.collection("users").doc(player.id).collection("events").where("type", "==", "training");
        trainingSessionsQuery.get().then(function (trainingQuery) {
            let numOfTraining = trainingQuery.size;
            totalNumOfTraining = trainingQuery.size;
            let processedTraining = 0;
            trainingQuery.forEach(function (trainingSession) {
                //Here getting all of the training sessions the user has partecipayted in
                processedTraining = processedTraining + 1;
                if (trainingSession.data().presence == true) {
                    presentTraining = presentTraining + 1;
                } else {
                    absentTraining = absentTraining + 1;
                };
            });
            if (processedTraining == numOfTraining) {
                //finished iterating through all training sessions
                let trainingString = (presentTraining.toString() + "/" + totalNumOfTraining.toString());
                document.getElementById('trainingPresence').innerHTML = trainingString;
            };
        }).catch(function (error) {
            //There was an error when attempting to query the training sessions of the player
            console.log("There was an error when attempting to query the training sessions of the player", error.description);
        });
        // Here calculate the game statistics based on how many games the player was present against all game sessions of the team adn also other statistics
        let gameSessionsQuery = db.collection("users").doc(player.id).collection("events").where("type", "==", "game");
        gameSessionsQuery.get().then(function (gameQuery) {
            let numOfGames = gameQuery.size;
            totalNumOfGames = gameQuery.size;
            let processedGames = 0;
            gameQuery.forEach(function (gameSession) {
                //Here getting all of the game sessions the user has partecipayted in
                console.log(gameSession.data());
                processedGames = processedGames + 1;
                totalPoints = totalPoints + parseInt(gameSession.data().points);
                totalAssists = totalAssists + totalAssists + parseInt(gameSession.data().assists);
                totalRebounds = totalRebounds + parseInt(gameSession.data().rebounds);
            });
            if (processedGames == numOfGames) {
                //finished iterating through all training sessions
               gamesPlayed.innerHTML = totalNumOfGames.toString();
               pointsScored.innerHTML = totalPoints.toString();
               assistsScored.innerHTML = totalAssists.toString();
               reboundsScored.innerHTML = totalRebounds.toString();
            };
        }).catch(function (error) {
            //There was an error when attempting to query the training sessions of the player
            console.log("There was an error when attempting to query the game sessions of the player", error);
        });


        window.playerChangedID = player.data().playerID;
        window.teamPlayerChangedID = teamID;
        $('#playerDataModalTrigger').click();

    } else if (type == "settings") {
        //The user clicked settings, present the user settings in a modal
        var playerName = document.getElementById('playerSettingsName');
        var playerNumber = document.getElementById('number');
        var position = document.getElementById('position');

        playerName.innerHTML = player.data().name;
        playerNumber.setAttribute("value", player.data().playerNum);
        position.setAttribute("value", player.data().playerPosition);

        window.playerChangedID = player.data().playerID;
        window.teamPlayerChangedID = teamID;
        document.getElementById('modalCross').addEventListener("click", function () {
            playerNumber.value = player.data().playerNum;
            position.value = player.data().playerPosition;
        });
        document.getElementById('deleteUserBtn').addEventListener('click', function () {
            deleteUser(player, teamID);
        });
        $('#playerSettingsModalTrigger').click();
    };
};

function updateInfo() {
    var number = document.getElementById('number').value;
    var position = document.getElementById('position').value;

    db.collection("teams").doc(teamPlayerChangedID).collection("players").doc(playerChangedID).update({
        "playerPosition": position,
        "playerNum": number,
    }).then(function () {
        console.log("success updating user");
        window.location.reload();
        $('#closePlayerSettingsModal').click();
    }).catch(function (error) {
        alert("There was an error updating the user information, try again");
    });
};

function deleteUser(player, teamID) {
    //Delete the user from the database record and then make a messagge appear on the player interface suggesting they should delete the account
    db.collection("teams").doc(teamID).collection("players").doc(player.data().playerID).delete().then(function () {
        //The user was correctly removed from the team
        var playerAlert = document.getElementById('playerAlertSettings');
        playerAlert.innerHTML = "The user was correctly removed from the team. The page will be reloaded in a moment. Please be patient";
        setTimeout(function () {
            playerAlert.innerHTML = "";
            window.location.reload();
        }, 1500);
    }).catch(function (error) {
        console.log(error.message);
        playerAlert.innerHTML = error.message;
        setTimeout(function () {
            playerAlert.innerHTML = "";
            window.location.reload();
        }, 1500);
    })
};