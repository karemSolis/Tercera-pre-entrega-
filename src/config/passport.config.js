
import GitHubStrategy from "passport-github2"
import { createHash, isValidPassword } from "../utils.js"
import passport from "passport"
import local from "passport-local"
import UserManager from "../DAO/manager/UserManager.js"

const localStrategy = local.Strategy
const usersManager = new UserManager(); 
//para recordar, lo que tengo acá es llamado estrategia 1 y se puede autentificar de manera local 

/*Es importante entender que la utentificación por terceros surge por la ncesiddad de agilizar los procesosa a la hora de registrarse en 
cualquier tipo de aplicación, entonces se crea una aplicación para que se conecte a otras aplicaciones, es el caso de google por ejemplo*/
const initializaPassport = () => {
    passport.use('formRegister', new localStrategy({passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {
        const { first_name, last_name, email, age, rol } = req.body;

        try {
            let user = await usersManager.findEmail({ email: username });

            //if (user !== undefined) {
            if (user) {
                console.log("El usuario ya está registrado");
                return done(null, false);
            }

            const hashedPassword = await createHash(password); // Aquí se hashea la contraseña
            const newUser = { first_name, last_name, email, age, rol, password: hashedPassword };

            const result = await usersManager.addUser(newUser);
            if (result === 'Usuario creado correctamente') {
                // Usuario creado con éxito
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return done(error);
        }
    }))



    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await usersManager.getUserById(id)
        done(null, user)
    })

    passport.use('login', new localStrategy({ usernameField: "email" }, async (username, password, done) => {

    try {
        const user = await usersManager.findEmail({ email: username });
        if (!user) {
            console.log("No se encuentra al usuario o no existe");
            return done(null, false);
        }
        

        if (!isValidPassword(user, password)) {
            console.log("La contraseña no es válida");
            return done(null, false);
        }
        

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));


 //_________________ESTRATEGIA DE AUTENTIFICACIÓN DE PASSPORT-GITHUB (GitHubStrategy)________________
         ////Configuración de Passport-GitHub:
     passport.use('github', new GitHubStrategy({ //establece una estrategia de autentificación con el nombre github y crea una nueva instancia de la estrategia de aut.de github
         clientID:"Iv1.1cce9042759205e6", //identificador único de tu app en github
         clientSecret:"ec77c739b76d5d416dd4393f2a970bcdbe1406a3", //clave secreta asociada a mi app de github
         callbackURL:"http://localhost:8080/api/sessions/githubcallback" //la URL a la que GitHub redirigirá después de que un usuario haya autenticado con éxito. //se puede poner cualquier url mientras que corresponda al localhost8080 que es el puerto que estamos usando
        
         ////Manejo de la autenticación:
     }, async(accessToken, refreshToken, profile, done)=>{ //lA FIRMA DE LA FUNCIÓN//es una función asincrónica que maneja la autenticación una vez que GitHub ha devuelto la información del perfil del usuario.
         //accesToken: token de acceso utilizado para realizar acciones en nombre del usuario autentificado, en el contexto de github este token permite a la app realizar operaciones en la cuenta del usuario que ha iniciado sesión.
         //refreshToken: token parobteber un nuevo accessToken cuando el actual expira.
         //profile: objeto que contiene la información del perfil del usuario obtenida en github, el profile.__json.email se usa para acceder al correo electrónico del usuario.
         //done:se utiliza para indicar a passport si la utentificación fue exitosa y proporcionar información sobre el usuario autentificado. 
         try {
             console.log(profile)
         ////Verificación del Usuario:
             let user = await usersManager.findEmail({ email: profile.__json.email }) //busca en la base de datos si ya existe un usuario con la dirección de correo electrónico proporcionada por GitHub.
             if(!user){ //si usuario no existe 
         ////Creación de un Nuevo Usuario:
                 let newUser = { //vamos a crear un nuevo usuario 
                     first_name: profile.__json.name,
                     last_name: "github",
                     age:20,
                     email:profile.__json.email,
                     rol: "admin", //cuando pongo usuario no abre con el botón "ingresar con github"?
                     password:"",

                 }

                 let result = await usersManager.addUser(newUser) //agrega el nuevo usuario a la base de datos.
                 done(null,result) //indica que la autenticación ha tenido éxito y proporciona el resultado (el nuevo usuario) a Passport.
             }
         ////Manejo de Errores:
             else{
                 done(null, user)
             }
         } catch (error) {
             return done(error)
         }
    }))

/*
passport.use('github', new GitHubStrategy({ 
    clientID: "Iv1.1cce9042759205e6", 
    clientSecret: "ec77c739b76d5d416dd4393f2a970bcdbe1406a3",
    callbackURL: "http://localhost:8080/api/sessions/githubcallback"
}, async (accessToken, refreshToken, profile, done) => { 
    try {
        const userEmail = profile?.__json?.email;

        if (!userEmail) {
            // Manejar la falta de correo electrónico en el perfil de GitHub
            console.log("El perfil de GitHub no tiene la propiedad 'email'");
            return done(new Error("No se proporciona un correo electrónico en el perfil de GitHub"));
        }

        let user = await usersManager.findEmail({ email: userEmail });

        if (!user) { 
            console.log(profile);

            let newUser = { 
                first_name: profile.__json.login,
                last_name: "github",
                age: 20,
                email: userEmail,
                rol: "admin", 
                password: "",
            }

            let result = await usersManager.addUser(newUser);
            done(null, result);
        } else {
            done(null, user);
        }
    } catch (error) {
        return done(error);
    }
}));
*/



}

export default initializaPassport

