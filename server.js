const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var Request = require("request");


//const FileReader = require ('filereader');
    var fs = require('fs');

var app = express();
var upload = require('express-fileupload');

// handle CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const http = require('http');
http.Server(app).listen(5555); // make server listen on port 5555

app.use(upload()); // configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


console.log("Server Started at port 5555..");

/*======================MAIN==============================================*/
app.post('/blockEntires', (req,res) => {
  console.log("============================================");
  _requestContext = null;
  saveFileToFileSys(req,res)
      .then((reqContext) => {
        console.log("\n\nStep 1 Complete: File location: "+ JSON.stringify(reqContext));
          calculateHash(reqContext)
              .then((reqContext)=> {
                console.log("\n\nStep 2 Complete: Calculate Hash: "+ JSON.stringify(reqContext));
                requestContext = reqContext;  
                saveToEth(reqContext).then((msg) => {
                    console.log("\n\nStep 3  Added to Eth" + msg);
                    // saveToMongo(reqContext).then((dbResponse) => {
                    //   console.log("\n\nStep 4  Added to Mongo: " + dbResponse);
                    //   res.setHeader('Content-Type', 'application/json');
                    //   res.send(dbResponse);
                    // })
                })
              })
      })
})


function saveFileToFileSys(req,res)
{
  return new Promise ((resolve, reject)=> {

    console.log("Entering saveFileToFileSys...");
    var gradClass = req.body.gradClass;
    var hsCountry = req.body.hsCountry;
    var hsState = req.body.hsState;
    var highSchoolIdentifier = req.body.highSchoolIdentifier;
    var studentIdentifier = req.body.studentIdentifier;
    var docType = req.body.docType;

    var uploadpath;
    console.log("gradClass ->" + gradClass);
    console.log("hsCountry ->" + hsCountry);
    console.log("hsState ->" + hsState);
    console.log("highSchoolIdentifier ->" + highSchoolIdentifier);
    console.log("studentIdentifier ->" + studentIdentifier);
    console.log("docType ->" + docType);

    let reqContext = {
      "gradClass" : gradClass,
      "hsCountry" : hsCountry,
      "hsState" : hsState,
      "highSchoolIdentifier" : highSchoolIdentifier,
      "studentIdentifier" : studentIdentifier,
      "docType" : docType,
      "fileLocation" : null,
      "fileHash"  : null
    };
  
    if(req.files){
      var uploadedFile = req.files.uploadedFile;
      var uploadedFileName = uploadedFile.name;
      console.log ("Uploaded File Name:"+uploadedFileName);
  
      uploadpath = __dirname + '/uploads/' + reqContext.gradClass+"-"+reqContext.hsCountry+"-"+reqContext.hsState+"-"+reqContext.highSchoolIdentifier+"-" +reqContext.studentIdentifier+"-"+reqContext.docType+"-"+uploadedFileName;
      uploadedFile.mv(uploadpath,function(err){
        if(err){
          console.log("File Upload Failed",uploadedFileName,err);
          reject ("An error has occured while saving the file...");
          //res.send("Error Occured!")
        }
        else {
          console.log("File Name ...",uploadedFileName);
          reqContext.fileLocation = uploadpath;
          console.log("File stored to ...",reqContext.fileLocation);
          console.log("Leaving saveFileToFileSys...");
          resolve (reqContext);
          res.send(uploadpath);
        }
      });
    }
  });
};


function calculateHash(reqContext)
{
  return new Promise ((resolve, reject) => {
    var crypto = require('crypto');
    var hash = crypto.createHash('sha256');
    console.log("Entering calculateHash...");
    var fileHash = null;
    fs.readFile(reqContext.fileLocation, 'utf8', function(err, data) {
      if (err) {
        reject ("Error while calculating hash....");
      }
      var hash = crypto.createHash('sha256');
      fileHash = hash.update(data, 'utf-8');
      genHash= fileHash.digest('hex');
      reqContext.fileHash = genHash;
      console.log("File hash is " + reqContext.fileHash);
      resolve(reqContext);
    });
  });

}

function saveToEth(reqContext)
{
  return new Promise ((resolve, reject) =>
  {
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": "http://localhost:9000/api/ethblock",
      "body": JSON.stringify(reqContext)
//    }, (error, response, body) => {
    }, (error, response, body) => {
    if(error) {
      console.log("Error while saving in Ethereum..." + error);
      reject("Error while saving in Ethereum..." + error);
    }
    else
    {
        console.log("-------SUCCESS: Response from Eth:" + body);
        resolve("-------SUCCESS: Response from Eth:" + body);
    }

  });

  })  

}

// function saveToMongo(reqContext)
// {
//   console.log("Inside saveToMongo. Context is" + reqContext);
//   return new Promise((resolve, reject)=>{
//     var allDocforDocId = [];
//     let _reqContext = reqContext;
//     delete _reqContext.fileHash;
//     //------- Call REST API to save data in MongoDB.
//     Request.post({
//       "headers": { "content-type": "application/json" },
//       "url": "http://localhost:8000/api/dbblock",
//       "body": JSON.stringify(_reqContext)
//     }, (error, response, body) => {
//       if(error) {
//           console.log(error);
//           reject("error occured while saving in MongoDB");
//         }
//       else {
//         //console.log("Response form DB Service -->" + JSON.stringify(response.body));
//         resolve(response.body);
//       }
//   });

//   })
  
// }


function getFileHashFromLocal(requestJson) {
    return new Promise((resolve, reject)=> {
    let err = false;  
    let fileContent = fs.readFileSync(dbResponse.fileLocation, 'utf8');
    let localSha = sha256(fileContent);    
    console.log("\n\nLocal Hash calculating..." + localSha)
    resolve(localSha);
    });
}




  
  

