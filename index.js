const request = require('request-promise');
const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

//Url to load all the data from
const url ="https://www.cheatsheet.com/gear-style/20-questions-to-ask-siri-for-a-hilarious-response.html/";

//IFTTT WEBHOOK URL
var webhook = 'https://maker.ifttt.com/trigger/RandomQuestion/with/key/bqwO1uxzi5Z_HVj6-tzJ1w';

const scrapeResults = [];

//This function scrapes h2 element data and pushes into the scrapeResults array then returns scrapeResults
async function scrapeQuestions(){
    try {
        const htmlResult = await request.get(url);
        const $ = await cheerio.load(htmlResult);
        $('h2', htmlResult).each(function() {
            const Questions = $(this).text();
            // console.log(Question);
            
            const scrapeResult = { Questions };
            scrapeResults.push(scrapeResult);
          });

        //   return console.log(scrapeResults.length);
          return scrapeResults;
          
    } catch(err){
        console.log(err);
    }
       
}

// This funtion creates a CSV file
async function createCsvFile(data) {
    let csv = new ObjectsToCsv(data);
  
    // Save to file:
    await csv.toDisk("./questions.csv");
  }

// This function generates a single random question from the scrapped data and emails it using webhooks services
async function EmailRandomQuestion(){
    const Questions = await scrapeQuestions();
    const random = Math.floor(Math.random() * Questions.length);
    
    var headers = {
      'Content-Type': 'application/json'
    };
  //As the post request accepts only string or buffer, The random selected element is converted into a string.
    var jsonStr = JSON.stringify(Questions[random]);
    jsonStr = jsonStr.replace("Questions","value1");
    
    // for testing purpose
    console.log("The question generated : " + jsonStr + " has been sent.");
      
    var options = {
        url: webhook,
        method: 'POST',
        headers: headers,
        body: jsonStr

    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        }
    }

    request(options, callback);
}

// This funtion calls createCscFile and parses date into it  
async function scrapeData() {
    const Questions = await scrapeQuestions();
    await createCsvFile(Questions);
  }

scrapeData();
EmailRandomQuestion();











