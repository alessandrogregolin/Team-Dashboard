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
var teamID;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        window.currentUser = user;
        //retrieve the team and the teamID
        getTeam();

    } else {
        // No user is signed in.
        window.location.href = "index.html";
    }
});

window.onload = function () {

};

function getTeam() {
    db.collection("users").doc(currentUser.uid).get().then(function (userData) {
        window.teamID = userData.data().teamID;
        getEquipment();
    });
};

function getEquipment() {
    //Retrieve the numbers for all of the equipment items
    db.collection("teams").doc(teamID).collection("equipment").get().then(function (equipmentQuery) {
        equipmentQuery.forEach(function (equipment) {
            switch (equipment.data().itemType) {
                case "balls":
                    let basketballOwned = document.getElementById('basketballOwned');
                    basketballOwned.innerHTML = "Owned:" + " " + equipment.data().owned;
                    document.getElementById('basketballExpected').innerHTML = "Expected:" + " " + equipment.data().expected;
                    if (equipment.data().owned < equipment.data().expected) {
                        basketballOwned.style.color = "#7F0000";
                    } else if (equipment.data().owned == equipment.data().expected) {
                        basketballOwned.style.color = "black";
                    } else if (equipment.data().owned > equipment.data().expected) {
                        basketballOwned.style.color = "#004000";
                    };
                    document.getElementById('expectedBasketballs').value = equipment.data().expected;

                    break;
                case "obstacles":
                    let obstacleOwned = document.getElementById('obstacleOwned');
                    obstacleOwned.innerHTML = "Owned:" + " " + equipment.data().owned;
                    if (equipment.data().owned < equipment.data().expected) {
                        obstacleOwned.style.color = "#7F0000";
                    } else if (equipment.data().owned == equipment.data().expected) {
                        obstacleOwned.style.color = "black";
                    } else if (equipment.data().owned > equipment.data().expected) {
                        obstacleOwned.style.color = "#004000";
                    };
                    document.getElementById('obstacleExpected').innerHTML = "Expected:" + " " + equipment.data().expected;
                    document.getElementById('expectedObstacles').value = equipment.data().expected;
                    break;
                case "dumbells":
                    let dumbellOwned = document.getElementById('dumbellOwned');
                    dumbellOwned.innerHTML = "Owned:" + " " + equipment.data().owned;
                    if (equipment.data().owned < equipment.data().expected) {
                        dumbellOwned.style.color = "#7F0000";
                    } else if (equipment.data().owned == equipment.data().expected) {
                        dumbellOwned.style.color = "black";
                    } else if (equipment.data().owned > equipment.data().expected) {
                        dumbellOwned.style.color = "#004000";
                    };
                    document.getElementById('dumbellExpected').innerHTML = "Expected:" + " " + equipment.data().expected;
                    document.getElementById('expectedDumbells').value = equipment.data().expected;
                    break;
                case "uniforms":
                    let uniformOwned = document.getElementById('uniformOwned');
                    uniformOwned.innerHTML = "Owned:" + " " + equipment.data().owned;
                    if (equipment.data().owned < equipment.data().expected) {
                        uniformOwned.style.color = "#7F0000";
                    } else if (equipment.data().owned == equipment.data().expected) {
                        uniformOwned.style.color = "black";
                    } else if (equipment.data().owned > equipment.data().expected) {
                        uniformOwned.style.color = "#004000";
                    };
                    document.getElementById('uniformExpected').innerHTML = "Expected:" + " " + equipment.data().expected;
                    document.getElementById('expectedUniforms').value = equipment.data().expected;
                    break;
                case "jumpropes":
                    let jumpropeOwned = document.getElementById('jumpropeOwned');
                    jumpropeOwned.innerHTML = "Owned:" + " " + equipment.data().owned;
                    if (equipment.data().owned < equipment.data().expected) {
                        jumpropeOwned.style.color = "#7F0000";
                    } else if (equipment.data().owned == equipment.data().expected) {
                        jumpropeOwned.style.color = "black";
                    } else if (equipment.data().owned > equipment.data().expected) {
                        jumpropeOwned.style.color = "#004000";
                    };
                    document.getElementById('jumpropeExpected').innerHTML = "Expected:" + " " + equipment.data().expected;
                    document.getElementById('expectedJumpropes').value = equipment.data().expected;
                    break;
            };
        });
    });
};


//add equipment to the currently owned on the database
function plusEquipment(buttonID) {
    switch (buttonID) {
        case "plusBasketball":
            changeEquipmentDB("balls", "plus");
            break;
        case "plusObstacle":
            changeEquipmentDB("obstacles", "plus");
            break;
        case "plusDumbell":
            changeEquipmentDB("dumbells", "plus");
            break;
        case "plusUniform":
            changeEquipmentDB("uniforms", "plus");
            break;
        case "plusJumprope":
            changeEquipmentDB("jumpropes", "plus");
            break;
        default:
            "There was an error adding equipment";

    };
};

//remove equipment to the currently owned on the database
function minusEquipment(buttonID) {
    switch (buttonID) {
        case "minusBasketball":
            changeEquipmentDB("balls", "minus");
            break;
        case "minusObstacle":
            changeEquipmentDB("obstacles", "minus");
            break;
        case "minusDumbell":
            changeEquipmentDB("dumbells", "minus");
            break;
        case "minusUniform":
            changeEquipmentDB("uniforms", "minus");
            break;
        case "minusJumprope":
            changeEquipmentDB("jumpropes", "minus");
            break;
        default:
            "There was an error removing equipment";
    };
};

function changeEquipmentDB(item, change) {
    let equipmentRef = db.collection("teams").doc(teamID).collection("equipment");
    if (change == "plus") {
        let equipmentAlert = document.getElementById("equipmentAlert");
        equipmentRef.doc(item).get().then(function (itemData) {
            if (itemData.exists) {
                let ownedNum = itemData.data().owned;
                equipmentRef.doc(item).update({
                    "itemType": item,
                    "owned": ownedNum + 1
                }).then(function () {
                    equipmentAlert.style.color = "green";
                    equipmentAlert.innerHTML = "Item count updated correctly";
                    getEquipment();
                }).catch(function (error) {
                    equipmentAlert.style.color = "red";
                    equipmentAlert.innerHTML = "There was an error updating the item count";
                })
            } else {
                equipmentRef.doc(item).set({
                    "itemType": item,
                    "owned": 1
                }).then(function () {
                    equipmentAlert.style.color = "green";
                    equipmentAlert.innerHTML = "Item count updated correctly";
                    getEquipment();
                }).catch(function (error) {
                    equipmentAlert.style.color = "red";
                    equipmentAlert.innerHTML = "There was an error updating the item count";
                });
            };
        });
    } else if (change == "minus") {
        let equipmentAlert = document.getElementById("equipmentAlert");
        equipmentRef.doc(item).get().then(function (itemData) {
            if (itemData.exists) {
                let ownedNum = itemData.data().owned;
                equipmentRef.doc(item).update({
                    "itemType": item,
                    "owned": ownedNum - 1
                }).then(function () {
                    equipmentAlert.style.color = "green";
                    equipmentAlert.innerHTML = "Item count updated correctly";
                    getEquipment();
                }).catch(function (error) {
                    equipmentAlert.style.color = "red";
                    equipmentAlert.innerHTML = "There was an error updating the item count";
                })
            } else {
                equipmentAlert.style.color = "red";
                equipmentAlert.innerHTML = "There are currently no items";
            };
        });
    };
};

var changedNum = 0;
var equipment = ["balls", "obstacles", "dumbells", "uniforms", "jumpropes"];
var equipmentIDs = ["expectedBasketballs", "expectedObstacles", "expectedDumbells", "expectedUniforms", "expectedJumpropes"];

function checkChanged() {
    let equipmentModalAlert = document.getElementById("equipmentModalAlert");
    document.getElementById('saveEquipmentChanges').disabled = true;
    document.getElementById('closeEquipmentModal').disabled = true;
    if (changedNum == 5) {
        //The upload of the changes has now ended
        equipmentModalAlert.style.color = "green";
        equipmentModalAlert.innerHTML = "All items have been correctly set to the expected levels";
        setTimeout(function () {
            changedNum = 0;
            document.getElementById('saveEquipmentChanges').disabled = false;
            document.getElementById('closeEquipmentModal').disabled = false;
            getEquipment();
            $('#closeEquipmentModal').click();
        }, 2000);

    } else {
        let item = equipment[changedNum];
        let num = document.getElementById(equipmentIDs[changedNum]).value;
        changeExpected(item, num);
    };
}

function changeExpected(item, num) {
    let equipmentRef = db.collection("teams").doc(teamID).collection("equipment");
    let equipmentModalAlert = document.getElementById("equipmentModalAlert");
    equipmentRef.doc(item).get().then(function (itemData) {
        if (itemData.exists) {
            let ownedNum = itemData.data().owned;
            equipmentRef.doc(item).update({
                "itemType": item,
                "owned": ownedNum,
                "expected": num
            }).then(function () {
                changedNum = changedNum + 1;
                checkChanged();
            }).catch(function (error) {
                equipmentModalAlert.style.color = "red";
                equipmentModalAlert.innerHTML = ("There was an error updating the item expected number", error.message);
            })
        } else {
            equipmentRef.doc(item).set({
                "itemType": item,
                "owned": 1,
                "expected": num
            }).then(function () {
                changedNum = changedNum + 1;
                checkChanged();
            }).catch(function (error) {
                equipmentModalAlert.style.color = "red";
                equipmentModalAlert.innerHTML = ("There was an error updating the item expected number", error.message);
            });
        };
    });
};

function requestItem(id) {
    console.log(id);
    let equipmentAlert = document.getElementById('equipmentAlert');
    let equipmentRef = db.collection("teams").doc(teamID).collection("equipment");
    let teamRef = db.collection("teams").doc(teamID);
    teamRef.get().then(function (team) {
        if (team.data().requestEmail != null) {
            let email = team.data().requestEmail;
            switch (id) {
                case 'requestBasketball':
                    equipmentRef.doc("balls").get().then(function(basketballs) {
                        if (basketballs.exists) {
                            let neededNum = basketballs.data().expected - basketballs.data().owned;
                            let subject = "Basketballs order needed";
                            let body = "Please order " + neededNum + " basketballs";
                            window.open('mailto:' + email + '?' + 'subject=' + subject + '&body=' + body);
                        } else {
                            equipmentAlert.style.color = "red";
                            equipmentAlert.innerHTML = "The item you are requesting has not been setup yet";
                        }
                    }).catch(function(error) {
                        equipmentAlert.style.color = "red";
                        equipmentAlert.innerHTML = "There was an error retrieving the information on the item";
                        console.log(error.message);
                    });
                    break;
                case "requestObstacle":
                    break;
                case "requestDumbell":
                    break;
                case "requestUniform":
                    break;
                case "requestJumprope":
                    break;
            };
        } else {
            console.log("Need to setup the email first");
            equipmentAlert.style.color = "red";
            equipmentAlert.innerHTML = "The email for the requests needs to be set up first.";
        }
    })

};

