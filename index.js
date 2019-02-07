const express = require('express')
const app = express()
const fs = require('fs')

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