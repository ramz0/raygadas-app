// Modulos.
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); 

// objeto para cargar en la conexion.
const dbConfig = {
  user: 'Raygadas',
  password: 'pass',
  connectString: 'localhost:1521/XE'
};

let connection; // Variable para almacenar la conexión a la base de datos.

// Conectar a la BD.
async function connectToDB() {
  try {
    // guardar la conexion.
    connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión establecida a Oracle Database');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Buscar datos de cualquier Tabla (select con condicion)
app.get('/select/:tabla/:campo/:dato', async (req, res) => {
  try {
    const { tabla, campo, dato } = req.params;

    console.log(`Realizando consulta en la tabla ${tabla} donde ${campo} = ${dato}`);

    await connectToDB();

    const result = await connection.execute(`
      SELECT * FROM ${tabla}
      WHERE ${campo} = '${dato}'
    `);

    // Verifica si hay resultados
    if (!result.rows || result.rows.length === 0) {
      console.log('No se encontraron resultados');
      res.status(404).send('No se encontraron resultados');
    } else {
      console.log('Consulta exitosa');
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error en la consulta SQL:', error);
    res.status(500).send('Error en la consulta SQL');
  }
});



//    Buscar datos (select con condicion)   //
app.get('/login/:usuario/:contrasena', async (req, res) => {
  const { usuario, contrasena } = req.params;
  
  console.log(`req.params:  ${usuario} , ${contrasena}`);
  try {
    console.log('Intentando conectar a la base de datos para la autenticación...');
    await connectToDB();
    console.log('Conexión exitosa');

    const result = await connection.execute(`
      SELECT * FROM cliente
      WHERE nombre = '${usuario}' AND contrasena = '${contrasena}'
    `);

    if (!result.rows || result.rows.length === 0) {
      console.log('Autenticación fallida');
      res.status(401).send('Credenciales inválidas');
    } else {
      console.log('Autenticación exitosa');
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).send('Error en la autenticación');
  }
});

// Tomar los datos de cualquier tabla.
app.get('/select/:tabla', async (req, res) => {
  const { tabla } = req.params;

  try {
    console.log(`Intentando conectar a la base de datos para la tabla ${tabla}...`);
    await connectToDB();
    console.log('Conexión exitosa');

    const result = await connection.execute(`SELECT * FROM ${tabla}`);
    
    console.log(`Resultados de la consulta en la tabla ${tabla}:`, result);
    
    if (!result.rows || result.rows.length === 0) {
      console.log(`No se encontraron datos en la tabla ${tabla}`);
      res.status(404).send(`No se encontraron datos en la tabla ${tabla}`);
    } else {
      console.log(`Resultados de la consulta en la tabla ${tabla}:`, result.rows);
      res.json(result.rows);
    }
  } catch (error) {
    console.error(`Error al obtener datos desde la base de datos para la tabla ${tabla}:`, error);
    res.status(500).send(`Error al obtener datos desde la base de datos para la tabla ${tabla}`);
  }
});


//    Registrar (insert)    //
app.post('/registro/:tabla', async (req, res) => {
  const tabla = req.params.tabla;
  const datos = req.body;

  console.log(`Datos recibidos desde Flutter para la tabla ${tabla}:`, datos);

  const columnas = Object.keys(datos).join(', ');
  const valores = Object.values(datos);
  const marcadores = valores.map((_, index) => `:${index + 1}`).join(', ');

  try {
    const result = await connection.execute(
      `INSERT INTO ${tabla} (${columnas}) VALUES (${marcadores})`,
      valores
    );

    console.log('Resultado de la consulta:', result);
    await connection.commit();
    res.status(200).send('Registro exitoso');
    console.log('Respuesta enviada');
  } catch (error) {
    console.error(`Error al registrar en la tabla ${tabla}:`, error);
    res.status(500).json({ error: error.message });
  }
});


//    Actualizar datos (update)   //
app.put('/actualizacion/:tabla/:campo/:id', async (req, res) => {
  const { tabla, campo, id } = req.params;
  const datos = req.body;

  const setClause = Object.keys(datos)
    .map(columna => `${columna} = :${columna}`)
    .join(', ');

  try {
    const result = await connection.execute(
      `UPDATE ${tabla} SET ${setClause} WHERE ${campo} = :id`,
      { ...datos, id }
    );

    console.log('req.Body: ', req.body);
    console.log('Datos recibidos para la actualización:', { ...datos, id });

    if (result.rowsAffected === 1) {
      await connection.commit();
      console.log('Actualización exitosa:', result.rowsAffected);
      res.status(200).send('Actualización exitosa');
    } else {
      res.status(404).send(`No se encontró el elemento en la tabla ${tabla} para actualizar`);
    }
  } catch (error) {
    console.error(`Error al actualizar elemento en la tabla ${tabla}:`, error);
    res.status(500).json({ error: error.message });
  }
});


//    Eliminar registros (delete)   //
app.delete('/eliminar/:tabla/:campo/:id', async (req, res) => {
  const { tabla, campo, id } = req.params;
  console.log(`Solicitud de eliminación recibida para la tabla ${tabla} donde ${campo} = ${id}`);

  try {
    const result = await connection.execute(
      `DELETE FROM ${tabla} WHERE ${campo} = :id`,
      {
        id
      }
    );

    if (result.rowsAffected === 1) {
      await connection.commit();
      console.log(`Eliminación exitosa de la tabla ${tabla}:`, result.rowsAffected);
      res.status(200).send(`Eliminación exitosa de la tabla ${tabla}`);
    } else {
      res.status(404).send(`No se encontró el registro en la tabla ${tabla} para eliminar`);
    }
  } catch (error) {
    console.error(`Error al eliminar el registro de la tabla ${tabla}:`, error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/obtenerNuevoIdCliente', async (req, res) => {
  try {
    console.log('Intentando obtener nuevo ID de cliente...');
    const result = await connection.execute(
      'SELECT NVL(MAX(ID_CLIENTE), 0) + 1 AS NUEVO_ID FROM cliente'
    );

    console.log('Resultado: ', result);

    const nuevoIdCliente = result.rows[0][0];
    res.json({ nuevoIdCliente });
  } catch (error) {
    console.error('Error al obtener nuevo ID de cliente:', error);
    res.status(500).json({ error: 'Error al obtener nuevo ID de cliente' });
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error en el servidor');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`El servidor está activo en el puerto ${PORT}`);
});