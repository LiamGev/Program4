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
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANT_TABLE + CLEAR_USER_TABLE;
const INSERT_USER = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test@test.com', 'testT2123', '0612345678', 'test', 'test', true);`;
const AUTO_INCREMENT_USER = `ALTER TABLE user AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_MEAL = `ALTER TABLE meal AUTO_INCREMENT = 1;`;
const AUTO_INCREMENT_PARTICIPANTS = `ALTER TABLE meal_participants_user AUTO_INCREMENT = 1;`;
const INSERT_USER2 = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city, isActive) VALUES ('test', 'test', 'test2@test.com', 'testT2123', '0622345678', 'test', 'test', true);`;



describe("User Controller /api/user", () =>{
    describe('UC-201 Register User', () =>{
        beforeEach((done) => {
            dbConnection.getConnection(function (err, connection){
                if(err) throw err
                connection.query(AUTO_INCREMENT_USER, (error,result,fields) =>{
                    connection.query(CLEAR_DB + INSERT_USER, function(error,result,fields){
                        connection.release()
                        if(error) throw error
                        done()
                    })
                })
            })
        })
    })

    describe('UC-201-1 Required Field Missing', () => {
        it('If required field Missing, an error should be returned', (done) => {
            chai.request(server)
            .post('/api/user')
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                lastName: "LaatsteNaam",
                isActive: 1,
                emailAdress: "email.test@server.com",
                password: "TestPass123!",
                phoneNumber: "0613884422",
                street: "straatnaam123",
                city: "stadnaam123"
            })
            .end((err,res) => {
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(400)
                result.should.be.a('string').that.equals('First name is required')
                done()
            })
        })
    })

    describe('UC-201-2 Invalid Email', () => {
        it('If email is invalid, an error should be returned', (done) => {
            chai.request(server)
            .post('/api/user')
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: 'Henk',
                lastName: 'Tank',
                password: 'secret',
                emailAdress : 'a'
            })
            .end((err, res) => {
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(400)
                result.should.be.a('string').that.equals('Email is invalid')
                done()
            })
        })
    })

    describe('UC-201-3 Invalid Password', () =>{
        it('if password is invalid, an error should be returned', (done) => {
            chai.request(server)
            .post('/api/user')
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: 'Henk',
                lastName: 'Tank',
                emailAdress: 'h.tank@server.com',
                password: 123,
            })
            .end((err, res) => {
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(400)
                result.should.be.a('string').that.equals('Password is invalid, min. 8 characters, 1 uppercase, 1 lowercase, 1 number')
                done()
            })
        })
    })

    describe('UC-201-4 User already exists', () => {
        it('if user already exists, an error should be returned', (done) => {
            chai.request(server)
            .post('/api/user')
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "test",
                lastName: "test",
                emailAdress: "test@test.com",
                password: "testT2123",
                phoneNumber: "0612345678",
                street: "street",
                city: "city",
                isActive: true,
            })
            .end((err, res) => {
                assert.ifError(err);
                res.should.be.a("object");
                let { status, result } = res.body;
                status.should.be.eql(409);
                result.should.be.eql("User already exists");
                done();
            });
        })
    })

    describe('UC-201-5 User added succesfully', () =>{
        it('If user is added successfully, Information should be returned', (done) => {
            chai.request(server)
            .post('/api/user')
            .set("Authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "EersteNaam111",
                lastName: "LaatsteNaam111",
                isActive: 1,
                emailAdress: "email.test11@server.com",
                password: "TestPass123!1",
                phoneNumber: "0613884424",
                roles: "editor,guest",
                street: "straatnaam12311",
                city: "stadnaam123"
            })
            .end((err,res) => {
                assert.ifError(err);
                res.should.be.a("object");
                let { status, result } = res.body;
                status.should.be.eql(201);
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("isActive");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("street");
                result.should.have.property("city");
                done();
            })
        })
    })
    
})