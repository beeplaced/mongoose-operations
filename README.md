# mongoose-operations
a set of mongoose-operations to create, find, update, count on a given connection

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

```
$ npm i mongoose-operations
```

## Features

  * Create new Data in Collection 
  * Find all Fields in a Collection using Aggregate
  * Update specific Object keys
  * Count results by match

## Create new Fields

Create new Data in Collection will return _id and existing Fields, if data already exists on indexed match

```js
const mongoose = require('mongoose') //need to pass mongoose to prevent package dups
const mongooseOperations = require('mongoose-operations')
const instance = new mongooseOperations(mongoose)

const connection = DBConnect().model(
    TABLE,
    SCHEMA,
    TABLE)

module.exports = class {

createPackageMeta = async (title) => 
    await instance.create(
    { title: 'MyTitle' }, 
    connection
    )
}
```

return if title already exists

```js
{
  e: 11000,
  _id: new ObjectId("64e9c309a90689fbecefb465"),
  title: 'MyTitle',
}
```