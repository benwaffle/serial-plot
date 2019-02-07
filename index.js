const express = require('express')
const fs = require('fs')
const WebSocket = require('ws')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const app = express()
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
    let port = null
    ws.on('message', (msg) => {
        console.log(`browser sent ${msg}`)
        const device = JSON.parse(msg).device
        if (port)
            port.close()
        port = new SerialPort(device, { baudRate: 115200 })
        const parser = port.pipe(new Readline())

        const listener = (data) => {
            ws.send(data, (err) => {
                if (err) {
                    console.error(err)
                    parser.removeListener('data', listener)
                }
            })
        }
        parser.addListener('data', listener)
        parser.on('error', () => parser.removeListener('data', listener))
    })
})

app.use(express.static('public'))
app.use('/node_modules', express.static('node_modules'))

app.get('/devices', (req, res) => {
    res.set('Cache-Control', 'no-store, must-revalidate')
    fs.readdir('/dev', (err, files) => {
        if (err) {
            console.error(err)
            res.send({
                error: err.message
            })
        } else {
            const serialports = files.filter(name => name.startsWith('tty.')) // macOS
            res.send(serialports.map(name => `/dev/${name}`))
        }
    })
})

app.listen(3000, () => console.log('🚀 http://localhost:3000'))