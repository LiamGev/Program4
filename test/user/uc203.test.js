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
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANT_TABLE + CLEAR_USER_TABLE;
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', 'testT2123', '0612345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;
const INSERT_USER2 = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test2@test.com', 'testT2123', '0622345678', 'test', 'test', true);`;


describe('UC-203 Get user Profile', () =>{
    beforeEach((done) => {
        dbConnection.getConnection(function (err, connection){
            if(err) throw err
            connection.query(AUTO_INCREMENT_MEAL, (error,result,fields) =>{
                connection.query(AUTO_INCREMENT_USER, function(error, results,fields){
                    connection.query(CLEAR_DB + INSERT_USER, function(error,results,fields){
                        connection.release()
                        if(error) throw error
                        done();
                    })
                })
            })
        })
    })

    describe('UC-203-1 Invalid Token', () => {
        it('If token is invalid, an error should be returned', (done) => {
            chai.request(server)
            .get('/api/user/profile')
            .set('authorization', 'Bearer' + jwt.sign({userId: 1}, 'abc'))
            .end((err,res) => {
                res.should.be.an('object')
                let{status, message} = res.body
                status.should.equals(401)
                message.should.be.a('string').that.equals("Not authorized")
                done()
            })
        })
    })

    describe('UC-203-2 Valid token / Valid Profile', () => {
        it('If token and profile are valid, response should return the information', (done) => {
            chai.request(server)
            .get('/api/user/profile')
            .set("Authorization","Bearer " + jwt.sign({ userId: 2 },jwtSecretKey))
            .send({})
            .end((err, res) => {
              assert.ifError(err);
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.be.eql(200);
              result.should.be.an("object");
              result.should.have.property("id");
              result.should.have.property("firstName");
              result.should.have.property("lastName");
              result.should.have.property("emailAdress");
              result.should.have.property("password");
              result.should.have.property("phoneNumber");
              result.should.have.property("street");
              result.should.have.property("city");
              result.should.have.property("isActive");
              done();
            });
              
        })
    });
})