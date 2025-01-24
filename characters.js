import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Contacts from 'react-native-contacts';

export default function Characters({ navigation }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [modalVisible, setModalVisible] = useState(true);

    useEffect(() => {
        loadCharacters();
    }, []);

    const linkContacts = async () => {
      try {
        // Check permission for iOS
        const permission = await Contacts.checkPermission();

        if (permission === 'undefined') {
          const newPermission = await Contacts.requestPermission();
          if (newPermission !== 'authorized') {
            Alert.alert('Permission Denied', 'Please enable contacts permission in settings.');
            return;
          }
        } else if (permission !== 'authorized') {
          Alert.alert('Permission Denied', 'Please enable contacts permission in settings.');
          return;
        }

        // Get contacts if permission is granted
        const contacts = await Contacts.getAll();
        const newCharacters = contacts.map(contact => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: contact.displayName || "Unknown",
          image: contact.image || null,
        }));

        console.log("Characters Linked");

        const updatedCharacters = [...characters, ...newCharacters];
        setCharacters(updatedCharacters);
        saveCharacters(updatedCharacters);

      } catch (error) {
        Alert.alert("Error", "Cannot Link Contacts Now! Try Again Later.");
        console.error("Error linking contacts:", error);
      }
    };


    const handleDeleteCharacter = async (id) => {
        const updatedCharacters = characters.filter((character) => character.id !== id);
        setCharacters(updatedCharacters);
        await saveCharacters(updatedCharacters);
    };

    const loadCharacters = async () => {
        try {
            const storedCharacters = await AsyncStorage.getItem('characters');
            if (storedCharacters) {
                setCharacters(JSON.parse(storedCharacters));
            }
        } catch (error) {
            console.error('Failed to load characters', error);
        }
    };

    const saveCharacters = async (newCharacters) => {
        try {
            await AsyncStorage.setItem('characters', JSON.stringify(newCharacters));
        } catch (error) {
            console.error('Failed to save characters', error);
        }
    };

    const handleAddCharacter = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required!');
            return;
        }

        const newCharacter = { id: Date.now().toString(), name, image };
        const updatedCharacters = [...characters, newCharacter];

        setCharacters(updatedCharacters);
        await saveCharacters(updatedCharacters);
        setName('');
        setImage(null);
        setModalVisible(false);
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access media is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Your Characters</Text>
            <FlatList
                style={styles.characterContainer}
                data={characters}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.characterCard}>
                        <Text style={styles.characterName}>{item.name}</Text>
                        {item.image && <Image source={{ uri: item.image }} style={styles.characterImage} />}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteCharacter(item.id)}
                        >
                            <Text style={styles.deleteButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
                numColumns={3}
            />
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Add Character</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => linkContacts()}>
                <Text style={styles.buttonText}>Link Contacts</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Create a Character</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter character name"
                            value={name}
                            onChangeText={setName}
                        />
                        <TouchableOpacity style={styles.button} onPress={pickImage}>
                            <Text style={styles.buttonText}>Pick an Image</Text>
                        </TouchableOpacity>
                        {image && <Image source={{ uri: image }} style={styles.image} />}
                        <TouchableOpacity style={styles.button} onPress={handleAddCharacter}>
                            <Text style={styles.buttonText}>Save Character</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
      
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    display: "flex",
    flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  contactButton: {
    backgroundColor: '#008CBA',
    borderRadius: 30,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    padding: '4%',
  },
  characterContainer: {
    width: '90%',
    alignContent: "center", 
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  characterCard: {
    width: '30%',
    padding: 20,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  characterImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#008CBA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    marginTop: '75%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
    borderBlockColor: "#000000",
    borderRadius: 30,
    borderWidth: 2,
  }
});