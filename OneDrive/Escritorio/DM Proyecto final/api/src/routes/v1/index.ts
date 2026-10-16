import { Router, Request, Response } from 'express';

const router = Router();

// Modelo de datos para pruebas
interface Item {
  id: string;
  name: string;
}

let items: Item[] = [];

// 1. Ruta GET: Estado de salud de la API
router.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({ status: 'OK', message: 'Servidor corriendo correctamente' });
});

// 2. Ruta GET: Obtener todos los elementos
router.get('/items', (req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: items });
});

// 3. Ruta GET: Obtener un elemento por su ID
router.get('/items/:id', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const item = items.find((element) => element.id === id);

  if (!item) {
    res.status(404).json({ success: false, message: 'Elemento no encontrado' });
    return;
  }

  res.status(200).json({ success: true, data: item });
});

// 4. Ruta POST: Crear un nuevo elemento
router.post('/items', (req: Request, res: Response): void => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'El campo name es obligatorio' });
    return;
  }

  const newItem: Item = {
    id: (items.length + 1).toString(),
    name,
  };

  items.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// 5. Ruta PUT: Actualizar o establecer un elemento existente
router.put('/items/:id', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const { name } = req.body;

  const itemIndex = items.findIndex((element) => element.id === id);

  if (itemIndex === -1) {
    res.status(404).json({ success: false, message: 'Elemento no encontrado' });
    return;
  }

  items[itemIndex] = { id, name };
  res.status(200).json({ success: true, data: items[itemIndex] });
});

export default router;