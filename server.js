const { join } = require("path")
const { writeFileSync } = require("fs")
const { EventEmitter } = require("node:events")
const cors = require("cors")
const { createClient } = require("redis")
const express = require("express")

void (async() => {
  const app = new express()

  const { PORT } = process.env

  const localEventEmitter = new EventEmitter()

  const redisClient = createClient({
    url: "redis://redis-sse:6379"
  })

  await redisClient.connect()

  const redisSubscriber = redisClient.duplicate()
  await redisSubscriber.connect()

  redisSubscriber.subscribe("redis-channel", data => {
    localEventEmitter.emit("message", data)
  })

  app.use(express.static(join(__dirname, "public")))

  app.use(cors())

  app.get("/ping", async(req, res) => {
    const data = `pong ${PORT}`

    if (req.query.redis === "true") {
      await redisClient.publish("redis-channel", data)
    } else {
      localEventEmitter.emit("message", data)
    }

    res.sendStatus(200)
  })

  app.get("/streaming", (req, res) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive"
    })

    res.flushHeaders()

    localEventEmitter.on("message", (data) => {
      res.write(`data: ${data}\nretry: 1000\n\n`)
    })
  })

  app.get("/kill", () => {
    // write a file to trigger nodemon live reload
    writeFileSync(join(__dirname, "ignore", "restart.js"), "")
  })

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
})().catch(console.error)