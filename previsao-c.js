composer.let({
    localidade: null,
    credenciais: null,
    temperatura: null
    },
    params => {
        localidade = params.localidade;
        return {
            dbname: 'previsoes',
            id: localidade
        }
    },
    composer.try(
        composer.sequence(
            'Bluemix_cloudant-faas_login/read',
            ({ temperatura }) => ({ temperatura })
        ),
        composer.sequence(
            'credenciais.js',
            params => {
                credenciais = params;
                return {
                    localidade: localidade,
                    username: credenciais.Bluemix_weather_faas.username,
                    password: credenciais.Bluemix_weather_faas.password,
                }
            },
            'localidade.js',
            params => ({
                latitude: params.latitude,
                longitude: params.longitude,
                unit: 'm',
                timePeriod: 'current',
                language: 'pt-BR'
            }),
            'Bluemix_weather_faas/forecast',
            params => {
                temperatura = params.observation.temp;
                return {
                    dbname: 'previsoes',
                    doc: {
                        _id: localidade,
                        temperatura: temperatura
                    }
                }
            },
            'Bluemix_cloudant-faas_login/write',
            params => ({ temperatura })
        )
    )
)