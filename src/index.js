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
import authSchema from './graphql/authorized'
import unAuthSchema from './graphql/unauthorized'
import { verify } from './utils/jwt'

const cpus = os.cpus().length
const app = express()

dotenv.config()

mongoose.connect(process.env.DB, (error, db) => {
  if (error) return console.error(error)

  return console.info(`Connect mongoDB successful`)
})

app.use([
  cors({credentials: true, origin: true}),
  bodyParser.json(), 
  bodyParser.urlencoded({ extended: false })
])

app.use('/graphql', graphqlExpress(async (req, res) => {
  let token = req.headers.authorization

  try {
    let _tk = token.split('Bearer ')[1]

    let payload = await verify(_tk)

    return {
      schema: (!payload) ? unAuthSchema : authSchema,
      context: { user: payload },
      rootValue: { req, res }
    }
  } catch (error) {
    return {
      schema: unAuthSchema,
      rootValue: { req, res }
    }
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
