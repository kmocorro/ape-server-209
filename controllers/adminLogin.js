
let formidable = require('formidable');
let jwt = require('jsonwebtoken');
let jwt_secret = require('../config').jwt_secret;
let mysqlApe = require('../config').poolAPE;
let bcrypt = require('bcryptjs');
let salt = bcrypt.genSaltSync(10);

module.exports = function(app){
  app.post('/api/admin-login', (req, res) => {
    
    let fields = req.body;
    console.log(fields);

    if(fields){
      login(fields);
    }

    function login(fields){
      new Promise((resolve, reject) => {
        mysqlApe.getConnection((err, connection) => {
          if(err){reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_admin WHERE username = ?',
            values: [ fields.username ]
          }, (err, results) => {
            if(results.length > 0){
              if(results[0].password){
                let isPasswordCorrect = bcrypt.compareSync(fields.password, results[0].password); // true
                console.log(isPasswordCorrect)
                if(isPasswordCorrect){
                  
                  let token = generateJWT(results[0]);
                  let jsonToken = {token: token};

                  res.json(jsonToken);

                  function generateJWT(results){
                    let token = jwt.sign(
                      {
                        claim: {
                          id: results.id,
                          username: results.username,
                          fullname: results.fullname,
                          status: results.status,
                        }
                      }, 
                      jwt_secret.key
                    );
                    return token;
                  }

                } else {
                  res.status(401).json({status: 'Invalid username/password', message: 'Invalid username/password'});
                }
              }
            } else {
              res.status(401).json({status: 'Invalid username/password', message: 'Invalid username/password'});
            }
          })
        })

      })
    }
  })

  app.post('/api/create-admin', (req, res) => {
    let fields = req.body;
    
    console.log(fields);

    if(fields){
      createAdmin(fields);
    }
  
    function createAdmin(fields){
      new Promise((resolve, reject) => {

        let hashPass = bcrypt.hashSync(fields.password, salt);

        mysqlApe.getConnection((err, connection) => {
          if(err){reject(err)}

          connection.query({
            sql: 'SELECT * FROM ape_admin WHERE username = ?',
            values: [ fields.username ]
          }, (err, results) => {
            if(err){reject(err)}
            if(results.length > 0){
              res.json({status: 'Invalid username', message: 'Username already exists'})
            } else {
              connection.query({
                sql: 'INSERT INTO ape_admin SET dt=?, username = ?, password = ?, fullname= ?, status = ?',
                values: [ new Date(), fields.username, hashPass, fields.fullname, 0 ]
              }, (err, results) => {
                if(err){reject(err)}
                res.json(results);
              })
            }
          })
          connection.release();
        })

      })
    }
  })
}