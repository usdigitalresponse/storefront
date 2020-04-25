// this file writes the required redirects file to the netlify build directory
let fs = require('fs');

console.log('Building redirects');

fs.writeFile(__dirname + '/../build/_redirects', '/* /index.html 200', (err) => {
  if (err) throw err;
  console.log('redirects file has been built');
});
