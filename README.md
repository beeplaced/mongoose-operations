# mongoose-operations
a set of mongoose-operations to create, find, update, count on a given connection

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

npm i mongoose-operations

## Features

  * Create new Data in Collection 
  * Find all Fields in a Collection using Aggregate
  * Update specific Object keys
  * Count results by match

## Usage

To view the examples, clone the Express repo and install the dependencies:

```js

const mongooseOperations = require('mongoose-operations')
const instance = new mongooseOperations()

const connection = DBConnect().model(
    mainTable,
    SCHEMA,
    mainTable)

module.exports = class {

createPackageMeta = async (title) => 
    await instance.create(
    { title: 'MyTitle' }, 
    connection
    )

```