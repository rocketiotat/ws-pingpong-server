const http = require('http')
const ws = require('ws')

const server = http.createServer(function (req_stream_in, res_stream_out) {
    // handle regular HTTP requests here
})
const webSocketServer = new ws.Server({
    path: '/ws',
    server: server,
})

const connected_clients = new Map()

webSocketServer.on('connection', function connection(ws_client_stream) {
    console.log('connceting')
    // NOTE: only for demonstration, will cause collisions.  Use a UUID or some other identifier that's actually unique.
    const this_stream_id = Array.from(connected_clients.values()).length

    // Keep track of the stream, so that we can send all of them messages.
    connected_clients.set(this_stream_id, ws_client_stream)
    ws_client_stream.on('message', (data) => {
        console.log(data)
    })
    // Attach event handler to mark this client as alive when pinged.
    ws_client_stream.is_alive = true
    ws_client_stream.on('pong', () => {
        console.log('pong')
        ws_client_stream.is_alive = true
    })

    // When the stream is closed, clean up the stream reference.
    ws_client_stream.on('close', function () {
        console.log('close')
        connected_clients.delete(this_stream_id)
    })
})

setInterval(function ping() {
    Array.from(connected_clients.values()).forEach(function each(
        client_stream
    ) {
        if (!client_stream.is_alive) {
            client_stream.terminate()
            return
        }
        client_stream.is_alive = false
        client_stream.ping()
    })
}, 1000)

server.listen(8080, () => {
    console.log('server ping pong is running')
})
