var request = require('request');

function main(params) {
    console.log('@localidade.js params: ', params)
    var localidade = params.localidade;
    var username = params.username;
    var password = params.password;

    var request = require('request').defaults({
        baseUrl: 'https://twcservice.mybluemix.net/api/weather/v3',
        auth: {username: username, password: password},
        timeout: 30000
    });

    var promise = new Promise(function(resolve, reject) {
        request({
            url: '/location/search',
            qs: {query: localidade, language: 'pt-BR'},
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var result = JSON.parse(body);
                resolve({
                    latitude: result.location.latitude[0], 
                    longitude: result.location.longitude[0]
                });
            } else {
                console.log('error getting location');
                console.log('http status code:', (response || {}).statusCode);
                console.log('error:', error);
                console.log('body:', body);
                reject({
                    error: error,
                    response: response,
                    body: body
                });
            }
        });
    });
    return promise;
}