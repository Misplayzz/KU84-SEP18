const http = require('http');
const port = process.env.PORT ||8080;

http.createServer((req, res) => {
  res.write("I'm alive");
  res.end();
}).listen(port, () => {
  console.log(`Keep-alive server is running on port ${port}`);
});
