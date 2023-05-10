const dbConnection = require('../../database/dbConnection');
const assert = require("assert");
const res = require('express/lib/response');
const logger = require("../config/config").logger;

let meal = {id: 0,name: "",description: "",imageUrl: "",dateTime: "",ingredients: [],allergyInfo: [],isVega: "",isVegan: "",toTakeHome: "",isActive: "",maxAmountParticipants: "",participants: [],};

let mealController = {

    // validate meal
    validateMeal: (req,res,next) =>{
      let meal = req.body;
      let {name,description,isToTakeHome,imageUrl,price,isVega,isVegan,isActive,dateTime} = meal;
  
      try {
        assert(typeof imageUrl === "string", "ImageUrl must be a string");
        assert(typeof name === "string", "Name must be a string");
        assert(typeof description === "string","Description should be a string!");
        assert(typeof price === "number", "Price must be a number");
        assert(typeof dateTime === "string", "DateTime must be a string");
        assert(isToTakeHome != null, "isToTakeHome cannot be null");
        assert(isVega != null, "isVega cannot be null");
        assert(isVegan != null, "isVegan cannot be null");
        assert(isActive != null, "isActive cannot be null");
        next();
      } catch (err) {
        const error = { status: 400, message: err.message };
        next(error);
      }
    },

    //Use case - 301 maaltijd aanmaken
    addMeal: (req,res,next) => {
      let meal = req.body;
      let cookId = req.userId;
      let price = parseFloat(meal.price);
      logger.debug(meal);
      dbConnection.getConnection(function (err, connection) {
        if (err) throw err;
  
        connection.query(
          `INSERT INTO meal (name, description, price, dateTime, imageUrl, isToTakeHome, isVegan, isVega, isActive, maxAmountOfParticipants, cookId) VALUES ('${meal.name}', '${meal.description}', ${meal.price}, '${meal.dateTime}', '${meal.imageUrl}', ${meal.isToTakeHome}, ${meal.isVegan}, ${meal.isVega}, ${meal.isActive}, ${meal.maxAmountOfParticipants},${cookId});`,
          [meal.dateTime,meal.maxAmountOfParticipants,price,meal.imageUrl,Number(cookId),meal.name,meal.description,meal.isActive,meal.isVega,meal.isVegan,meal.isToTakeHome],
          function (error, results, fields) {
            connection.release();
            if (error) next(error);
            else {
              connection.query(
                "SELECT * FROM meal ORDER BY id DESC LIMIT 1;",
                function (error, results, fields) {
                  results[0].price = price;
  
                  results[0].isActive = meal.isActive ? true : false;
                  results[0].isVega = meal.isVega ? true : false;
                  results[0].isVegan = meal.isVegan ? true : false;
                  results[0].isToTakeHome = meal.isToTakeHome ? true : false;
  
                  if (error) throw error;
  
                  res.status(201).json({
                    status: 201,
                    result: results[0],
                  });
                }
              );
            }
          }
        );
      });
    },

    // use case - 303 Overzicht maaltijden
    getAllMeals: (req,res) => {
      let dbQuery = "SELECT * FROM meal";
      dbConnection.getConnection(function (error, connection) {
        if (error) throw error;
        connection.query(dbQuery, function (error, result, fields) {
          connection.release();
          if (error) throw error;
          logger.debug("result= ", result.length);
          res.status(200).json({
            status: 200,
            result: result,
          });
        });
      });
    },

    // Use case - 304 Details Maaltijd
    getMealId: (req,res) => {
        let mealId = req.params.mealId;
        dbConnection.getConnection(function (err, connection) {
          if (err) throw err;
          connection.query(
            `SELECT * FROM meal WHERE ${mealId} = meal.id`,
            function (err, result, fields) {
              connection.release();
              if (err) next(err);
    
              if (result.length > 0) {
                console.log("Meal " + mealId + ": ", result);
                res.status(200).json({
                  status: 200,
                  result: result,
                });
              } else {
                res.status(404).json({
                  status: 404,
                  result: "Meal does not exist",
                });
              }
            }
          );
        });
    },

    // Use case - 305 Delete meal
    deleteMeal: (req,res) => {
        let mealId = req.params.mealId;

        dbConnection.getConnection(function (err, connection) {
          if (err) throw err;
          connection.query(
            `SELECT * FROM meal WHERE id = ${mealId}`,
            function (err, result, fields) {
              if (err) next(err);
              if (result.length > 0) {
                if (result[0].cookId == req.userId) {
                  connection.query(
                    `DELETE FROM meal WHERE ${mealId} = meal.id`,
                    function (error, result, fields) {
                      connection.release();
                      if (error) throw error;
                      if (result.affectedRows > 0) {
                        console.log("Meal " + mealId + ": ", result);
                        res.status(200).json({
                          status: 200,
                          result: "Meal successfully deleted",
                        });
                      }
                    }
                  );
                } else {
                  res.status(403).json({
                    status: 403,
                    result: "You are not the owner of this meal",
                  });
                }
              } else {
                res.status(404).json({
                  status: 404,
                  result: "Meal does not exist",
                });
              }
            }
          );
    });
    }
}

module.exports = mealController;