/*import { PORT } from './config.js'*/

require('dotenv').config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./config');
const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
/*const session = require('express-session');*/
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
/*const bcrypt = require('bcrypt');*/




//Configuracion inicial
const app = express();



//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('frontend')); //Para importar la pagina al servidor
/*app.use(session({
    secret: process.env.SESSION_SECRET || 'claveSecreta',
    resave: false,
    saveUninitialized: true
}));*/


// Configura la conexión con la base de datos
const db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,         // Ajusta el usuario
    password: DB_PASSWORD, // Ajusta la contraseña
    database: DB_NAME  // Ajusta el nombre de la base de datos
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conexión a la base de datos establecida.');
});





//Rutas
app.delete('/api/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    const razonCancelacion = req.body.razon || 'Pedido cancelado por el cliente'; // Obtener razón de cancelación

    const selectPedidoQuery = 'SELECT * FROM pedidos WHERE id = ?';
    const selectPlatilloQuery = 'SELECT nombre FROM subcategorias WHERE id = ?';
    const deletePedidoQuery = 'DELETE FROM pedidos WHERE id = ?';
    const insertCancelQuery = `
        INSERT INTO pedidos_cancelados (id_subcategoria, nombre_platillo, nombre_cliente, cantidad, total, razon_cancelacion)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Paso 1: Obtener los detalles del pedido
    db.query(selectPedidoQuery, [pedidoId], (err, pedidoResults) => {
        if (err) {
            console.error('Error al buscar el pedido:', err);
            return res.status(500).json({ success: false, message: 'Error al buscar el pedido.' });
        }

        if (pedidoResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
        }

        const pedido = pedidoResults[0];

        // Paso 2: Obtener el nombre del platillo (subcategoría) relacionado
        db.query(selectPlatilloQuery, [pedido.id_subcategoria], (err, platilloResults) => {
            if (err) {
                console.error('Error al buscar el platillo:', err);
                return res.status(500).json({ success: false, message: 'Error al buscar el platillo.' });
            }

            if (platilloResults.length === 0) {
                return res.status(404).json({ success: false, message: 'Platillo no encontrado.' });
            }

            const nombrePlatillo = platilloResults[0].nombre;

            // Paso 3: Insertar el pedido cancelado en la tabla `pedidos_cancelados`
            db.query(insertCancelQuery, [
                pedido.id_subcategoria,
                nombrePlatillo,
                pedido.nombre_cliente,
                pedido.cantidad,
                pedido.total,
                razonCancelacion
            ], (err) => {
                if (err) {
                    console.error('Error al mover el pedido a pedidos_cancelados:', err);
                    return res.status(500).json({ success: false, message: 'Error al mover el pedido a pedidos_cancelados.' });
                }

                // Paso 4: Eliminar el pedido de `pedidos`
                db.query(deletePedidoQuery, [pedidoId], (err) => {
                    if (err) {
                        console.error('Error al eliminar el pedido:', err);
                        return res.status(500).json({ success: false, message: 'Error al eliminar el pedido.' });
                    }

                    res.status(200).json({ success: true, message: 'Pedido cancelado y movido a pedidos_cancelados.' });
                });
            });
        });
    });
});




app.post('/api/pedidos', (req, res) => {
    const { id_subcategoria, nombre_cliente, cantidad, total } = req.body;

    // Consulta SQL para insertar el pedido
    const query = `
        INSERT INTO pedidos (id_subcategoria, nombre_cliente, cantidad, total)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [id_subcategoria, nombre_cliente, cantidad, total], (err, result) => {
        if (err) {
            console.error('Error al insertar el pedido: ', err);
            return res.status(500).json({ success: false, message: 'Error al realizar el pedido.' });
        }

        // Crear un objeto para el ticket
        const ticket = {
            id_pedido: result.insertId,
            nombre_cliente: nombre_cliente,
            cantidad: cantidad,
            total: total,
            nombre_platillo: req.body.nombre_platillo  // Asegúrate de enviar este campo desde el frontend
        };

        res.status(200).json({ success: true, ticket: ticket, message: 'Pedido realizado con éxito.' });
    });
});


//Ruta para los mensajes de contacto
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Insertar datos en la base de datos (opcional)
    const query = 'INSERT INTO mensajes (nombre, correo, mensaje) VALUES (?, ?, ?)';
    db.query(query, [name, email, message], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al guardar el mensaje.' });
        }
        
        // Configuración de Nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,       
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,  // Tu correo (para autenticar el servidor)
                pass: process.env.EMAIL_PASS   // Contraseña de tu correo o token de aplicación
            }
        });
        
        // Configuración del correo
        const mailOptions = {
            from: email,  // Usar el correo del formulario como remitente
            to: process.env.EMAIL_RESTAURANT,  // Correo donde recibes el mensaje
            subject: `Nuevo mensaje de ${name}`,  // Asunto del correo
            text: message  // Contenido del mensaje
        };
        
        // Enviar correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error al enviar el correo.' });
            }
            res.json({ message: 'Mensaje enviado exitosamente.' });
        });
    });
});

//Ruta categorias
app.get('/api/categorias', (req, res) => {
    const query = `
    SELECT id, nombre, descripcion, imagen 
    FROM categorias
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener las categorías' });
        }
        res.json(results);
    });
});

//Ruta subcategorias
app.get('/api/subcategorias', (req, res) => {
    const categoriaId = req.query.categoria;
    
    const query = `
    SELECT id, nombre, descripcion, precio, imagen 
    FROM subcategorias 
    WHERE id_categoria = ?
    `;
    
    db.query(query, [categoriaId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener las subcategorías' });
        }
        res.json(results);
    });
});

app.post('/guardar-reservacion', (req, res) => {
    const { nombre_cliente, fecha_reservacion, cantidad_personas, telefono_cliente, correo_cliente } = req.body;

    const query = `
        INSERT INTO reservaciones (nombre_cliente, fecha_reservacion, cantidad_personas, telefono_cliente, correo_cliente)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [nombre_cliente, fecha_reservacion, cantidad_personas, telefono_cliente, correo_cliente], (err, result) => {
        if (err) {
            console.error('Error al guardar la reservación:', err);
            return res.status(500).json({ success: false, message: 'Error al guardar la reservación.' });
        }
        res.status(200).json({ success: true, message: 'Reservación guardada con éxito.', id: result.insertId });
    });
});

app.delete('/cancelar-reservacion/:id', (req, res) => {
    const reservacionId = req.params.id;

    // Selecciona los datos de la reservación
    const selectQuery = 'SELECT * FROM reservaciones WHERE id = ?';
    const insertQuery = `
        INSERT INTO reservaciones_canceladas (id, nombre_cliente, fecha_reservacion, cantidad_personas, telefono_cliente, correo_cliente)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const deleteQuery = 'DELETE FROM reservaciones WHERE id = ?';

    db.query(selectQuery, [reservacionId], (err, result) => {
        if (err) {
            console.error('Error al buscar la reservación:', err);
            return res.status(500).json({ success: false, message: 'Error al buscar la reservación.' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada.' });
        }

        const reservacion = result[0];

        // Inserta la reservación en la tabla de canceladas
        db.query(insertQuery, [
            reservacion.id,
            reservacion.nombre_cliente,
            reservacion.fecha_reservacion,
            reservacion.cantidad_personas,
            reservacion.telefono_cliente,
            reservacion.correo_cliente,
        ], (err) => {
            if (err) {
                console.error('Error al mover la reservación a canceladas:', err);
                return res.status(500).json({ success: false, message: 'Error al registrar la cancelación.' });
            }

            // Elimina la reservación original
            db.query(deleteQuery, [reservacionId], (err) => {
                if (err) {
                    console.error('Error al eliminar la reservación:', err);
                    return res.status(500).json({ success: false, message: 'Error al eliminar la reservación.' });
                }

                res.status(200).json({ success: true, message: 'Reservación cancelada con éxito.' });
            });
        });
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Servidor iniciado.');
});