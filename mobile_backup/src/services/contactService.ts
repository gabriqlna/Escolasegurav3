import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { Contact, UserFavorite } from '@/types';

export class ContactService {
  private static readonly COLLECTION = 'contacts';
  private static readonly FAVORITES_COLLECTION = 'userFavorites';

  static async createContact(contactData: Omit<Contact, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.COLLECTION), {
      ...contactData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteContact(id: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await deleteDoc(docRef);
  }

  static async toggleContactActive(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  }

  static subscribeToContacts(
    category?: string,
    onlyActive: boolean = true,
    callback?: (contacts: Contact[]) => void
  ) {
    let q = query(collection(db, this.COLLECTION));

    if (onlyActive) {
      q = query(q, where('isActive', '==', true));
    }

    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    q = query(q, orderBy('name', 'asc'));

    return onSnapshot(q, (snapshot: any) => {
      const contacts: Contact[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Contact));
      
      callback?.(contacts);
    });
  }

  static subscribeToAllContacts(callback?: (contacts: Contact[]) => void) {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('category', 'asc'),
      orderBy('name', 'asc')
    );

    return onSnapshot(q, (snapshot: any) => {
      const contacts: Contact[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Contact));
      
      callback?.(contacts);
    });
  }

  static async getContact(id: string): Promise<Contact | null> {
    const docRef = doc(db, this.COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Contact;
    }
    
    return null;
  }

  static async searchContacts(searchTerm: string, filters?: {
    category?: string;
    isActive?: boolean;
    emergencyOnly?: boolean;
  }): Promise<Contact[]> {
    let q = query(collection(db, this.COLLECTION));

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    if (filters?.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.emergencyOnly) {
      q = query(q, where('emergencyOnly', '==', true));
    }

    const snapshot = await getDocs(q);
    const contacts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Contact));

    // Filtrar por termo de busca localmente
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return contacts.filter((contact: any) => 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.role.toLowerCase().includes(searchLower) ||
        contact.department?.toLowerCase().includes(searchLower) ||
        contact.phone?.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchLower)
      );
    }

    return contacts;
  }

  static async getEmergencyContacts(): Promise<Contact[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('emergencyOnly', '==', true),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Contact));
  }

  static async getContactsByCategory(category: string): Promise<Contact[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Contact));
  }

  // Favoritos do usuário
  static async addToFavorites(userId: string, contactId: string): Promise<void> {
    const favoriteRef = doc(db, this.FAVORITES_COLLECTION, `${userId}_contacts`);
    await setDoc(favoriteRef, {
      userId,
      contactIds: arrayUnion(contactId),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  static async removeFromFavorites(userId: string, contactId: string): Promise<void> {
    const favoriteRef = doc(db, this.FAVORITES_COLLECTION, `${userId}_contacts`);
    await setDoc(favoriteRef, {
      contactIds: arrayRemove(contactId),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  static subscribeToUserFavorites(
    userId: string,
    callback?: (favoriteContactIds: string[]) => void
  ) {
    const favoriteRef = doc(db, this.FAVORITES_COLLECTION, `${userId}_contacts`);

    return onSnapshot(favoriteRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback?.(data.contactIds || []);
      } else {
        callback?.([]);
      }
    });
  }

  static async getUserFavoriteContacts(userId: string): Promise<Contact[]> {
    const favoriteRef = doc(db, this.FAVORITES_COLLECTION, `${userId}_contacts`);
    const favoriteSnap = await getDoc(favoriteRef);
    
    if (!favoriteSnap.exists()) return [];
    
    const favoriteData = favoriteSnap.data();
    const contactIds = favoriteData.contactIds || [];
    
    if (contactIds.length === 0) return [];

    // Buscar todos os contatos favoritos
    const contacts: Contact[] = [];
    for (const contactId of contactIds) {
      const contact = await this.getContact(contactId);
      if (contact && contact.isActive) {
        contacts.push(contact);
      }
    }

    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Validação de contatos
  static validatePhone(phone: string): boolean {
    // Regex básico para telefone brasileiro
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizePhone(phone: string): string {
    // Remove todos os caracteres não numéricos exceto +
    return phone.replace(/[^\d+]/g, '');
  }

  static formatPhone(phone: string): string {
    const sanitized = this.sanitizePhone(phone);
    
    // Se começar com +55, é telefone brasileiro
    if (sanitized.startsWith('+55')) {
      const number = sanitized.substring(3);
      if (number.length === 11) {
        // Celular: (XX) 9XXXX-XXXX
        return `+55 (${number.substring(0, 2)}) ${number.substring(2, 7)}-${number.substring(7)}`;
      } else if (number.length === 10) {
        // Fixo: (XX) XXXX-XXXX
        return `+55 (${number.substring(0, 2)}) ${number.substring(2, 6)}-${number.substring(6)}`;
      }
    }
    
    return phone; // Retorna original se não conseguir formatar
  }

  // Ações de contato seguras
  static async logContactAction(contactId: string, userId: string, action: 'call' | 'message' | 'email'): Promise<void> {
    const logRef = doc(collection(db, 'contactLogs'));
    await setDoc(logRef, {
      contactId,
      userId,
      action,
      timestamp: serverTimestamp(),
    });
  }

  static generateSafeWhatsAppUrl(phone: string, message?: string): string {
    const cleanPhone = this.sanitizePhone(phone).replace('+', '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  }

  static generateSafeCallUrl(phone: string): string {
    const cleanPhone = this.sanitizePhone(phone);
    return `tel:${cleanPhone}`;
  }

  static generateSafeEmailUrl(email: string, subject?: string, body?: string): string {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    
    const queryString = params.toString();
    return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
  }
}