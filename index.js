const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');

const listService = (filepath) => {
  const listServices = [];
  try {
    const doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
    // console.log(doc);

    const dockerCoomposeRef = doc;

    for (let key in dockerCoomposeRef.services) {
      listServices.push({
        name: key,
        filepath,
      });
    }
  } catch (e) {
    console.log(e);
  }

  return listServices;
}

const testFolder = './apps/';

const getFilepaths = (folder) => {
  const filepaths = [];
  fs.readdirSync(folder).forEach(file => {
    filepaths.push(path.join(testFolder, file))
  });
  return filepaths;
}

const filepaths = getFilepaths(testFolder);
let services = [];

filepaths.forEach(filepath => {
  console.log(filepath);
  const servicesInFile = listService(filepath);
  console.log('s', servicesInFile)
  services = services.concat(servicesInFile);
  
});

console.log('services', services);
