/*************************************************************************
ADD LIBRARIES
*************************************************************************/

import config from './config/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import general from './controllers/General/general';
import {isAuthorized} from './controllers/Auth/authentication';

/*************************************************************************
CREATE APP
*************************************************************************/

const app: any = express()

const loggerMiddleware: any = (req: express.Request, res: express.Response, next: any) => {
    console.log(`${req.method} ${req.path}`);
    next();
}

app.use(loggerMiddleware);

/*************************************************************************
PARSE JSON
*************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*************************************************************************
ENABLE CORS AND START SERVER
*************************************************************************/

app.use(cors({ origin: true }))
app.listen(config.PORT,async function(){
    console.log("Server started On PORT: "+config.PORT);
});

//Routes

app.all('*', isAuthorized);

app.use(routes);