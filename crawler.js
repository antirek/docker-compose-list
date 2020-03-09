const hg = require("hg");
const config = require('config');
const fs = require('fs');
const cron = require('node-cron');
const { getServices } = require('./fromDockerCompose');

const getDirectories = (source) => {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
};

const HGRepo = hg.HGRepo;
const destPath = config.path;

const pullRepo = (repo) => {
  return new Promise((resolve, reject) => {
    repo.pull(["-u"], function(err, output) {
      if (err) reject(err);
      output.forEach(function(line) {
        console.log(line.body);
      });
      resolve(repo)
    });
  });
};

const updateRepo = (repo, branch) => {
  return new Promise((resolve, reject) => {
    repo.update(["-C", "-r", branch], (err, output) => {
      console.log(err, output)
      if(err) reject(err);
      resolve(repo);
    });
  });
};

const getServicesOnHost = (host)=> {
  let services = [];
  const d = destPath + '/apps/';
  console.log('dest path / apps', d);

  const appsDirs = getDirectories(d);
  console.log('appsDirs', appsDirs);

  for (let i = 0; i < appsDirs.length; i++ ) {
    const s = getServices(destPath + '/apps/' + appsDirs[i] + '/');
    const ps = s.map(item=>{
      item.app = appsDirs[i];
      item.host = host;
      return item;
    })
    services = services.concat(ps);
  }
  return services;
};

const processIt = async (repo, branches) => {
  let list = [];

  for (let i = 0; i < branches.length; i++) {
    const host = branches[i].branch;

    await updateRepo(repo, host);
    const s = await getServicesOnHost(host);
    console.log('host', host, 'count', s.length);

    list = list.concat(s);
  }

  return Promise.resolve(list)
};

const task = async () => {
  const repo = await pullRepo(new HGRepo(destPath));
  const list = await processIt(repo, config.branches);

  console.log('data items:', list.length);
  fs.writeFileSync(config.outputFile, JSON.stringify(list, false, 2));
}

cron.schedule('*/5 * * * *', async () => {
  console.log('start task');
  await task();
});

console.log('start process');