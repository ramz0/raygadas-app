const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

// Configuración de la base de datos Oracle
const dbConfig = {
  user: 'prueba',
  password: '1212',
  connectString: 'localhost:1521/XE'
};

// Función para conectar a la base de datos
async function connectToDB() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión establecida a Oracle Database');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Ruta GET para obtener datos desde la base de datos
app.get('/', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const result = await connection.execute('SELECT * FROM instrumentos');
    if (!result.rows || result.rows.length === 0) {
      res.status(404).send('No se encontraron datos');
    } else {
      res.json(result.rows);
      console.log('Resultados de la consulta:', result.rows);
    }
  } catch (error) {
    console.error('Error al obtener datos desde la base de datos:', error);
    res.status(500).send('Error al obtener datos desde la base de datos');
  } finally {
    if (connection) {
      try {
        await connection.close(); // Cerrar la conexión después de la operación
      } catch (error) {
        console.error('Error al cerrar la conexión:', error);
      }
    }
  }
});

// Ruta POST para insertar datos en la base de datos
app.post('/registro', async (req, res) => {
  const { nombre, precio, descripcion } = req.body; // Obtener datos del cuerpo de la solicitud
  
  console.log('Datos recibidos:', { nombre, precio, descripcion });

  let connection;
  try {
    connection = await connectToDB();
    const result = await connection.execute(
      `INSERT INTO instrumentos (nombre_instrumento, precio, descripcion) VALUES (:nombre, :precio, :descripcion)`,
      [nombre, precio, descripcion]
    );
    res.status(200).send('Registro exitoso');
  } catch (error) {
    console.error('Error al registrar instrumento:', error);
    res.status(500).send('Error al registrar instrumento');
  } finally {
    if (connection) {
      try {
        await connection.close(); // Cerrar la conexión después de la operación
      } catch (error) {
        console.error('Error al cerrar la conexión:', error);
      }
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`El servidor está activo en el puerto ${PORT}`);
});

module.exports = app; // Exportar la aplicación para su uso en otro archivo si es necesario
