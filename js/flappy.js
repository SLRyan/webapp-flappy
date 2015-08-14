// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);

//Global variable for score. Can be used in all functions
var score = -2;

var labelScore;

var player ;

var pipes = [];
var gameOverText;

var mice = [];

var yarns = [];

var width = 790;
var height = 400;
var gameSpeed = 200;
var gameGravity = 250;
var jumpPower = -150;
var pipeGap = 50;

//Size in px of the gap between the 2 ends of the pipe
var gapSize = 50;

//Mim distance between gap and the border of the screen
var gapMargin = 50;

//height of a single block of pipe
var blockHeight = 50;



//Define event handler with ID #greeting-form
//event_details is an object that contain details of the event (when, where mouse was clicked etc)
jQuery("#greeting-form").on("submit", function(event_details){ //On a submit event (OK Button pressed) run function

    event_details.preventDefault();
    jQuery.ajax({url : '/score', type : 'post', data : $("#greeting-form").serialize()});

    var greeting = "Hello ";
    var name = jQuery("#fullName").val(); //Finds HTML elements with that id. Takes the value of that element
    //(the users name)
    var email = $("#email").val(); //gets the email the user entered
    var score = $("#score").val();//gets the users current score

    //combines all the variables of user input and displays a greeting message
    var greeting_message = greeting + name + "(" + email + ")" + ": " + score;
    jQuery("#greeting-form").fadeOut(); //selects form with id greeting-form and hides it (the inpuy box and stuff)
    //fadeOut means that the forms will slowly fade out and be replaced by the text

    //selects div with id greeting
    //jQuery("#greeting").append("<p>" + greeting_message + "</p>"); //adds para with greeting message after it
    jQuery("#greeting").hide();

    location.reload();
});



/*
 * Loads all resources for the game and gives them names.
 */
//Called once at the beginning to load resources
function preload() {

    //Makes the james bond image available to the game
    //playerImage is the name associated with the image that can be found in the file ../assets etc
    game.load.image("playerImg", "../assets/Kitty.png");

    game.load.audio("score", "../assets/point.ogg");

    game.load.image("pipe", "../assets/pipe_purple.png");

    game.load.image("mouse", "../assets/Mouse.png");

    game.load.image("yarn", "../assets/yarn.png");

    game.load.image("Cats", "../assets/Background.jpg");

}

/*
 * Initialises the game. This function is only called once.
 */
//Called after preload.
function create() {

    //Starts the phaser physics engine to deal with gravity and velocity
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.image(0, 0, "Cats");

    //Can only initialise player after preload because preload makes the image available to the game
    //will display player on screen
    player = game.add.sprite(100, 200, "playerImg");

    //This enables game physics for the player sprite
    game.physics.arcade.enable(player);

    player.body.gravity.y = gameGravity;

    //stes anchor that allows the sprite to rotate around a certain point (the middle)
    player.anchor.set(0.5, 0.5);

    labelScore = game.add.text(20, 20, "0");

    //gameOverText = game.add.text(200, 70, "Game over! Your score was: " + score);

    // set the background colour of the scene

    //Sets the background colour for the game window
    //Uses hex code
    game.stage.setBackgroundColor("#47A3FF");

    //Displays text on screen to user. First 2 arguments specify x and y co ordinates of the text.
   // game.add.text(230, 20, "Welcome to the game",
        //Sets the font. size and colour of the text
       // {font: "30px Arial", fill: "#FFFFFF"});


    //First 2 arguments specify the location we want the image to appear on screen
    //Last argument specifies what image will be associated with the sprite
    //game.add.sprite(350, 80, "playerImg");




    game.input.keyboard.addKey(Phaser.Keyboard.D)
        .onDown.add(function () {
            player.body.velocity.x = 100;
        });

    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(function () {
            player.body.velocity.y = jumpPower;
        });

    pipeInterval = 1.75;
game.time.events

    //determines the rate at which pipes are generated
    .loop(pipeInterval * Phaser.Timer.SECOND,
    generate); //associates loop with generatePipe function


}

/*
 * This function updates the scene. It is called for every new frame.
 */
//Called last. Called for each frame in the game and is used for actions
function update() {

    for(var index = 0; index<pipes.length; index++){
        game.physics.arcade

            //shows we are looking to see if the player and pipes overlap (occupy same space on canvas)
            //if they do overlap, the gameOver function is called
            .overlap(player, pipes[index], gameOver);
    }

    if(player.y > 400){
        //game.add.text(50, 50, "You died! Your score was: " + score);

        gameOver();
    }

    if(player.y < 0) {
        gameOver();
    }

    //Rotates player according to their speed
    //atan function expects the ratio of vertical speed (vel.y) and horizontal (200) speed
    //It then returns the angle
    player.rotation = Math.atan(player.body.velocity.y / gameSpeed);

    //goes backwards through the array
    for(var i = yarns.length - 1; i >= 0; i--){
        game.physics.arcade.overlap(player, yarns, function () { //detects collisions

            //jumpPower = -300;
            gameGravity = -50;
            yarns[i].destroy();
            yarns.splice(i, 1);
        });
    }

    for(var i = mice.length - 1; i >= 0; i--){
        game.physics.arcade.overlap(player, mice, function () { //detects collisions

            gameGravity = 150;
            mice[i].destroy();
            mice.splice(i, 1);
        });
    }

}

function clickHandler(e){
    //alert function returns a message on screen to the user when something has been clicked
//alert("The position is " + event.x + "," + event.y);
    game.add.sprite(e.x, e.y, "playerImg");


}

function changeGravity(g){

    //changes value stored in globak varaible
    gameGravity += g;

    //syncronise player's gravity with new value
    player.body.gravity.y = gameGravity;
}

function changeScore(){
    score++;
    labelScore.setText(score.toString());
}


function generateYarn(){

    var bonus = game.add.sprite(width, height, "yarn");
    yarns.push(bonus);
    game.physics.enable(bonus);
    bonus.body.velocity.x = - 200;

    //gives the yarns a random speed
    bonus.body.velocity.y = - game.rnd.integerInRange(60, 100);

}

function generateMice(){
    var slows = game.add.sprite(width, 0, "mouse");
    mice.push(slows);
    game.physics.enable(slows);
    slows.body.velocity.x = - 200;

    //gives the yarns a random speed
    slows.body.velocity.y = game.rnd.integerInRange(60, 100);

}

function generate(){

    var dice = game.rnd.integerInRange(1, 5);
    if(dice == 1){
        generateYarn();
    }
    else if( dice == 2){
        generateMice();
    }
    else{
        generatePipe();
    }
}
function generatePipe() {
    var gapStart = game.rnd.integerInRange(50, height - 50 - pipeGap);

//addPipeEnd(width-5, gapStart - 25);
    for(var y=gapStart - 75; y>-50; y -= 50){
        addPipeBlock(width,y);
    }

   // addPipeEnd(width-5, gapStart + pipeGap);
    for(var y=gapStart + pipeGap + 25; y<height; y += 50){
        addPipeBlock(width,y);
    }

    changeScore();
}

function addPipeEnd(x, y){
    var block = game.add.sprite(x, y, "pipeEmd");
    pipes.push(block);
    game.physics.arcade.enable(block);
    block.body.velocity.x = - gameSpeed;
}

function addPipeBlock(x,y){
    //create a new pipe block

    var block = game.add.sprite(x,y,"pipe");

    //insert it into the array

    pipes.push(block);

    game.physics.enable(block);
    block.body.velocity.x = -gameSpeed;
}

function gameOver(){

    //stops the game
    score = 0;
    gameGravity = 200;


    //Finds the score element of the form with the id (#) and sets its value to that of the global score variable
    //when the person has lost the game
    $("#score").val(score.toString());
    $("#greeting").show();
    game.destroy();
}

//jQuery's method to get data from a provided address
$.get("/score", function(scores){
    //sorts items in an array so they are in order. Fucntion specifies how to compare the scores
    scores.sort(function (scoreA, scoreB){
        //Difference is only positive if the seconf score is better than the first. Way to compare scores
        var difference = scoreB.score - scoreA.score;

        //sends value of var difference back to the sorting function
        return difference;
    });
    for(var i = 0; i < scores.length; i++){ //iterate through all the scores

        //add the name and scores as a new list item to the scoreBoard
        $("#scoreBoard").append(
            "<li>" +
                scores[i].name + ": " + scores[i].score +
                "</li>");
    }
});
