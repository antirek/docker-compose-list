var path = require("path");
 
var hg = require("hg");

var HGRepo = hg.HGRepo;
var destPath = path.resolve(path.join(process.cwd(), "..", "my-node-hg"));
var repo = new HGRepo(destPath);
 
repo.pull(["-u"], function(err, output) {
    if (err) {
        throw err;
    }

    output.forEach(function(line) {
        console.log(line.body);
    });

    const rev = "default";
    repo.update(["-C", "-r", rev], (err, output) => {
        console.log(err, output)
    })
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