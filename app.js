
//instructs program to load pre written modules into code express (web app framework)
var express = require("express");

//instructs program to load in "path, the utility to access file paths on our system
var path = require("path");

//Include the body-parser library
var bodyParser = require("body-parser");

//Need this so we can work with csv files
var csv = require("ya-csv");

//creates a web server and saves it as a variable called app
var app = express();

//Configures server to serve files in the current folder directly to the user
//Files are loaded without requiring any explicit code asking them to be loaded
app.use(express.static(path.join(__dirname, "")));

//Asks parser to parse all incoming requests and attach any form data to the request.body by default
// inside a request handler
// Will read form and extract values that we need
app.use(bodyParser.urlencoded({extended:true}));


//HTML files are explicitly loaded into the code
//the "/" means the main page of a web site when no specific page is requested
app.get("/", function(request, response){
    response.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/score", function(request, response){ //handles get request for /score
    var reader = csv.createCsvFileReader("scores.csv"); //creates csv file reader with the name scores.csv

    //name the columns
    reader.setColumnNames(['name', 'email', 'score']);

    //collect all results into an array
    var scores = []
    //for each bit of data read from the file (each line), push it into list of scores
    reader.addListener('data', function(data){
        scores.push(data);
    });

    //when file is finished reader, send the collected results in the reponse
    reader.addListener('end', function(){
        response.send(scores);

    })
});

app.post('/score', function(request, response){

    //Fetch the name, email and score from the form
    var name = request.body.fullName;
    var email = request.body.email;
    var score = request.body.score;

    if(isEmpty(name)){
        response.send("Please make sure you enter your name");
    }

    //opens a csv file called scores.csv. The flag a is for appending
    var database = csv.createCsvFileWriter("scores.csv", {"flags": "a"});
    //we will have 3 columns in the csv file containing the name, email and score of the player
    var data = [name, email, score];

    //writes data to the csv file
    database.writeRecord(data);

    //close the file score.csv so the result is immeditaley written to it
    database.writeStream.end();

    //send a reply to show the csv file was written to successfully
   response.send("Thanks " + name + ", your score has been recorded!!");
});

//Start server
//Telling express to listen fot new connections on port 8080 (web page port)
var server = app.listen(8080, function() {

    //Can also print out info about web server...
    var host = server.address().address; //The address
    var port = server.address().port; //the port number it listens for connections on

    console.log("Bob's Flappy Bird listening at http://%s:%s", host, port);
});

function isEmpty(str) {
    return (!str || 0 === str.length);
}
