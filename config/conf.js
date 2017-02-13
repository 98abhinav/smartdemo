var _environments = {
    local: {
        host: 'localhost',
        config: {
            apiPath: 'http://118.200.230.65:8090',
            //apiPath: 'http://es-demo.aurionpro.com',
            domainPath: 'http://localhost:9999/ESAdmin',
            urlPath: 'http://localhost:9999/ESAdmin'
        }
    },
    stage: {
        host: '118.200.230.65',
        config: {
            apiPath: 'http://118.200.230.65:8090',
            domainPath: 'http://118.200.230.65:8090/ESAdmin',
            urlPath: 'http://118.200.230.65:8090/ESAdmin'
        }
    },
    prod: {
        host: 'es-demo.aurionprosena.org',
        config: {
            apiPath: 'http://es-demo.aurionpro.com',
            domainPath: 'http://es-demo.aurionpro.com/ESAdmin',
            urlPath: 'http://es-demo.aurionpro.com/ESAdmin'
        }
    }
},
_environment;