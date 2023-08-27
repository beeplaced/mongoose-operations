const mongoose = require('mongoose');

module.exports = class {

    create = async (input, connection) => {
        const save = Object.assign({ _id: new mongoose.mongo.ObjectId() }, input )
        mongoose.models = {}
        try {
            const DBCon = connection
            const SaveObj = new DBCon(save)
            return await SaveObj.save()
        } catch (err) {
            if (err.code === 11000) { // Duplicate key
                const fillObj = await this.add(err.keyValue, connection)
                return Object.assign({ e: err.code }, fillObj)
            }
            return 300
        }
    }

    add = async ( match, connection ) => {
        try {
            const AGGREGATE = [
                { $match: match },
                { $addFields: {} }
            ]
            const res = await connection.aggregate((AGGREGATE))
            return res[0]
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    findAllFields = async (match, connection) => {
        try {
            const AGGREGATE = [
                { $match: match },
                { $addFields: {} }
            ]
            return await connection.aggregate((AGGREGATE))
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    findAllFieldsByID = async (rowID, connection) => {
        try {
            const AGGREGATE = [
                { $match: { _id: new mongoose.Types.ObjectId(rowID) } },
                { $addFields: {} }
            ]
            const result = await connection.aggregate((AGGREGATE))
            return result[0] ? result[0] : false
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    findFieldUnique = async (match, field, connection) => {
        try {
            const AGGREGATE = [
                { $match: match },
                { $group: { _id: null, [field]: { $addToSet: `$${field}` } } },
                { $unwind: `$${field}` },
                { $sort: { [field]: 1 } },
                { $project: { _id: 0 } }
            ]
            return await connection.aggregate((AGGREGATE))
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    updateObjKey = async (rowID, set, connection) => {
        try {
            if (Object.keys(set).length === 0) return 100 // no changes
                const condition = { _id: new mongoose.Types.ObjectId(rowID) }
                const update = await connection.updateOne(condition, { $set: set })
                if (update.acknowledged === true && update.modifiedCount === 1) return 200
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    updateObj = async (rowID, set, connection) => {
        try {
        const update = await connection.updateOne({ _id: rowID }, set)
        if (update.acknowledged === true && update.modifiedCount === 1) return 200
        } catch (error) {
            console.log(error)
            return 300
        }
    }

    countResults = async (match, connection) => {
        try {
            const data = await connection.aggregate(([
                { $match: match },
                { $group: { _id: null, count: { $sum: 1 } } }]))
            return data[0] ? data[0].count : 0
        } catch (error) {
            console.log(error)
            return 300
        }
    }

}