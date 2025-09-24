import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Contact } from '@/types';

const CONTACT_CATEGORIES = [
  { 
    id: 'emergency', 
    label: 'Emergência', 
    icon: 'warning', 
    color: '#FF3B30',
    description: 'Números de emergência essenciais'
  },
  { 
    id: 'internal', 
    label: 'Escola', 
    icon: 'school', 
    color: '#007AFF',
    description: 'Contatos internos da escola'
  },
  { 
    id: 'health', 
    label: 'Saúde', 
    icon: 'medical', 
    color: '#34C759',
    description: 'Postos de saúde e hospitais'
  },
  { 
    id: 'security', 
    label: 'Segurança', 
    icon: 'shield-checkmark', 
    color: '#AF52DE',
    description: 'Polícia e segurança pública'
  },
  { 
    id: 'external', 
    label: 'Externos', 
    icon: 'business', 
    color: '#FF9500',
    description: 'Outros contatos importantes'
  },
];

const ContactCard = ({ 
  contact, 
  onCall, 
  onMessage 
}: { 
  contact: Contact; 
  onCall: (phone: string) => void;
  onMessage: (phone: string) => void;
}) => {
  const category = CONTACT_CATEGORIES.find(cat => cat.id === contact.category);
  
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={[styles.contactIcon, { backgroundColor: category?.color || '#8E8E93' }]}>
          <Ionicons 
            name={category?.icon as any || 'person'} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRole}>{contact.role}</Text>
          {contact.department && (
            <Text style={styles.contactDepartment}>{contact.department}</Text>
          )}
        </View>
        {contact.emergencyOnly && (
          <View style={styles.emergencyBadge}>
            <Text style={styles.emergencyText}>URGENTE</Text>
          </View>
        )}
      </View>

      {(contact.phone || contact.email) && (
        <View style={styles.contactActions}>
          {contact.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onCall(contact.phone!)}
              data-testid={`call-${contact.id}`}
            >
              <Ionicons name="call" size={20} color="#007AFF" />
              <Text style={styles.actionText}>Ligar</Text>
            </TouchableOpacity>
          )}
          
          {contact.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onMessage(contact.phone!)}
              data-testid={`message-${contact.id}`}
            >
              <Ionicons name="chatbubble" size={20} color="#34C759" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          
          {contact.email && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Linking.openURL(`mailto:${contact.email}`)}
              data-testid={`email-${contact.id}`}
            >
              <Ionicons name="mail" size={20} color="#FF9500" />
              <Text style={styles.actionText}>E-mail</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const CategorySection = ({ 
  category, 
  contacts, 
  onCall, 
  onMessage 
}: {
  category: any;
  contacts: Contact[];
  onCall: (phone: string) => void;
  onMessage: (phone: string) => void;
}) => (
  <View style={styles.categorySection}>
    <View style={styles.categoryHeader}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        <Ionicons name={category.icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{category.label}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <Text style={styles.categoryCount}>{contacts.length}</Text>
    </View>
    
    {contacts.map((contact) => (
      <ContactCard
        key={contact.id}
        contact={contact}
        onCall={onCall}
        onMessage={onMessage}
      />
    ))}
  </View>
);

export default function ContactsScreen() {
  const { user, hasPermission } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const canManageContacts = hasPermission('manage_contacts');

  // Mock data - substituir por chamadas de API reais
  const mockContacts: Contact[] = [
    // Emergência
    {
      id: '1',
      name: 'Polícia Militar',
      role: 'Emergência',
      phone: '190',
      emergencyOnly: true,
      isActive: true,
      category: 'emergency',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Corpo de Bombeiros',
      role: 'Emergência',
      phone: '193',
      emergencyOnly: true,
      isActive: true,
      category: 'emergency',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'SAMU',
      role: 'Emergência Médica',
      phone: '192',
      emergencyOnly: true,
      isActive: true,
      category: 'emergency',
      createdAt: new Date(),
    },
    // Escola
    {
      id: '4',
      name: 'Direção',
      role: 'Diretor(a)',
      department: 'Administração',
      phone: '(11) 3456-7890',
      email: 'direcao@escola.edu.br',
      emergencyOnly: false,
      isActive: true,
      category: 'internal',
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'Secretaria',
      role: 'Atendimento',
      department: 'Secretaria',
      phone: '(11) 3456-7891',
      email: 'secretaria@escola.edu.br',
      emergencyOnly: false,
      isActive: true,
      category: 'internal',
      createdAt: new Date(),
    },
    {
      id: '6',
      name: 'Portaria Principal',
      role: 'Segurança',
      department: 'Portaria',
      phone: '(11) 3456-7892',
      emergencyOnly: false,
      isActive: true,
      category: 'internal',
      createdAt: new Date(),
    },
    // Saúde
    {
      id: '7',
      name: 'Hospital São Paulo',
      role: 'Hospital',
      phone: '(11) 2345-6789',
      emergencyOnly: false,
      isActive: true,
      category: 'health',
      createdAt: new Date(),
    },
    {
      id: '8',
      name: 'UBS Vila Nova',
      role: 'Posto de Saúde',
      phone: '(11) 2345-6788',
      emergencyOnly: false,
      isActive: true,
      category: 'health',
      createdAt: new Date(),
    },
    // Segurança
    {
      id: '9',
      name: 'Guarda Municipal',
      role: 'Segurança Pública',
      phone: '153',
      emergencyOnly: false,
      isActive: true,
      category: 'security',
      createdAt: new Date(),
    },
  ];

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         contact.role.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || contact.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly; // Implementar favoritos futuramente
    return matchesSearch && matchesCategory && matchesFavorites && contact.isActive;
  });

  const groupedContacts = CONTACT_CATEGORIES.map(category => ({
    ...category,
    contacts: filteredContacts.filter(contact => contact.category === category.id)
  })).filter(group => group.contacts.length > 0);

  const handleCall = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível fazer a ligação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao tentar fazer a ligação');
    }
  };

  const handleMessage = async (phone: string) => {
    try {
      // Remove formatação do telefone para WhatsApp
      const cleanPhone = phone.replace(/\D/g, '');
      const url = `whatsapp://send?phone=55${cleanPhone}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback para SMS
        const smsUrl = `sms:${phone}`;
        await Linking.openURL(smsUrl);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar mensagem');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📞 Contatos Úteis</Text>
        <Text style={styles.subtitle}>
          Números importantes e contatos de emergência
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar contatos..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
            data-testid="search-contacts"
          />
        </View>
      </View>

      {/* Quick Emergency Access */}
      {searchText === '' && !selectedCategory && (
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🚨 Emergência</Text>
          <View style={styles.emergencyNumbers}>
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => handleCall('190')}
              data-testid="emergency-police"
            >
              <Ionicons name="shield" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>190</Text>
              <Text style={styles.emergencyButtonLabel}>Polícia</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: '#FF9500' }]}
              onPress={() => handleCall('193')}
              data-testid="emergency-fire"
            >
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>193</Text>
              <Text style={styles.emergencyButtonLabel}>Bombeiros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: '#34C759' }]}
              onPress={() => handleCall('192')}
              data-testid="emergency-medical"
            >
              <Ionicons name="medical" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>192</Text>
              <Text style={styles.emergencyButtonLabel}>SAMU</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(null)}
          data-testid="category-filter-all"
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === null && styles.categoryChipTextActive
          ]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        {CONTACT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
            data-testid={`category-filter-${category.id}`}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? '#FFFFFF' : category.color}
              style={styles.categoryChipIcon}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contacts List */}
      <ScrollView 
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      >
        {groupedContacts.map((group) => (
          <CategorySection
            key={group.id}
            category={group}
            contacts={group.contacts}
            onCall={handleCall}
            onMessage={handleMessage}
          />
        ))}

        {groupedContacts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Nenhum contato encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Tente alterar os filtros de busca
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  emergencySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  emergencyNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emergencyButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  emergencyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emergencyButtonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  categoryFilter: {
    marginBottom: 8,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipIcon: {
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  contactsList: {
    flex: 1,
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  contactCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contactDepartment: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emergencyBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emergencyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#1C1C1E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});