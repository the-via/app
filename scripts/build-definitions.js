const fs = require('fs');
const {exec} = require('child_process');

function buildDefinitions() {
  const args = process.argv.slice(2);
  const shouldForceBuild = args.includes('--fresh') || args.includes('-f');

  if (!shouldForceBuild && fs.existsSync('./public/definitions')) {
    return;
  }

  console.log('Definitions re-building...');

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
