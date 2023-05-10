const express = require('express');
const mealRouter = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// add meal
mealRouter.post("/meals", authController.validateToken, mealController.validateMeal, mealController.addMeal)

// get all meals
mealRouter.get("/meals", authController.validateToken, mealController.getAllMeals)

// get meal by ID
mealRouter.get("/meals/:mealId", authController.validateToken, mealController.getMealId)

// delete meal
mealRouter.delete("/meals/:mealId", authController.validateToken, authController.validateOwnership, mealController.deleteMeal)

module.exports = mealRouter;
