const express = require('express');
const { restart } = require('nodemon');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

let database = [];
let id = 0;

app.all('*',(req, res, next) =>{
    const method = req.method;
    console.log(`Method ${method} aangeroepen`);
    next();
})

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        result: 'Hello World!',
    });
});

app.post('/api/user', (req,res,next) =>{
    let user = req.body;
    console.log(user);
    id++;
    user={
        id,
        ...user,
    };
    
    database.push(user);
    console.log(database);
    res.status(201).json({
        status: 201,
        result : database,
    })
});

app.get('/api/user', (req,res)=>{
    res.status(200).json({
        status: 200,
        result: database
    })
})

app.get('/api/user/:userId',(req,res)=>{
    const userId = req.params.userId
    let user = database.filter((item) => item.id==userId);
    if(user.length>0){
        console.log(user);
        res.status(200).json({
            status: 200,
            result: user,
        })
    } else{
        res.status(404).json({
            status: 404,
            result: `User with ID ${userId} not found`,
        })
    }
});

app.put("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
        let user2 = req.body;
      const targetIndex = database.findIndex(f=>f.id == userId)
      database[targetIndex] = user = {
        userId,
        ...user2,
        };
      console.log(user);
      res.status(200).json({
        status: 200,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `user with ID ${userId} not found`,
      });
    }
});
  
  app.delete("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    let user = database.filter((item) => item.id == userId)
    if(user.length > 0){
      const targetIndex = database.findIndex(f=>f.id == userId)
      delete database[userId]
      res.status(200).json({
        status: 200,
        result: "ID deleted"
      })
    } else {
      res.status(401).json({
        status: 401,
        result: `user with ID ${userId} not found`,
      })
    }
  })

app.all('*', (req, res) => {
    res.status(404).json({
        status: 404,
        result: 'End-point not found',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

