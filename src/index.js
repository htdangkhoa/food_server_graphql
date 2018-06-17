import './utils/logger'
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cluster from 'cluster'
import os from 'os'
import mongoose from 'mongoose'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import schema from './graphql'

const cpus = os.cpus().length
const app = express()

dotenv.config()

mongoose.connect(process.env.DB, (error, db) => {
  if (error) return console.error(error)

  return console.info(`Connect mongoDB successful`)
})

app.use([
  cors(),
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

app.use('/graphiql', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../src/public/index.html'));
})

app.get('/', (req, res) => {
  return res.status(200).send(`Food server.`)
})

if (cluster.isMaster) {
  console.info(`Server is running on port: ${process.env.PORT}`)
  console.info(`Master ${process.pid} is running`)

  for (let i = 0; i < cpus; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`)

    cluster.fork()
  })
} else {
  app.listen(process.env.PORT, () => {
    console.info(`Worker ${process.pid} started.`)
  })
}
