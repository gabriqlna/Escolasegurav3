// Demo users initialization for School Security System
// Matching the Python/Kivy system demo users
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserDocument } from './firebase';

export const DEMO_USERS = {
  admin: {
    email: 'admin@escola.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'direcao' as const,
  },
  student: {
    email: 'aluno@escola.com', 
    password: '123456',
    name: 'Aluno Exemplo',
    role: 'aluno' as const,
  },
  staff: {
    email: 'funcionario@escola.com',
    password: 'func123', 
    name: 'Funcionário Exemplo',
    role: 'funcionario' as const,
  },
} as const;

export const createDemoUsers = async () => {
  console.log('Creating demo users...');
  
  for (const [key, userData] of Object.entries(DEMO_USERS)) {
    try {
      // Try to create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user.uid, {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: true,
      });
      
      console.log(`✅ Demo user created: ${userData.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️ Demo user already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }
  }
};

// Initialize demo users if needed (DISABLED FOR SECURITY)
export const initializeDemoUsers = async () => {
  // SECURITY: Demo users disabled as requested - users must be created by admin
  // if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_USERS === 'true') {
  //   console.log('🔧 Initializing demo users for development...');
  //   await createDemoUsers();
  // }
  console.log('🔒 Demo user initialization disabled for security');
};