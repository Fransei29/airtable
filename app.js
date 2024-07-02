const express = require("express")
const path = require("path")
require('dotenv').config();    // Cargar variables de entorno desde el archivo .env
const airtableAccessToken = process.env.AIRTABLE_ACCESS_TOKEN;  // Obtener el token de acceso de Airtable desde las variables de entorno
const Airtable = require('airtable');  // Importar el módulo de Airtable

const app = express()  

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "."))

// Configurar Airtable con el Token de Acceso Personal
Airtable.configure({
    apiKey: airtableAccessToken
});

// Seleccionar la base de Airtable usando el ID de la base
const base = Airtable.base('appiKlsiYEiCInwAW');

let records; // Variable para almacenar los registros en caché

// Definir la ruta para manejar las solicitudes GET en la ruta raíz '/'
app.get('/', async (req, res) => {
  if (records) {
    console.log('cached');   
    res.render('page', {    // Si los registros ya están en caché, se usan directamente
      records,
    });
  } else {
    (async () => {
      records = await base('Business Hours')  // Si los registros no están en caché, se obtienen de Airtable
        .select({
            sort: [{ field: 'Orden', direction: 'asc' }]  //Para obtenerlos en el orden que queremos
        })
        .firstPage(); // Obtener la primera página de registros
      res.render('page', {
        records,
      });

      // Establecer un temporizador para invalidar la caché después de 10 segundos
      setTimeout(() => {
        records = null; // Invalidar la caché cada 10 seg para pedir la info de nuevo y mantenerla actualizada
      }, 10 * 1000); 
    })();
  }
});

app.listen(3000, () => console.log("Server ready"))