import express from "express";
import { ProductFileManager } from "../classes/FileManager.js";
import { v4 } from "uuid";
import path from "path";

const productRouter = express.Router();
const productFileManager = new ProductFileManager(
  path.resolve(process.cwd(), "public", "products.json")
);


//Obtener lista completa de productos + limit por query. GET
productRouter.get("/", async (req, res) => {
  try {
    const products = await productFileManager.getAll();
    const limit = req.query.limit;
    let limitPerPage;
    if (limit) {
      limitPerPage = products.slice(0, limit);
    }
    res.send(limitPerPage || products);
  } catch (err) {
    res.status(500).send('Error de servidor, contacte con atencion al cliente.');
  }
});

// Obtener productos por "p+id". GET
productRouter.get("/p:id", async (req, res) => {
  try {

    const id = req.params.id;
    const products = await productFileManager.getAll();
    
    let productoFiltrado= products.find((product)=>product.id==id);
    if(productoFiltrado) {
      res.send(productoFiltrado);
    }else{res.send('<h2>Producto no encontrado, introduzca otro id.</h2>');}
    
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});



//Agregar nuevo producto, id autogenerado por V4 . POST
productRouter.post("/", async (req, res) => {
  const newProduct = {
    id: v4(),
    ...req.body,
  };

  try {
    const products = await productFileManager.getAll();
    await productFileManager.writeAll([...products, newProduct]);
    res.send(newProduct);
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});



//Modificar producto existente, sin cambiar ID. POST
productRouter.put("/p:id", async (req, res) => {
  const { id } = req.params;
  const newProduct = req.body;

  try {
    const products = await productFileManager.getAll();
    const productFindIndex = products.findIndex((product) => product.id == id);
    if (productFindIndex === -1) {
      res.status(404).send("Producto no encontrado, ingrese otro ID");
      return;
    }else{
      products[productFindIndex] = newProduct;
      await productFileManager.writeAll(products);
      res.send(newProduct);
    }
    
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});


//Eliminar producto deseado por "p+id"
productRouter.delete("/p:id", async (req, res) => {
  const { pid } = req.params;

  try {
    const products = await productFileManager.getAll();
    const productFindIndex = products.findIndex((product) => product.id === pid);
    if (productFindIndex === -1) {
      res.status(404).send("Producto no encontrado, ingrese otro ID");
      return;
    }

    products.splice(productFindIndex, 1);
    await productFileManager.writeAll(products);
    res.send("Producto eliminado correctamente");
  } catch (err) {
    res.status(500).send(err.message,'Error de servidor, contacte con atencion al cliente.');
  }
});

export default productRouter;
