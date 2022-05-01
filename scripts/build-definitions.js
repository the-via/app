const fs = require('fs');
const { exec } = require('child_process');

function buildDefinitions() {
  if (fs.existsSync('./public/definitions')) {
    return;
  }

  console.log('Definitions not found. Building...');

  exec('via-keyboards public/definitions', (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return;
    }
     
    if (stderr) {
      console.error('stderr');
      return;
    }

    console.log(stdout);
  });
}

buildDefinitions();
