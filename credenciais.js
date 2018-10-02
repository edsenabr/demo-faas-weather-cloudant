function main(params) {
    var openwhisk = require('openwhisk');
    var util = require('util');
    var ow = openwhisk();
    return new Promise(function(resolve, reject) {
        ow.packages.list().then( packages => {
            var promises = [];
            packages.forEach( package => {
                promises.push (
                    ow.packages.get({
                        name: util.format("/%s/%s", package.namespace, package.name )
                    })
                );
            });

            Promise.all(promises).then( packages => {
                var credentials = {};
                packages.forEach( package => {
                    if (package.parameters && package.parameters.length) {
                        credentials[package.name] = {};
                        package.parameters.forEach(element => {
                            credentials[package.name][element.key] = element.value;
                        });
                    }
                })
                resolve(credentials);
            })
        });
    });
}