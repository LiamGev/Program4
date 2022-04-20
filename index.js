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

app.post('/api/meal', (req,res,next) =>{
    let meal = req.body;
    console.log(meal);
    id++;
    meal={
        id,
        ...meal,
    };
    
    database.push(meal);
    console.log(database);
    res.status(201).json({
        status: 201,
        result : database,
    })
});

app.get('/api/meal', (req,res)=>{
    res.status(200).json({
        status: 200,
        result: database
    })
})

app.get('/api/meal/:mealId',(req,res)=>{
    const mealId = req.params.mealId
    let meal = database.filter((item) => item.id==mealId);
    if(meal.length>0){
        console.log(meal);
        res.status(200).json({
            status: 200,
            result: meal,
        })
    } else{
        res.status(404).json({
            status: 404,
            result: `Movie with ID ${mealId} not found`,
        })
    }
});

app.all('*', (req, res) => {
    res.status(404).json({
        status: 404,
        result: 'End-point not found',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

