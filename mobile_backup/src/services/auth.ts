import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';

class AuthService {
  async signIn(data: LoginForm): Promise<ApiResponse<User>> {
    try {
      const { email, password } = data;
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('Usuário está inativo. Entre em contato com a administração.');
      }
      
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate()
      };
      
      return {
        success: true,
        data: user,
        message: 'Login realizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  async signUp(data: RegisterForm): Promise<ApiResponse<User>> {
    try {
      const { email, password, name, role } = data;
      
      // Create user in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const userData = {
        name,
        email,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name,
        role,
        isActive: true,
        createdAt: new Date()
      };
      
      return {
        success: true,
        data: user,
        message: 'Conta criada com sucesso'
      };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      await firebaseSignOut(auth);
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: 'Erro ao fazer logout'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data();
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Email já está em uso';
      case 'auth/weak-password':
        return 'Senha muito fraca. Use pelo menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      default:
        return 'Erro inesperado. Tente novamente';
    }
  }
}

export const authService = new AuthService();