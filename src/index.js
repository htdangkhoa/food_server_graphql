import './utils/logger'
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'

import mongoose from 'mongoose'

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import schema from './graphql'

dotenv.config()

mongoose.connect(process.env.DB, (error, db) => {
  if (error) return console.error(error)

  return console.debug(`Connect mongoDB successful`)
})

const app = express()

app.use([
  bodyParser.json(), 
  bodyParser.urlencoded({ extended: false })
])

app.use('/graphql', graphqlExpress((req, res) => {
  let token = req.headers.authorization
  return {
    schema,
    context: { token },
    rootValue: { req, res }
  }
}))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(process.env.PORT, () => {
  console.debug(`Server is running on port ${process.env.PORT}`)
})