import { Router, Request, Response } from 'express';

const router = Router();

interface Item {
  id: string;
  name: string;
}

let items: Item[] = [];

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Estado de salud de la API
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Servidor corriendo correctamente
 */
router.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({ status: 'OK', message: 'Servidor corriendo correctamente' });
});

/**
 * @openapi
 * /api/v1/items:
 *   get:
 *     summary: Obtener todos los elementos
 *     tags:
 *       - Items
 *     responses:
 *       200:
 *         description: Lista de elementos devuelta con éxito
 */
router.get('/items', (req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: items });
});

/**
 * @openapi
 * /api/v1/items:
 *   post:
 *     summary: Crear un nuevo elemento
 *     tags:
 *       - Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Elemento de prueba"
 *     responses:
 *       201:
 *         description: Elemento creado exitosamente
 *       400:
 *         description: El campo name es obligatorio
 */
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

/**
 * @openapi
 * /api/v1/items/{id}:
 *   get:
 *     summary: Obtener un elemento por su ID
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del elemento
 *     responses:
 *       200:
 *         description: Elemento encontrado
 *       404:
 *         description: Elemento no encontrado
 */
router.get('/items/:id', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const item = items.find((element) => element.id === id);

  if (!item) {
    res.status(404).json({ success: false, message: 'Elemento no encontrado' });
    return;
  }

  res.status(200).json({ success: true, data: item });
});

/**
 * @openapi
 * /api/v1/items/{id}:
 *   put:
 *     summary: Actualizar un elemento existente
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del elemento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nombre actualizado"
 *     responses:
 *       200:
 *         description: Elemento actualizado correctamente
 *       404:
 *         description: Elemento no encontrado
 */
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