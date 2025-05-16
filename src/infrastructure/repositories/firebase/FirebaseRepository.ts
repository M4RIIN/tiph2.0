import { Repository } from '@/domain/repositories/Repository';
import { db } from '@/infrastructure/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';

export abstract class FirebaseRepository<T> implements Repository<T> {
  protected abstract collectionName: string;

  // Convert Firestore data to domain entity
  protected abstract fromFirestore(data: DocumentData, id: string): T;

  // Convert domain entity to Firestore data
  protected abstract toFirestore(entity: T): DocumentData;

  // Helper method to convert Date objects to Firestore Timestamps
  protected convertDatesToTimestamps(data: Record<string, unknown>): Record<string, unknown> {
    const result = { ...data };

    for (const key in result) {
      if (result[key] instanceof Date) {
        result[key] = Timestamp.fromDate(result[key] as Date);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.convertDatesToTimestamps(result[key] as Record<string, unknown>);
      }
    }

    return result;
  }

  // Helper method to convert Firestore Timestamps to Date objects
  protected convertTimestampsToDates(data: Record<string, unknown>): Record<string, unknown> {
    const result = { ...data };

    for (const key in result) {
      if (result[key] instanceof Timestamp) {
        result[key] = (result[key] as Timestamp).toDate();
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.convertTimestampsToDates(result[key] as Record<string, unknown>);
      }
    }

    return result;
  }

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return this.fromFirestore(docSnap.data(), docSnap.id);
    }

    return null;
  }

  async create(entity: T): Promise<T> {
    const data = this.toFirestore(entity);
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return this.fromFirestore({ ...data, id: docRef.id }, docRef.id);
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    const data = this.convertDatesToTimestamps(entity);

    await updateDoc(docRef, data);

    const updatedDoc = await getDoc(docRef);
    return this.fromFirestore(updatedDoc.data()!, updatedDoc.id);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
