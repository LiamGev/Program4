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

describe('Login Testing /auth/login', () => {

    beforeEach((done) => {
        dbConnection.query(
            CLEAR_DB   +
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
      });

    describe('UC-101-1 Required field missing', () =>{
        it("If missing required field, an error should be returned", (done) => {
            chai.request(server)
            .post('/api/auth/login')
            .send({
                password:'secret'
            })
            .end((err,res) => {
                res.should.be.an('object')
                let {message, status} = res.body
                status.should.equals(400)
                message.should.be.a('string').that.equals('A required field is missing.')
                done();
            })
        })
    })

    describe('UC-101-2 invalid email', () => {
        it('if email missing, an error should be returned', (done) => {
            chai.request(server)
            .post('/api/auth/login')
            .send({
                emailAdress: "a",
                password: 'secret'
            })
            .end((err, res) => {
                res.should.be.an('object')
                let {status, message} = res.body
                status.should.equals(400)
                message.should.be.a('string').that.equals('Email is invalid')
                done()
            })
        })
    })

    describe('UC-101-3 Invalid password', () => {
        it('if password is invalid, an error should be returned', (done) =>{
            chai.request(server)
            .post('/api/auth/login')
            .send({
                emailAdress: 'j.doe@server.com',
                password: "a"
            })
            .end((err,res) => {
                res.should.be.an('object')
                let {status, message} = res.body
                status.should.equals(400)
                message.should.be.a('string').that.equals('Password must contain 8-15 characters which contains at least one lower- and uppercase letter, one special character and one digit')
                done()
            })
        })
    })

    describe('UC-101-4 User does not exist', () => {
        it('If user does not exist, an error should be returned', (done) => {
            chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "test2123123123@test.com",
          password: "testT2112312329",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.be.a("object");
          let { status, message } = res.body;
          status.should.be.eql(404);
          message.should.be.eql("User not found or password invalid");
          done();
        });
        })
    })
    describe("TC-101-5: user logged in succesfully", () => {
        it("When a user logs in succesfully, a valid token should be returned", (done) => {
          chai
            .request(server)
            .post("/api/auth/login")
            .send({
              emailAdress: "test@test.com",	
              password: "testT2123",
            })
            .end((err, res) => {
              assert.ifError(err);
              res.should.be.a("object");
              let { status, results } = res.body;
              status.should.be.eql(201);
              results.should.have.property("id");
              results.should.have.property("firstName");
              results.should.have.property("lastName");
              results.should.have.property("emailAdress");
              results.should.have.property("token");
              done();
            });	
        });
      });

})


