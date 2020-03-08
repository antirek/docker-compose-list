
const hg = require("hg");
const config = require('config');

const fs = require('fs')
const { getServices } = require('./fromDockerCompose');

const getDirectories = (source) => {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
};

const HGRepo = hg.HGRepo;
const destPath = config.path;

const repo = new HGRepo(destPath);

const branches = config.branches;

repo.pull(["-u"], function(err, output) {
    if (err) {
        throw err;
    }

    output.forEach(function(line) {
      console.log(line.body);
    });    

    const prepareRepo = (repo, branch) => {
      return new Promise((resolve, reject) => {
        repo.update(["-C", "-r", branch], (err, output) => {
          console.log(err, output)
          if(err) reject(err);
          resolve();
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

      // console.log('pppp ', services);
      return services;
    };

    const getServicesFromRepo = (host) => {
      return prepareRepo(repo, host)
        .then(() => {
          const r = getServicesOnHost(host);
          console.log('host', host, 'count', r.length);
          return r;
        });
    };

    const run = async (branches) => {
      let qy = [];

      for (let q = 0; q < branches.length; q++) {
        const host = branches[q].branch;
        const rt = await getServicesFromRepo(host);

        qy = qy.concat(rt);
      }

      return Promise.resolve(qy)
    };

    run(branches).then(d => {
      console.log('data items:', d.length);
      fs.writeFileSync(config.outputFile, JSON.stringify(d, false, 2));
    });
});

