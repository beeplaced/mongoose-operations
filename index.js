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
            console.log(err)
            if (err.code === 11000) { // Duplicate key
                const fillObj = await this.add(err.keyValue, connection)
                return Object.assign({}, { e: err.code }, fillObj)
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
            return await connection.aggregate((AGGREGATE))
        } catch (error) {
            console.log(error)
        }
    }

}