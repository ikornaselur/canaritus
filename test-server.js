const http = require('http');

const PORT = 1234;

const handleRequest = (req, res) => {
  console.log(req.method, req.url);
  req.on('data', (chunk) => {
    console.log(chunk.toString());
  });
  req.on('end', () => {
    console.log('Ans in 2 seconds..');
    setTimeout(() => {
      console.log('Ans');
      res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
      res.end();
    }, 1000);
  });
};

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('Listening on', PORT);
});
