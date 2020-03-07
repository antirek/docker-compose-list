
const hg = require("hg");
const config = require('config');

const { getServices } = require('./index');
const { readdirSync } = require('fs')

const getDirectories = (source) => {
  return readdirSync(source, { withFileTypes: true })
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

    //const rev = "app01.mobilon.ru";

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
        // console.log('i', i);
        const s = getServices(destPath + '/apps/' + appsDirs[i] + '/');
        const ps = s.map(item=>{
          item.app = appsDirs[i];
          item.host = host;
          return item;
        })
        //console.log('ps', ps);
        services = services.concat(ps);
      }

      // console.log('pppp ', services);
      return services;
    };

    const getServices2 = (host) => {
      return prepareRepo(repo, host)
        .then(() => {
          const r = getServicesOnHost(host);
          console.log('host', host, 'count', r.length);
          return r;
        });
    };

    const qw = async (branches) => {
      let qy = [];

      for (let q = 0; q < branches.length; q++) {
        const host = branches[q].branch;
        //console.log('h', host);
        const rt = await getServices2(host);
        //console.log('rt', rt);

        qy = qy.concat(rt);
      }

      return Promise.resolve(qy)
      //console.log('qy', qy);
    };

    qw(branches).then(d => {
      console.log('d', d)
    });


});



// Clone into "../example-node-hg"

/*
hg.clone("https://bitbucket.org/jacob4u2/node-hg/", destPath, function(err, output) {
    if(err) {
        throw err;
    }
 
    output.forEach(function(line) {
        console.log(line.body);
    });
 
    // Add some files to the repo with fs.writeFile, omitted for brevity
 
    hg.add(destPath, ["someFile1.txt", "someFile2.txt"], function(err, output) {
        if(err) {
            throw err;
        }
 
        output.forEach(function(line) {
            console.log(line.body);
        });
 
        var commitOpts = {
            "-m": "Doing the needful"
        };
 
        // Commit our new files
        hg.commit(destPath, commitOpts, function(err, output) {
            if(err) {
                throw err;
            }
 
            console.log(hg.Parsers.text(output));
        });
 
        // Get command output as JSON
        hg.branches({"-T":"json"}, function(err, output) {
          if(err) {
                throw err;
            }
 
            var branches = hg.Parsers.json(output);
            branches.forEach(function(b) {
                console.log(b.branch + " - " + b.active);
            });
        });
    });
});

*/