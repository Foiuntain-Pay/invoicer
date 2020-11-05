/*************************************************************************
ADD LIBRARIES
*************************************************************************/

var config = require('./config');
var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var routes = require("./routes/routes");
var general = require('./controllers/General/general')
var authenticate = require('./controllers/Auth/authentication')

/*************************************************************************
CREATE APP
*************************************************************************/

var app = express()

/*************************************************************************
PARSE JSON
*************************************************************************/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*************************************************************************
ENABLE CORS AND START SERVER
*************************************************************************/

app.use(cors({ origin: true }))
app.listen(config.PORT,async function(){
    console.log("Server started On PORT: "+config.PORT);
    await general.copySettingsFromConfigToDB();
});

//Routes

app.all('*', general.loadSettingsFromDBToLocals, authenticate.isAuthorized);

app.use(routes);