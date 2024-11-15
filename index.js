module.exports = class {

    constructor(mongoose) {
        this.mongoose = mongoose
    }

    create = async (input, connection) => {
        const save = Object.assign({ _id: new this.mongoose.mongo.ObjectId() }, input )
        this.mongoose.models = {}
        try {
            const DBCon = connection;
            const SaveObj = new DBCon(save);
            return await SaveObj.save();
        } catch (err) {
            if (err.code === 11000) { // Duplicate key
                const fillObj = await this.add(err.keyValue, connection)
                return Object.assign({ e: err.code }, fillObj)
            }
            return { status: err.status || 300, error:err }
        }
    }

    createOrUpdate = async (entry, connection) => {
        try {
        let res = await this.create(entry, connection)
        if ('e' in res && res.e === 11000) {
            const updateID = res._id
            const { _id } = await this.updateObjKey(updateID, entry, connection)
            return { status: 201, _id }
        }
        return { status: 200, _id: res._id.toString() }
        } catch (error) {
            throw(error)
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
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
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
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    findAllFieldsSortLower = async (match, projects, entry, connection) => {
        try {
            if (!projects || !entry) return { error: 'field missing' }
            const projectentry = { ...projects, lowercasedEntry: { $toLower: `$${entry}` } };
            const AGGREGATE = [
                { $match: match },
                { $project: projectentry },
                { $sort: { lowercasedEntry: 1 } },
                { $project: projects }
            ];
            return await connection.aggregate((AGGREGATE))
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    findOneByProject = async (match, projects, connection) => {
        try {
            const AGGREGATE = [
                { $match: match },
                { $project: projects }
            ]
            const data = await connection.aggregate((AGGREGATE))
            return data[0] || false
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    findManyByProject = async (match, projects, connection, sort = false) => {
        try {
            const AGGREGATE = [
                { $match: match },
                { $project: projects },
                ...(sort ? [{ $sort: sort }] : [{ $sort: { _id: 1 } }]),
            ];
            return await connection.aggregate(AGGREGATE);
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    };

    findAllFieldsByID = async (rowID, connection) => {
        try {
            const AGGREGATE = [
                { $match: { _id: new this.mongoose.Types.ObjectId(rowID) } },
                { $addFields: {} }
            ]
            const result = await connection.aggregate((AGGREGATE))
            return result[0] ? result[0] : false
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    findFieldUnique = async (match, field, connection, limit = false) => {
        try {
            const AGGREGATE = [
                { $match: match },
                {
                    $group: {
                        _id: null,
                        dynamicField: { $addToSet: `$${field}` }
                    }
                },
                { $unwind: '$dynamicField' },
                { $sort: { dynamicField: 1 } },
                ...(limit ? [{ $limit: limit }] : []),
                { $project: { _id: 0 } }
            ];
            return await connection.aggregate((AGGREGATE))
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    updateObjKey = async (rowID, set, connection) => {
        try {
            if (Object.keys(set).length === 0) return 100 // no changes
                const condition = { _id: new this.mongoose.Types.ObjectId(rowID) }
                const update = await connection.updateOne(condition, { $set: set })
                    if (update.acknowledged === true && update.modifiedCount === 1) return { status: 200, _id: rowID }
                    if (update.acknowledged === true && update.modifiedCount === 0) return { status: 201, _id: rowID } //no changes
                return update
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    updateObj = async (rowID, set, connection) => {
        try {
        const update = await connection.updateOne({ _id: rowID }, set)
        if (update.acknowledged === true && update.modifiedCount === 1) return 200
        } catch (err) {
            if (err.code === 11000) { // Duplicate key
                return 209 // Already Exists
            }
            return { status: err.status || 300, error:err }
        }
    }

    countResults = async (match, connection) => {
        try {
            const data = await connection.aggregate(([
                { $match: match },
                { $group: { _id: null, count: { $sum: 1 } } }]))
            return data[0] ? data[0].count : 0
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

    deleteByID = async (rowID, connection) => {
        try {
            const del = await connection.deleteOne({ _id: rowID })
            if (del.deletedCount !== 1) return { status: 300 }
            del.rowID = rowID
            return { del, status: 200 }
        } catch (error) {
            return { status: error.status || 500, error: error.message || "Internal Server Error" };
        }
    }

}