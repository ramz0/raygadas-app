const oracledb = require('oracledb');

const nombreTablas = async (connection) => {
  return await connection.execute('SELECT table_name FROM user_tables');
}

const seleccionarTabla = async (connection, nombreTabla) => {
  return await connection.execute('SELECT * FROM ' + nombreTabla);
}

const CrearTabla = async (connection, nombreTabla, cantidadCampos) => {
  const dato = '';
  const tipoDeDato = '';

  for (let cantidad = cantidadCampos; cantidad < array.length; cantidad++) {
    const element = array[cantidad];
    
  }
  
  const tablaNueva = await connection.execute('CREATE TABLE ' + nombreTabla);
}
