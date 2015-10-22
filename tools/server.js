const http = require('http');

const port = 1234;

const handler = (req, res) => {
    console.log(req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.end('Swag');
}

const server = http.createServer(handler);

server.listen(port, () => {
    console.log('Swag enabled');
});
