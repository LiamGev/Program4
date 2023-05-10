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



describe('UC-202 User overview', () =>{
    describe('UC_202-1 show 0 users', () => {
        beforeEach((done) => {
            dbConnection.getConnection(function (err, connection){
                if(err) throw err
                connection.query(CLEAR_DB, function(error,results,fields){
                    connection.release()
                    if(error) throw error
                    done()
                })
            })
        })
    })

    describe('UC-202-2 show 2 users', () => {
        beforeEach((done) => {
            dbConnection.getConnection(function (err, connection){
                if(err) throw err
                connection.query(CLEAR_DB + INSERT_USER + INSERT_USER2, function(error,results,fields){
                    connection.release
                    if(err) throw err
                    done()
                })
            })
        })

        it('It should return 2 users', (done) => {
            chai.request(server)
            .get("/api/user")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.length.should.be.eql(2);
                done();
        });
    });
    })

    describe("UC-202-3 Show non existing users", () => {
        it('If searchterm has no results, it should return an empty array', (done) => {
            chai.request(server)
            .get("/api/user?firstName=Berlijn")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.length.should.be.eql(0);
                done();
            });
        });
    })

    describe('UC-202-4 Show users where isActive=false', () =>{
        it('response should show users that are not active', (done) => {
            chai.request(server)
            .get("/api/user?isActive=false")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {result.isActive.should.be.eql(false);});
                done();
            });
        });
    })

    describe('UC-202-5 Show users where isActive=True', () => {
        it('response should show users that are active', (done) => {
            chai.request(server)
            .get("/api/user?isActive=true")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {
                    result.isActive.should.be.eql(true);
                }  
            );
            done();
        });
    });
    })

    describe('UC-202-6 Show users based on searchterm', () => {
        it('Based on searchterm, it should return information', (done) => {
            chai.request(server)
            .get("/api/user?firstName=test")
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send()
            .end((err, res) => {
                assert.ifError(err);
                let {status, result} = res.body;
                status.should.equal(200);
                result.should.be.a("array");
                result.forEach(result => {
                    result.firstName.should.be.eql("test");
                }      
            );
            done();
        });
    });
    })
});