const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const matcher = require('matcher');

const listService = (filepath) => {
  const listServices = [];
  try {
    const doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));

    for (let key in doc.services) {
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

const getFilepaths = (folder) => {
  const filepaths = [];
  fs.readdirSync(folder).forEach(file => {
    if (matcher.isMatch(file, 'docker-compose*.yml')) {
      filepaths.push(path.join(folder, file))
    }
  });
  return filepaths;
}

const getServices =  (folder) => {
  const filepaths = getFilepaths(folder);
  let services = [];

  filepaths.forEach(filepath => {
    const servicesInFile = listService(filepath);
    services = services.concat(servicesInFile);
  });
  return services;
}

module.exports = {
  getServices,
}