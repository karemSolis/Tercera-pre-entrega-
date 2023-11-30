
import productModel from "../DAO/models/products.js"
import cartModel from "../DAO/models/cart.js" //se importa modelo de carrito


class BusinessController {
  async addProduct(product) {
    try {
      const newProduct = new productModel.create(product);
      await newProduct.save();
      return "Producto agregado";
    } catch (error) {
      return "No se puede agregar producto";
    }
  }




  async getProducts() {
    try {
      const products = await productModel.find().lean();
      return products;
    } catch (error) {
      return "No se puede obtener producto";
    }
  }

  async getProductById(productId) {
    try {
      const product = await productModel.findById(productId).lean();
      if (!product) return "No se encontró el producto";
      return product;
    } catch (error) {
      return "No se puede obtener producto";
    }
  }

  async updateProduct(productId, product) {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(productId, product, { new: true });
      if (!updatedProduct) return "No se encuentra producto";
      return "Producto actualizado";
    } catch (error) {
      return "Error al actualizar el producto";
    }
  }

  async deleteProduct(productId) {
    try {
      const deletedProduct = await productModel.findByIdAndRemove(productId);
      if (!deletedProduct) return "No se encontró el producto";
      return "Producto eliminado";
    } catch (error) {
      return "No se puede eliminar producto";
    }
  }

  async exist(productId) {
    try {
      const product = await productModel.findById(productId).lean();
      return !!product; 
    } catch (error) {
      return false; 
    }
  }

    async readCarts() { //método readCarts lee todos los carritos de la base de datos
        return await cartModel.find(); 
            
    }

    async exist(cartId) { 
        return await cartModel.findById(cartId); 
    } 

    async addCarts() { /*addCarts es un método que se utiliza para crear un nuevo carrito en la base de datos.*/
        const newCart = await cartModel.create({ products: [] }); 

        return "Carrito Agregado";
    }

    /*Este método se utiliza para obtener un carrito específico de la base de datos según un ID dado, toma de argumento el id que debería ser único del carrito que quiero
    recuperar, llama al método exist(id)para verificar si existe un carrito con ese id en la base de datos, si no se encuentra carrito con ese id devuelve mensaje: "carrito no existe" */
    async getCartsById(cartId) {
        const cart = await this.productManager.exist(cartId);
        if (!cart) return "Carrito no existe";
        return cart;
        
    }


    /*Este método se utiliza para obtener detalles de productos a partir de una lista de IDs de productos.Recibe como argumento productIds, en plural, esto es
    porque busca devolver la lista de todos los carritos */
    async getProductsForCart(productIds) {
        const products = await this.productManager.getProductById(productIds); 

        return products; 
    }

    /*addProductInCart Tiene como propósito agregar un producto a un carrito específico */
    async addProductInCart(cartId, productId) {
        const cart = await this.exist(cartId);
       
        if (!cart) {
            console.log("Carrito no existe");
            return "Carrito no existe";
        }
        // BUSCA EL PRODUCTO en la base de datos con el ID especificado (productId).
        const product = await this.productManager.exist(productId);

        if (!product) {
            console.log("No se encuentra el producto");
            return "No se encuentra el producto"; 
        }

        // COMPRUEBA si el producto ya está presente en el carrito.
        if (cart.products.some((prod) => prod.id.equals(product._id))) { 
            const existingProduct = cart.products.find((prod) => prod.id.equals(productId));
            existingProduct.quantity++;
            await cart.save()
            console.log("Producto sumado en el carrito");
            cart.products.push({ id: productId, quantity: 1 }); 
            await cart.save();
            console.log("Producto en el carrito :)");
        }
        return "Producto agregado al carrito";
    }



}


export default BusinessController;