import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const logUserAction = async (userId: string, actionType: string, details: any = {}) => {
  try {
    // Apunta a una "colección" (tabla) llamada 'user_activity'
    await addDoc(collection(db, 'user_activity'), {
      userId,
      action: actionType,
      details,
      timestamp: serverTimestamp(),
    });
    console.log(`Acción registrada en la BD: ${actionType}`);
  } catch (error) {
    console.error("Error al guardar la acción: ", error);
  }
};