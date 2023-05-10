process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert')
require('dotenv').config()
const dbConnection = require('../../database/dbConnection')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config');
const res = require('express/lib/response');
const { JsonWebTokenError } = require('jsonwebtoken');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = `DELETE IGNORE FROM meal;`;
const CLEAR_PARTICIPANT_TABLE = `DELETE IGNORE FROM meal_participants_user;`;
const CLEAR_USER_TABLE = `DELETE IGNORE FROM user;`;
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', 'testT2123', '12345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;
const INSERT_USER2 = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test2@test.com', 'testT2123', '22345678', 'test', 'test', true);`;
const INSERT_MEAL = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (1, 1, 1, 1, 1, '2022-05-20 06:36:27', 6, 6.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 1, 'Spaghetti Bolognese', 'Dé pastaklassieker bij uitstek.')`;
const INSERT_MEAL2 = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (2, 0, 0, 0, 0, '2022-06-20 06:36:27', 7, 7.75, 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 2, 'Spaghetti Bolognese 2', 'Dé pastaklassieker bij uitstek 2.')`;
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANT_TABLE + CLEAR_USER_TABLE;

describe("UC-301 Create meal", () => {
    beforeEach((done) => {
            dbConnection.query(
                CLEAR_DB +
                AUTO_INCREMENT_MEAL +
                AUTO_INCREMENT_USER +
                INSERT_USER,
              (err, result) => {
                if (err) {
                  logger.error(err);
                }
                done();
              }
            );
    })

    describe("UC-301-1, Field is missing", () => {
        it("When a required field is missing, a valid error should be returned", (done) => {
           chai
             .request(server)
             .post("/api/meals")
             .set("Authorization","Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
             .set(
               "Authorization",
               "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey)
             )
             .send({
               isActive: 1,
               isVega: 1,
               isVegan: 0,
               // isToTakeHome is missing
               dateTime: "2022-05-20 06:36:27",
               maxAmountOfParticipants: 6,
               price: 6.75,
               imageUrl:
                 "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
               cookId: 1,
               name: "Spaghetti Bolognese",
               description: "Dé pastaklassieker bij uitstek.",
             })
             .end((err, res) => {
                assert.ifError(err)
                res.should.be.a("object");
                let { status, message } = res.body;
                status.should.be.eql(400);
                message.should.be.eql("isToTakeHome cannot be null");
                done();
             })
        })
    })

    describe("UC-301-2, User not logged in", () => {
        it("When a user is not logged in, a valid error should be returned", (done) => {
              chai
                 .request(server)
                 .post("/api/meals")
                 .send({
                isActive: 1,
                isVega: 1,
                isVegan: 0,
                isToTakeHome: 1,
                dateTime: "2022-05-20 06:36:27",
                maxAmountOfParticipants: 6,
                price: 6.75,
                imageUrl:
                  "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                cookId: 1,
                name: "Spaghetti Bolognese",
                description: "Dé pastaklassieker bij uitstek.",
                 })
                 .end((err, res) => {
                 assert.ifError(err)
                 res.should.be.a("object");
                 let { status, message } = res.body;
                 status.should.be.eql(401);
                 message.should.be.eql("Authorization header missing!");
                 done();
                 })
        })
    })

    describe("UC-301-3, Meal created succesfully", () => {
        it("When a meal is created succesfully, a valid response should be returned", (done) => {
            chai
              .request(server)
              .post("/api/meals")
              .set("Authorization","Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
              .send({
                isActive: 1,
                isVega: 1,
                isVegan: 0,
                isToTakeHome: 1,
                dateTime: "2022-05-20 06:36:27",
                maxAmountOfParticipants: 6,
                price: 6.75,
                imageUrl:
                  "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                cookId: 1,
                name: "Spaghetti Bolognese",
                description: "Dé pastaklassieker bij uitstek.",
              })
              .end((err, res) => {
                assert.ifError(err)
                res.should.be.a("object");
                let { status, result } = res.body;
                status.should.be.eql(201);
                result.should.have.property("id");
                result.should.have.property("isActive");
                result.should.have.property("isVega");
                result.should.have.property("isVegan");
                result.should.have.property("isToTakeHome");
                result.should.have.property("dateTime");
                result.should.have.property("maxAmountOfParticipants");
                result.should.have.property("price");
                result.should.have.property("imageUrl");
                result.should.have.property("cookId");
                result.should.have.property("name");
                result.should.have.property("description");
                done();
              })
        })
    })
})