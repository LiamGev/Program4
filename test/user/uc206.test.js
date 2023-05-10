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


describe('UC-206 Delete user', () => {
    beforeEach((done) => {
        dbConnection.query(
            CLEAR_DB +
            CLEAR_MEAL_TABLE +
            CLEAR_USER_TABLE +
            CLEAR_PARTICIPANT_TABLE +
            AUTO_INCREMENT_MEAL +
            AUTO_INCREMENT_USER +
            AUTO_INCREMENT_PARTICIPANTS +
            INSERT_USER +
            INSERT_USER2,
          (err, result) => {
            if (err) {
              logger.error(err);
            }
            done();
          }
        );
      });

    describe('UC-206-1 User does not exist', () => {
        it('if user doesnt exist, error should be returned', (done) => {
            chai.request(server)
            .delete('/api/user/20000')
            .set('authorization', 'Bearer ' + jwt.sign({userId: 1}, jwtSecretKey))
            .end((err,res) =>{
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(404)
                result.should.be.a('String').that.equals('User does not exist')
                done()
            })
        })
    })

    describe('UC-206-2 Not logged in', () => {
        it('If not logged in, error should be returned', (done) => {
            chai.request(server)
            .delete('/api/user/1')
            .set('authorization', 'Bearer' + jwt.sign({userId: 1}, jwtSecretKey))
            .end((err, res) => {
                res.should.be.an('object')
                let{status, message} = res.body
                status.should.equals(401)
                message.should.be.a('String').that.equals('Not authorized')
                done()
            })
        })
    })

    describe('UC-206-3 Actor is not an Owner', () =>{
        it('If actor is not an owner, error should be returned', (done) =>{
            chai.request(server)
            .delete('/api/user/2')
            .set('authorization', 'Bearer ' + jwt.sign({userId:1}, jwtSecretKey))
            .end((err,res) =>{
                res.should.be.an('object')
                let {status, message} = res.body
                status.should.equals(403)
                message.should.be.a('String').that.equals('User is not the owner')
                done()
            })
        })
    })

    describe('UC-206-4 User deleted succesfully', () =>{
        it('If user is succesfully deleted, confirmation should be returned', (done) =>{
            chai.request(server)
            .delete('/api/user/1')
            .set('authorization', 'Bearer ' + jwt.sign({userId: 1}, jwtSecretKey))
            .end((err,res) => {
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(200)
                result.should.be.a('String').that.equals('User with ID 1 deleted successfuly!')
                done();
            })
        })
    })

})