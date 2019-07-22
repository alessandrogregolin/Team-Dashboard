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
var teamID;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        window.currentUser = user;
        getTeamId();
    } else {
        // No user is signed in.
        window.location.href = "index.html";
    };
});


//Get the id of the team of the trainer
function getTeamId() {
    db.collection("users").doc(currentUser.uid).get().then(function (userData) {
        window.teamID = userData.data().teamID;
        getGames(userData.data().teamID);
    });
};

let eventsFlip = [];
//retrieve the games of the team, display them and then calculate statistics
function getGames(teamID) {
    db.collection("teams").doc(teamID).collection("events").where("type", "==", "game").get().then(function (gamesQuery) {
        //Here return the query of only the team games
        let numOfGames = gamesQuery.size;
        let count = 0;
        if (gamesQuery.size == 0) {
            //There are no games
            console.log("the team has no games uploaded yet");
        } else {
            //Get all of the games of the team, also calculate statistics
            var calculated = 0;
            var totalPoints = 0;
            var totalWins = 0;
            var totalLosses = 0;

            gamesQuery.forEach(function (game) {
                //Here create the card that displays every game
                if (count <= numOfGames) {
                    if (game.data().homeScore == "future") {
                        //Game is future so do not display it
                        numOfGames--
                    } else {
                        count++
                        eventsFlip.push(game);
                        //Here calculate statistics
                        totalPoints = totalPoints + parseInt(game.data().homeScore);
                        if (parseInt(game.data().homeScore) < parseInt(game.data().opponentScore)) {
                            //game lost
                            totalLosses = totalLosses + 1;
                        } else {
                            //game won
                            totalWins = totalWins + 1;
                        };
                        calculated++;
                        //all of the games have been retrieved, now display the statistics
                        if (calculated == numOfGames) {
                            let winPercentage = Math.round((totalWins / numOfGames) * 100);
                            displayStats(totalPoints, totalWins, totalLosses, winPercentage);
                        };
                    };
                };
                if (count == numOfGames) {
                    flipEvents();
                };
            });
        };
    }).catch(function (error) {
        //There was an error retrieving the team games
    });
};

function flipEvents() {
    let eventsFlipped = eventsFlip.reverse();
    eventsFlipped.forEach(function (game) {
        createGameCard(game);
    });
};

// Here display the team statistics, also display all games the team has played
function displayStats(totalPoints, totalWins, totalLosses, winPercentage) {
    document.getElementById("pointsScored").innerHTML = totalPoints;
    document.getElementById("totalWins").innerHTML = totalWins;
    document.getElementById("totalLosses").innerHTML = totalLosses;
    document.getElementById("winPercentage").innerHTML = winPercentage;
};

function createGameCard(game) {
    let gameCardContainer = document.getElementById('gameCardContainer');

    let card = document.createElement("div");
    card.classList.add("card", "w-25");
    card.style.margin = "10px";
    $(card).appendTo(gameCardContainer);

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    $(cardBody).appendTo(card);

    let cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    cardTitle.style.fontWeight = "bolder";
    let date = new Date(game.data().date);
    cardTitle.innerHTML = date.toDateString();
    $(cardTitle).appendTo(cardBody);

    let cardRow = document.createElement("div");
    cardRow.classList.add("row");
    $(cardRow).appendTo(cardBody);

    let colMd6Home = document.createElement("div");
    colMd6Home.classList.add("col-md-6", "text-center");
    $(colMd6Home).appendTo(cardRow);

    let homeSpan = document.createElement("span");
    homeSpan.innerHTML = "Home";
    homeSpan.style.fontWeight = "bold";
    $(homeSpan).appendTo(colMd6Home);

    let homeScore = document.createElement("h2");
    homeScore.innerHTML = game.data().homeScore;
    homeScore.style.color = "orange";
    $(homeScore).appendTo(colMd6Home);

    let colMd6Opponent = document.createElement("div");
    colMd6Opponent.classList.add("col-md-6", "text-center");
    $(colMd6Opponent).appendTo(cardRow);

    let opponentSpan = document.createElement("span");
    opponentSpan.innerHTML = "Away";
    opponentSpan.style.fontWeight = "bold";
    $(opponentSpan).appendTo(colMd6Opponent);

    let opponentScore = document.createElement("h2");
    opponentScore.innerHTML = game.data().opponentScore;
    opponentScore.style.color = "orange";
    $(opponentScore).appendTo(colMd6Opponent);

    let gameComment = document.createElement("p");
    gameComment.classList.add("card-text", "text-center");
    gameComment.innerHTML = game.data().gameComment;
    $(gameComment).appendTo(cardBody);

    let cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer");
    $(cardFooter).appendTo(card);

    let footerColMd12 = document.createElement("div");
    footerColMd12.classList.add("col-md-12", "text-right");
    $(footerColMd12).appendTo(cardFooter);

    let footerA = document.createElement("a");
    footerA.style.cursor = "pointer";
    footerA.addEventListener("click", function () {
        openGameDetails(game);
    });
    $(footerA).appendTo(footerColMd12);

    let footerASmall = document.createElement("small");
    footerASmall.classList.add("text-muted");
    footerASmall.innerHTML = "See game details ";
    $(footerASmall).appendTo(footerA);

    let footerAI = document.createElement("i");
    footerAI.classList.add("fas", "fa-arrow-right");
    $(footerAI).appendTo(footerASmall);

};

//This opens a modal which shows the information on the game
function openGameDetails(game) {
    $('#playerStatsColumns').html('');
    $('#eventModalTrigger').click();
    let date = new Date(game.data().date);
    $('#eventDate').text(date.toDateString());
    $('#eventHomeScore').text(game.data().homeScore);
    $('#eventOpponentScore').text(game.data().opponentScore);
    $('#eventComment').text(game.data().gameComment);

    displayPlayerStats(game);
};

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