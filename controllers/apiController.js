let verifyToken = require('./verifyToken');
let formidable = require('formidable');
let XLSX = require('xlsx');
let mysql = require('../config').pool;
let moment = require('moment');
let mysqlAPE = require('../config').poolAPE;
let mysqlMaxeon = require('../config').poolMaxeon;

module.exports = function(app){

  app.post('/api/checkstatus', (req, res) => {
    let employee_number = req.body.employee_number;
    //console.log(employee_number)
    if(employee_number){
      checkAPEstatus(employee_number);
    }

    function checkAPEstatus(employee_number){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee_flow WHERE employee_number = ?',
            values: [ employee_number ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length>0){
              res.json({
                employee_number: employee_number,
                flow: results
              });
            }else{
              res.json({
                employee_number: employee_number,
                flow: results
              });
            }
          })
          connection.release();
        })
      })
    }
  })

  app.post('/api/employee', verifyToken, (req, res) => {
    let fields = req.claim;
    console.log(fields);
    
    if(fields.employeeNumber){
      isRegistered(fields).then((results) => {
        if(results.length>0){
          checkAPEstatus(fields);
        }else{
          registerEmployee(fields).then(() => {
            checkAPEstatus(fields);
          })
        }
      })
    }

    function isRegistered(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee WHERE employee_number =?',
            values: [fields.employeeNumber]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results)
            }
          })
          connection.release();
        })
      })
    }

    function registerEmployee(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'INSERT INTO ape_employee SET dt=?, employee_number=?, flow_id=?',
            values: [ new Date(), fields.employeeNumber, 0 ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length>0){
              resolve(results)
            }
          })
          connection.release();
        })
      })
    }

    function checkAPEstatus(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee_flow WHERE employee_number = ?',
            values: [ fields.employeeNumber ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length>0){
              res.json({
                profile: fields,
                flow: results
              });
            }else{
              res.json({
                profile: fields,
                flow: results
              });
            }
          })
          connection.release();
        })
      })
    }

  })

  app.post('/admin/employee', (req, res) => {
    let fields = req.body;
    console.log(fields);
    
    if(fields.employee_number){
      isRegistered(fields).then((results) => {
        if(results.length>0){
          checkAPEstatus(fields);
        }else{
          registerEmployee(fields).then(() => {
            checkAPEstatus(fields);
          })
        }
      })
    }

    function isRegistered(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee WHERE employee_number =?',
            values: [fields.employee_number]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results)
            }
          })
          connection.release();
        })
      })
    }

    function registerEmployee(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'INSERT INTO ape_employee SET dt=?, employee_number=?, flow_id=?',
            values: [ new Date(), fields.employee_number, 0 ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length>0){
              resolve(results)
            }
          })
          connection.release();
        })
      })
    }

    function checkAPEstatus(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee_flow WHERE employee_number = ?',
            values: [ fields.employee_number ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length>0){
              res.json({
                profile: fields,
                flow: results
              });
            }else{
              res.json({
                profile: fields,
                flow: results
              });
            }
          })
          connection.release();
        })
      })
    }

  })

  app.post('/api/iscohen', verifyToken, (req, res) => {
    let fields = req.claim;

    if(fields){
      isCohen(fields);
    }

    function isCohen(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_cohen WHERE employee_number = ?',
            values: [fields.employee_number]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length > 0){
              res.json({cohen: 'completed'})
            } else {
              res.json({cohen: 'no'});
            }
          });
          connection.release();
        })
      })
    }
  })

  app.post('/api/cohen', (req, res) => {
    let fields = req.body;
    if(fields.employee_number){
      isCohen(fields).then(() => {
        insertCohen(fields).then((data) => {
          
          console.log(data, fields);
          updateCohenFlowComplete(fields).then((data) => {
            res.json('success');
          }, (err) => {
            res.json('failed');
          })
        }, (err) => {
          res.json('failed');
        })
      }, (err) => {
        res.json('failed');
      })
    }

    function isCohen(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_cohen WHERE employee_number = ?',
            values: [fields.employee_number]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results.length > 0){
              res.json('completed')
            } else {
              resolve(results)
            }
          });
          connection.release();
        })
      })
    }

    function insertCohen(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'INSERT INTO ape_cohen SET dt=?, employee_number=?, b1=?, b2=?, b3=?, b6=?, b9=?, b10=?, b4=?, b5=?, b7=?, b8=?, a1=?, a2=?, a3=?, a4=?, a5=?, a6=?, a7=?, d1=?, d2=?, d3=?, d4=?, d5=?, d6=?, d7=?',
            values: [new Date(), fields.employee_number, fields.b1, fields.b2, fields.b3, fields.b6, fields.b9, fields.b10, fields.b4, fields.b5, fields.b7, fields.b8, fields.a1, fields.a2, fields.a3, fields.a4, fields.a5, fields.a6, fields.a7, fields.d1, fields.d2, fields.d3, fields.d4, fields.d5, fields.d6, fields.d7]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results);
            }
          });
          connection.release();
        })
      })
    }

    function updateCohenFlowComplete(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            // status = 1 means complete.
            // flow_id = 8 means COHEN/hads
            sql: 'UPDATE ape_employee_flow SET status=1 WHERE flow_id = 8 AND employee_number =?',
            values: [ fields.employee_number ]
          }, (err, results) => {
            if(err){reject(err)}
            if(results){
              resolve(results);
            }
          });
          connection.release();
        })
      })
    }

  })

  app.post('/api/add-employee-flow', (req, res) => {
    let fields = req.body
    if(fields.employee_number){
      let serverResponse = [];
      for(let i=0;i<fields.flow_id.length;i++){
        checkEmployeeFlowIfExists(fields.flow_id[i], fields.employee_number).then((results) => {
          if(results.length > 0){
            // walang gagawin
          } else {
            insertEmployeeFlow(fields.flow_id[i], fields.employee_number).then((results) => {
              
              serverResponse.push(results)

              if(i === fields.flow_id.length - 1){
                console.log(serverResponse);
                res.json(serverResponse)
              }
            });
          }
        })
      }
    }

    function checkEmployeeFlowIfExists(flow_id, employee_number){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'SELECT * FROM ape_employee_flow WHERE employee_number = ? AND flow_id = ?',
            values: [ employee_number, flow_id ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results);
            }
          })
          connection.release();
        })
      })
    }

    function insertEmployeeFlow(flow_id, employee_number){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'INSERT INTO ape_employee_flow SET dt =?, employee_number = ?, flow_id =? , status = ?',
            values: [ new Date(), employee_number, flow_id, 0 ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results);
            }
          })
          connection.release();
        })
      })
    }

  })

  app.post('/api/station', (req, res) => {
    let fields = req.body;
    if(fields.employee_number){
      console.log(fields);
      updateStationComplete(fields)
    }
    
    function updateStationComplete(fields){
      return new Promise((resolve, reject) => {
        mysqlAPE.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            // status = 1 means complete.
            sql: 'UPDATE ape_employee_flow SET status=1 WHERE flow_id = ? AND employee_number =?',
            values: [ fields.flow_id, fields.employee_number ]
          }, (err, results) => {
            if(err){reject(err)}
            if(results){
              res.json(results);
            }
          });
          connection.release();
        })
      })
    }

  })

  // CWW
  app.post('/api/cww', (req, res) => {

    let fields = req.body;
    if(fields.employee_number){
      console.log(fields);
      insertCWW(fields).then((results) => {
        res.status(200).json({success: results});
      }, (err) => {
        res.status(401).json({err: err});
      });
    }

    function insertCWW(fields){
      return new Promise((resolve, reject) => {
        mysqlMaxeon.getConnection((err, connection) => {
          if(err){return reject(err)}
          connection.query({
            sql: 'INSERT INTO hr_cww SET dt =?, employee_number =? , decision =?, status=?',
            values: [ new Date(), fields.employee_number, fields.decision, 1 ]
          }, (err, results) => {
            if(err){return reject(err)}
            if(results){
              resolve(results)
            }
          })
          connection.release()
        })
      })
    }
  })
}