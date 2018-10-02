function main(params) {
    console.log("@previsao params: ", params);
    let estado = params.estado || {};
    delete params.estado;
    let saida = {};

    switch(estado.etapa) {

        /** busca essa localidade no cache */
        case 'Bluemix_cloudant-faas_login/read':
            estado.etapa = 'credenciais.js';
            if (!params.error) {
                return {
                    temperatura: params.temperatura
                };
            }
            break;
        
        /** lê as credenciais do servicos */
        case 'credenciais.js': 
            estado.etapa = 'localidade.js';
            estado.credenciais = params;
            saida = {
                username: params.Bluemix_weather_faas.username,
                password: params.Bluemix_weather_faas.password,
                localidade: estado.localidade
            }
            break;
         
        /** procura as coordenadas geograficas da localidade informada */
        case 'localidade.js':
            estado.etapa = 'Bluemix_weather_faas/forecast';
            saida = {
                latitude: params.latitude,
                longitude: params.longitude,
                unit: 'm',
                timePeriod: 'current',
                language: 'pt-BR'
            }
            break;
            
        /** consulta a previsão do tempo usando as coordenadas */
        case 'Bluemix_weather_faas/forecast':
            estado.etapa = 'Bluemix_cloudant-faas_login/write';
            estado.temperatura = params.observation.temp;
            saida = {
                dbname: 'previsoes',
                doc: {
                    _id: estado.localidade,
                    temperatura: estado.temperatura
                }
            };

            break;

        case 'Bluemix_cloudant-faas_login/write':
            delete estado.etapa;
            saida = {
                temperatura: estado.temperatura
            };
            break;

        
        /** consulta a previsão do tempo usando as coordenadas */
        default:
            estado.etapa = 'Bluemix_cloudant-faas_login/read';
            estado.localidade = params.localidade;
            saida = {
                dbname: 'previsoes',
                id: params.localidade
            }
            break;
    }
    
    if (estado.etapa) {
        return {
            action: estado.etapa, 
            params: saida,
            state: {estado: estado}
        }
    } else {
        return saida;
    } 
}