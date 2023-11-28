import express from "express"; 
import { engine } from "express-handlebars"; 
import mongoose from "mongoose";
import MongoStore from "connect-mongo"
import session from 'express-session'
import FileStore from 'session-file-store'
import passport from "passport";
import * as path from "path" 

import ProductManager from "./DAO/manager/ProductManager.js";
import CartManager from "./DAO/manager/CartManager.js";
import UserManager from "./DAO/manager/UserManager.js";

import userRouter from "./router/users.routes.js";
import productRouter from "./router/product.routes.js";
import CartRouter from "./router/cart.routes.js";
import jwtEstrategy from "./router/jwt.routes.js";

import initializaPassport from "./config/passport.config.js"; 
import __dirname from "./utils.js"; 

import config from "./config/config.js";


const app = express(); 

const product = new ProductManager();
const carts = new CartManager();
//const userManager = new UserManager();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//---------------------------------------------------------------

app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
});

mongoose.connect(config.mongoUrl)
.then(()=> {
  console.log("Conectado a atlas")
})
.catch(error => {
  console.error("No se puede conectar con Atlas, error"+ error)
})


const sessionOptions = {
  store: new MongoStore({
    mongoUrl: process.env.SESSION_MONGO_URL,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    ttl: 600
  }),
  secret: process.env.SESSION_SECRET,
  resave: process.env.SESSION_RESAVE === 'true',
  saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === 'true',
  cookie: {
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) || 86400000,
  },
};

app.use(session(sessionOptions));


//passport.config
(initializaPassport())
app.use(passport.initialize())
app.use(passport.session())


//ENRUTADORES. 
app.use("/api/productos", productRouter) 
app.use("/api/carritos", CartRouter); /*ESTABLECE UNA RUTA BASE Y REDIRIGE A CARTROUTES*/
app.use("/api/sessions", userRouter)/*ESTABLECE UNA RUTA BASE Y REDIRIGE A USERROUTES*/
app.use("/api/jwt", jwtEstrategy)

//HANDLEBARS
app.engine("handlebars", engine());  /*acá le digo al servidor que usaremos M.P.handlebars para el uso de express y que será a
través de engine()*/
app.set("view engine", "handlebars"); /*acá le digo al server que los archivos de view terminaran con la extensión .handlebars, se establece la vista
como handlebars, eso significa que express usará handlebars para renderizar las vistas*/
app.set("views", path.resolve(__dirname + "/views")); /*y además obvio debo decirle donde encontrar esos archivos, estableciendo la ubicación de las vistas
es una ruta absoluta al directorio de vistas que utiliza __dirname que he importado desde utils.js, así que express buscará en ese directorio las*/
//middleware para archivos estáticos

//css
app.use("/", express.static(__dirname + "/public")) /*con __dirname le índico que en puclic estarán los archivos estáticos como el 
style.css y realtimeproduct.js dentro de public*/

//---------------------------------------------------------------------------------------------------------------------//

/*DEFINICIÓN DE RUTAS DE MI APP Y ESPECIFICACIÓN DE RESPUESTAS A LAS SOLICITUDES HTTP EN CADA RUTA */
app.get("/products", async (req, res) => { /*RESPONDE A UNA SOLICITUD GET EN LA URL /PRODUCTS. /IMPORTANTE RECORDAD QUE REQ Y RES SON OBJETOS
ESTAS SE USAN PARA MANEJAR SOLICITUDES Y RESPUESTAS HTTP: REQ (REQUEST)-REPRESENTA LA SOLICITUD Y RES(RESPONSE)-REPRESENTA LA RESPUESTA A
DICHA SOLICITUD.Cuando un cliente (como un navegador) envía una solicitud GET a la URL "/products", esta ruta se activará y el controlador 
que sigue a continuación se ejecutará para manejar la solicitud.*/
  if (req.session.emailUsuario) { /*Esta parte del código verifica si existe una sesión activa para el usuario. El objeto req representa la 
  solicitud http entrante y contien información, incluida la sessión del usuario si existe, así q si req.session.emailUsuario es verdadero
  el usuario tiene una sessión activada, osea está registrado :P*/
  res.redirect("/login");

    let products = await product.getProducts(); /*En esta línea se obtienen los productos utilizando la función getProducts del objeto products*/
    res.render("products", { /*Se renderiza la vista products y se envía al cliente como respuesta, esta se compone de un objeto que contiene 
    información que se utilizara en la vista y se muestra a los usuarios*/
      title: "Productos",
      products: products,
      email: req.session.emailUsuario,
      rol: req.session.rolUsuario, 
    });
  }
});

//-----------------------------------------------------------------

app.get("/products/:id", async (req, res) => { 
  const productId = req.params.id;
  const products = await product.getProductById(productId);
  res.render("details", { products });
});

//-----------------------------------------------------------------

app.get("/carts", async (req, res) => {
  const cart = await carts.readCarts(); 
  const productsInCart = await carts.getProductsForCart(cart.products); 
  console.log("Datos del carrito:", cart);
  res.render("carts", { cart, productsInCart });
});
//RECORDAR INTEGRAR EL TEMA DE ID A ESTE MIDDLEWARS
//-----------------------------------------------------------------

app.get("/login", (req, res) => {
  // Renderiza la vista de inicio de sesión
  res.render("./login", {
    title: "Iniciar Sesión"
  });
});
//-----------------------------------------------------------------

app.get('/faillogin', (req, res) => {
  res.send('Autenticación fallida. Por favor, verifica tus credenciales.');
});


//-----------------------------------------------------------------

app.get("/formRegister", (req, res) => {
  // Renderiza la vista de registro
  res.render("formRegister", {
    title: "Registro"
    
  });
});

//--------------------------------------------------------------------


app.get('/failformRegister', (req, res) => {
  res.status(400).send('Error en el registro. El usuario ya está registrado.');
});


//------------------------------------------------------------------

app.get("/userProfile", async (req, res) => { 
  if (!req.session.emailUsuario) 
  {
      return res.redirect("/login")
  }
  res.render("userProfile", {
      title: "Vista Perfil Usuario",
      first_name: req.session.nomUsuario,
      last_name: req.session.apeUsuario,
      email: req.session.emailUsuario,
      rol: req.session.rolUsuario,

  });
})

//-------------------------------------------------------------------

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
      if (error) {
          return res.json({ status: 'Cerrar sesión Error', body: error });
      }
      res.redirect('/login'); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
  });
});








