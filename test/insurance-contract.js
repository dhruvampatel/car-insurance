/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { InsuranceContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('InsuranceContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new InsuranceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"insurance 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"insurance 1002 value"}'));
    });

    describe('#insuranceExists', () => {

        it('should return true for a insurance', async () => {
            await contract.insuranceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a insurance that does not exist', async () => {
            await contract.insuranceExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createInsurance', () => {

        it('should create a insurance', async () => {
            await contract.createInsurance(ctx, '1003', 'insurance 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"insurance 1003 value"}'));
        });

        it('should throw an error for a insurance that already exists', async () => {
            await contract.createInsurance(ctx, '1001', 'myvalue').should.be.rejectedWith(/The insurance 1001 already exists/);
        });

    });

    describe('#readInsurance', () => {

        it('should return a insurance', async () => {
            await contract.readInsurance(ctx, '1001').should.eventually.deep.equal({ value: 'insurance 1001 value' });
        });

        it('should throw an error for a insurance that does not exist', async () => {
            await contract.readInsurance(ctx, '1003').should.be.rejectedWith(/The insurance 1003 does not exist/);
        });

    });

    describe('#updateInsurance', () => {

        it('should update a insurance', async () => {
            await contract.updateInsurance(ctx, '1001', 'insurance 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"insurance 1001 new value"}'));
        });

        it('should throw an error for a insurance that does not exist', async () => {
            await contract.updateInsurance(ctx, '1003', 'insurance 1003 new value').should.be.rejectedWith(/The insurance 1003 does not exist/);
        });

    });

    describe('#deleteInsurance', () => {

        it('should delete a insurance', async () => {
            await contract.deleteInsurance(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a insurance that does not exist', async () => {
            await contract.deleteInsurance(ctx, '1003').should.be.rejectedWith(/The insurance 1003 does not exist/);
        });

    });

});
