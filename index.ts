import * as configPrivate from './config.private';
import { Practitioner } from '@andes/fhir';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request');

const url = configPrivate.mongoDB.url;
const dbname = configPrivate.mongoDB.dbname;
const coleccion = configPrivate.mongoDB.collection;

// Iniciamos el proceso de envío de profesionales al servidor de Fhir
inicio();

function inicio() {
    MongoClient.connect(url, async function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbname);
        const col = db.collection(coleccion);
        let profesionales = await col.find({}).toArray();
        let practitioners = profesionales.map(p => Practitioner.encode(p));
        for (let i = 0; i <= practitioners.length; i++) {
            if (practitioners[i]) {
                await sendFhirServer(practitioners[i]);
            }
        };
    });
}

function sendFhirServer(data) {
    return new Promise((resolve: any, reject: any) => {
        const url = 'http://localhost:3000/4_0_0/Practitioner';
        const options = {
            url,
            headers: {
                'content-type': 'application/fhir+json'
            },
            method: 'POST',
            json: true,
            body: data
        };
        request(options, (error, response) => {
            if (error) {
                return reject(error)
            };
            return resolve(response.statusCode);
        });

    })

}

