// 
require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var readline = require("readline");
var fs = require("fs");

// ===============================================
// ***********************************************
//        Method and Function shortcut vars     
// ***********************************************
// ===============================================

var cl = console.log;
var rdln = readline.createInterface(process.stdin, process.stdout);


// =============================
// *****************************
//        Search Function       
// *****************************
// =============================

function startSearch(type, search) {

    switch (type) {

        case "c":
            concerts(search);
            break;


        case "s":
            songs(search);
            break;


        case "m":
            movies(search);
            break;


        case "r":
            fileText(search);
            break;
    }
};

// ====================================
// ************************************
//        Search Prompt Function       
// ************************************
// ====================================

var input = {
    type: "",
    search: [],
};


var promptUser = `\nLooking for something?
\nTo begin your search enter the letter or term to select ONE of the categories below:
\nc - concert-this,
\ns - spotify-this-song,
\nm - movie-this,
\nr - do-what-I-say\n\n`;

rdln.question(promptUser, function (userResponse) {

    input.type = userResponse.trim();

    if (input.type === "r" || input.type === "do-what-I-say") {
        rdln.close();
        fileContent();

    } 
    
    else {
        if (input.type === "c" || input.type === "concert-this") {
            rdln.setPrompt("\nPlease enter artist or band name.\n\n");
        } else if (input.type === "s" || input.type === "spotify-this-song") {
            rdln.setPrompt("\nPlease enter song title.\n\n");
        } else if (input.type === "m" || input.type === "movie-this") {
            rdln.setPrompt("\nPlease enter movie title.\n\n");
        }

        rdln.prompt();

        rdln.on("line", function (userResponse2) {
            input.search.push(userResponse2.trim());
            startSearch(input.type, input.search[0]);
            rdln.close();
        });
    }
});


// =================================================
// *************************************************
//        Bandsintown Concert Finder Function       
// *************************************************
// =================================================

var bitId = "codingbootcamp"

function concerts(artist) {
    axios.get(`https://rest.bandsintown.com/artists/${artist}/events?app_id=${bitId}`)
        .then(function (response) {

            var results = response.data;

            for (var i = 0; i < results.length; i++) {

                if (results[i].venue.country === "United States") {

                    cl(`\n*************************************
                    \nLocation ${i+1}- In the United States
                    \n-------------------------------------
                    \nVenue Name: ${results[i].venue.name}
                    \nVenue Location: ${results[i].venue.city}, ${results[i].venue.region}
                    \nEvent Date: ${moment(results[i].datetime).format('L')}
                    \n*************************************
                    \n`);

                } else if (results[i].venue.country !== "") {

                    cl(`\n******************************************
                    \nLocation ${i+1}- Outside the United States
                    \n------------------------------------------
                    \nVenue Name: ${results[i].venue.name}
                    \nVenue Location: ${results[i].venue.city}, ${results[i].venue.country}
                    \nEvent Date: ${moment(results[i].datetime).format('L')}
                    \n******************************************
                    \n`);

                }
            }
        });
};


// ==========================================
// ******************************************
//        Spotify Song Finder Function
// ******************************************
// ==========================================

function songs(song) {

    (song === "") ? song = "All These Things That I've Done" : song;

    spotify.search({ type: 'track', query: song, limit: 1 }, function (err, data) {
        if (err) {
            cl(err);
        }

        var results = data.tracks.items[0];

        cl(`\n---------------------------------`);
        cl(`Artist: ${results.artists[0].name}`);
        cl(`Song: ${song.charAt(0).toUpperCase() + song.slice(1)}`);
        cl(`Preview Link: ${results.preview_url}`);
        cl(`Album: ${results.album.name}`);
        cl(`----------------------------------`);

    });
};


// ========================================
// ****************************************
//        OMDB Movie Finder Function
// ****************************************
// ========================================

function movies(movie) {

    (movie === "") ? movie = "Mr.Nobody" : movie;

    axios.get(`http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`)
        .then(function (response) {
            var results = response.data;

            function movieInfo() {
                cl(`\n=================================
                \n*********************************
                \nMovie Title: ${results.Title}
                \n*********************************
                \n=================================
                \nYear Released: ${results.Year}
                \nMovie Cast: ${results.Actors}
                \n=================================
                \n*********************************
                \nMovie Plot: ${results.Plot}
                \n*********************************
                \n=================================
                \nRotten Tomatoes Rating: ${results.Ratings[1].Value}
                \nCountry of Production: ${results.Country}
                \nMovie Language: ${results.Language}`);
            }

            if (movie !== "Mr.Nobody") {
                movieInfo();

            }

            else {
                cl("`\n================================='\n*********************************\nYou forgot to enter a movie name.\n*********************************\n=================================\nIf you haven't watched 'Mr. Nobody', then you should: https://www.imdb.com/title/tt0485947/.\nIt's on Netflix");
                
                movieInfo();
            }
        });
};

// ===========================
// ***************************
//        Text Function       
// ***************************
// ===========================

function fileContent() {

    fs.readFile("random.txt", "utf8", function (error, content) {
        if (error) {
            return (error);
        }
        var contentArr = content.split(",");
        runSearch(contentArr[0].trim(), contentArr[1].trim());
    });
}