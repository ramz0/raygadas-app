const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'http://localhost:63256', // Reemplaza con el puerto correcto de tu aplicación Dart
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/api/instrumentos', async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: 'raygadas',
      password: 'pass',
      connectString: 'localhost/xe'
    });

    const result = await connection.execute('SELECT * FROM instrumentos');
    const registros = result.rows;
    console.log(registros);
    res.json({ success: true, data: registros });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error de conexión' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
