import express from "express";
import { CartFileManager, ProductFileManager } from "../classes/FileManager.js";
import { v4 } from "uuid";
import path from "path";

const cartRouter = express.Router();
const cartFileManager = new CartFileManager(
  path.resolve(process.cwd(), "public", "carts.json")
);
const productFileManager = new ProductFileManager(
  path.resolve(process.cwd(), "public", "products.json")
);

cartRouter.get("/", async (req, res) => {
  try {
    const carts = await cartFileManager.getAll();
    res.send(carts);
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});

//Ruta raiz con id autogenerado y array vacio de productos. POST
cartRouter.post("/", async (req, res) => {
  const newCart = {
    id: v4(),
    products: [],
  };

  try {
    const carts = await cartFileManager.getAll();
    await cartFileManager.writeAll([...carts, newCart]);
    res.send(newCart);
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});


//Obtener el carrito seleccionando un ID especifico. GET
cartRouter.get("/c:id", async (req, res) => {
  
  try {
    const id = req.params.id;
    const carts = await cartFileManager.getAll();
    let cart = carts.find((cart) => cart.id == id);
    if (cart) {
      res.send(cart);
    }else{
      res.status(404).send('<h2>Carrito no encontrado, introduzca otro id.</h2>');
      return;
    }
    
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});


//Ultima consigna de preentrega. No pude entender como realizarla. Mantuve el ejemplo del profesor hasta pdoer realizarla por mis propios medios.
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const carts = await cartFileManager.getAll();
    const cart = carts.find((cart) => cart.id === cid);
    if (!cart) {
      res.status(404).send('<h2>Carrito no encontrado, introduzca otro id.</h2>');
      return;
    }
    const products = await productFileManager.getAll();
    const product = products.find((product) => product.id === pid);
    if (!product) {
      res.status(404).send('<h2>Producto no encontrado, introduzca otro id.</h2>');
      return;
    }
    const productInCart = cart.products.find((product) => product.id === pid);
    if (productInCart) {
      productInCart.quantity++;
      await cartFileManager.writeAll(carts);
      res.send("Producto agregado al carrito correctamente");
      return;
    } else {
      cart.products.push({ id: pid, quantity: 1 });
      await cartFileManager.writeAll(carts);
      res.send("Producto agregado al carrito correctamente");
      return;
    }
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});


//Metodos delete no pedidos en las consignas, son los creados por el profesor, no evaluarlos.

// cartRouter.delete("/:cid/product/:pid", async (req, res) => {
//   const { pid } = req.params;

//   try {
//     const productInCart = cart.products.find((product) => product.id === pid);
//     if (productInCart) {
//       if (productInCart.quantity > 1) {
//         productInCart.quantity--;
//         await cartFileManager.writeAll(carts);
//         res.send("Producto eliminado del carrito");
//         return;
//       } else {
//         cart.products = cart.products.filter((product) => product.id !== pid);
//         await cartFileManager.writeAll(carts);
//         res.send("Producto eliminado del carrito");
//         return;
//       }
//     } else {
//       res.status(404).send("Producto no encontrado en el carrito");
//       return;
//     }
//   } catch (err) {
//     res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
//   }
// });

// cartRouter.delete("/:cid", async (req, res) => {
//   const { cid } = req.params;

//   try {
//     const carts = await cartFileManager.getAll();
//     const cart = carts.find((cart) => cart.id === cid);
//     if (!cart) {
//       res.status(404).send("Carrito no encontrado");
//       return;
//     }
//     const newCarts = carts.filter((cart) => cart.id !== cid);
//     await cartFileManager.writeAll(newCarts);
//     res.send("Carrito eliminado");
//   } catch (err) {
//     res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
//   }
// });

export default cartRouter;
