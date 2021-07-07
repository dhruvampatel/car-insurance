'use strict';

const { Contract } = require('fabric-contract-api');

const ClaimStatus = Object.freeze({
    NoClaim: 0,
    Filed: 1,
    Reviewd: 2,
    Approved: 3,
    Rejected: 4,
    Closed: 5,
});

class Insurance extends Contract {
    //Driver
    async fileClaim(ctx, licenseNumber) {
        const insuraceClaimModal = {
            policyNumber: 101,
            claimStatus: ClaimStatus.Filed,
            carInfo: {
                make: 'Honda',
                model: 'Civic',
                year: '2022',
                registration: 'Jdgu78A1',
                licensePlateNumber: 'XYZ1784'
            },
            accidentDetails: {
                driverInfo: [{
                    name: 'John Steve',
                    licenseNumber: '2678ahdg890',
                    insuranceCompanyName: 'Desjardian',
                    driverDescriptionOfAccident: 'Other driver tried to overtake',
                }],
                investigationOfficer: {
                    name: 'Pete Pan',
                    badgeNumber: 'TN768QLB'
                },
                date: '2021-06-10 7:25:30 AM',
                location: '7241 Yonge Street',
                passengerCount: 2,
                injuryDetails: 'Minor injuries',
                vehicleDamageDetails: 'Entire front bumper and hood is damaged. Engine failure.',
            }
        };
        await ctx.stub.putState(licenseNumber, Buffer.from(JSON.stringify(insuraceClaimModal)));
    }

    //Company
    async reviewClaim(ctx, licenseNumber) {
        const claimInfo = await ctx.stub.getState(licenseNumber);
        if (!claimInfo || claimInfo.length === 0) {
            throw new Error(`${licenseNumber} does not exist`);
        }
        claimInfo = JSON.parse(claimInfo.toString());
        claimInfo.claimStatus = ClaimStatus.Reviewd;
        await ctx.stub.putState(licenseNumber, Buffer.from(JSON.stringify(claimInfo)));
        return 'Decision waiting on file '+licenseNumber;
    }

    //Company
    async updateClaimStatus(ctx, licenseNumber, approved) {
        const claimInfo = await ctx.stub.getState(licenseNumber);
        const msg;

        if (!claimInfo || claimInfo.length === 0) {
            throw new Error(`${licenseNumber} does not exist`);
        }
        claimInfo = JSON.parse(claimInfo.toString());

        if(approved){
            msg = `File number ${licenseNumber} has been approved`;
            claimInfo.claimStatus = ClaimStatus.Approved;
        } else{
            msg = `File number ${licenseNumber} has been rejected`;
            claimInfo.claimStatus = ClaimStatus.Rejected;
        }
        await ctx.stub.putState(licenseNumber, Buffer.from(JSON.stringify(claimInfo)));

        return msg;
    }

    //Gets status on file
    async checkStatus(ctx, licenseNumber) {
        const claim = await ctx.stub.getState(licenseNumber);
        claim = JSON.parse(claim.toString());
        return claim.claimStatus;
    }

    async getClaimData(ctx, licenseNumber) {
        const claimInfo = await ctx.stub.getState(licenseNumber);
        
        if (!claimInfo || claimInfo.length === 0) {
            throw new Error(`${licenseNumber} does not exist`);
        }

        return claimInfo.toString();
    }

    async closeFile(ctx, licenseNumber) {
        const claimInfo = await ctx.stub.getState(licenseNumber);

        if (!claimInfo || claimInfo.length === 0) {
            throw new Error(`${licenseNumber} does not exist`);
        }
        claimInfo = JSON.parse(claimInfo.toString());
        claimInfo.claimStatus = ClaimStatus.Closed;
        
        await ctx.stub.putState(licenseNumber, Buffer.from(JSON.stringify(claimInfo)));

        return 'File on license number'+licenseNumber+' closed';
    }
}

module.exports = Insurance;
