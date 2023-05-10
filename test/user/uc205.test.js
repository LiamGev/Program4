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


describe('UC-205 Edit User details', () => {
    beforeEach((done) => {
        dbConnection.getConnection(function (err, connection){
            if(err) throw err
            connection.query(CLEAR_DB + INSERT_USER, function(error,results,fields){
                connection.release()
                if(error) throw error
                done()
            })
        })
    })

    describe('UC-205-1 Email missing', () => {
        it('if email is missing, an error should be returned', (done) => {
            chai
              .request(server)
              .put("/api/user/1")
              .set("Authorization","Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
              .send({
                firstName: "John",
                lastName: "Doe",
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
                status.should.be.eql(400);
                result.should.be.eql("Email is required");
                done();
              });
        })
    })

    describe('UC-205-3 Invalid Phonenumber', () => {
        it('If phonenumber is invalid it should return an error', (done) => {
            chai.request(server)
            .put("/api/user/1")
            .set("Authorization","Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
              firstName: "John",
              lastName: "Doe",
              emailAdress: "test@test.com",
              password: "testT2123",
              phoneNumber: "1234567",
              street: "street",
              city: "city",
              isActive: true,
            })
            .end((err, res) => {
                assert.ifError(err);
                res.should.be.a("object");
                let { status, result } = res.body;
                status.should.be.eql(400);
                result.should.be.eql("Phone number is invalid");
            done();
      });
        })
    })

    describe('UC-205-4 User does not exist', () => {
        it('If requested user does not exist, error should be returned', (done) => {
            chai.request(server)
            .put('/api/user/200000')
            .set('authorization', 'Bearer ' + jwt.sign({userId: 1}, jwtSecretKey))
            .send({
                firstName: 'Liam',
                lastName: 'Gevaerts',
                isActive: 1,
                emailAdress: 'lcn.gevaerts@student.avans.nl',
                password: 'WachtWOoord123!',
                phoneNumber: '0613429908',
                roles: 'editor,guest',
                street: 'chopinstraat',
                city: 'Capelle aan den Ijssel'
            })
            .end((err,res) => {
                res.should.be.an('object')
                let{status, result} = res.body
                status.should.equals(404)
                result.should.be.a('String').that.equals('Update failed, user with ID 200000 does not exist')
                done()
            })
        })
    })

    describe('UC-205-5 User not signed in', () => {
        it('If user is not signed in, error should be returned', (done) => {
            chai.request(server)
            .put("/api/user/1")
            .send({
                firstName: "John",
                lastName: "Doe",
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
                let { status, message } = res.body;
                status.should.be.eql(401);
                message.should.be.eql("Authorization header missing!");
                done();
            });
         });
        })

    describe('UC-205-6 User succesfully edited', () =>{
        it('if user is succesfully added, return results', (done) => {
            chai.request(server)
            .put("/api/user/2")
            .set("Authorization","Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "John",
                lastName: "Doe",
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
                status.should.be.eql(200);
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("street");
                result.should.have.property("city");
                result.should.have.property("isActive");
                done();
            }
            );
        })
    })
})