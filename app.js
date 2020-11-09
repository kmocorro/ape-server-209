const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const corsOrigins = require('./config').corsOrigins;

const apiLDAP = require('./controllers/apiLdap');
const adminLogin = require('./controllers/adminLogin');
const apiController = require('./controllers/apiController');
 
const app = express();
const port = process.env.PORT || 8787;

app.use(cookieParser());
app.use(cors());
app.options('*', cors());

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('combined'));

app.use('/', express.static(__dirname + '/public'));

apiLDAP(app);
adminLogin(app);
apiController(app);

app.listen(port, () => {
    console.log('listening to port ' + port);
});
