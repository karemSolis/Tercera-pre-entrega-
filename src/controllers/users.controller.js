import usersDao from "../DAO/classes/users.dao.js"

const usersDaoInstance = new usersDao();

export const getUsers = async (req, res) => {
    try {
        const result = await usersDaoInstance.getUsers();
        res.status(200).json({ status: "success", result: result });
    } catch (error) {
        console.error("Error en getUsers:", error);
        res.status(500).json({ status: "error", error: "Error al obtener usuarios" });
    }
};

export const getUserById = async (req, res) => {
    const { uid } = req.params;
    try {
        const user = await usersDaoInstance.getUserById(uid);
        res.status(200).json({ status: "success", result: user });
    } catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({ status: "error", error: "Error al obtener usuario por ID" });
    }
};

export const saveUser = async (req, res) => {
    const user = req.body;
    try {
        const result = await usersDaoInstance.addUser(user);
        res.status(200).json({ status: "success", result: result });
    } catch (error) {
        console.error("Error en saveUser:", error);
        res.status(500).json({ status: "error", error: "Error al guardar usuario" });
    }
};
