import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Characters({ navigation }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleDeleteCharacter = (id) => {
    const updatedCharacters = characters.filter((character) => character.id !== id);
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
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

  const handleAddCharacter = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required!');
      return;
    }

    const newCharacter = { id: Date.now().toString(), name, image };
    const updatedCharacters = [...characters, newCharacter];

    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
    setName('');
    setImage(null);
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
    <View style={styles.container}>
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
        <Text style={styles.buttonText}>Add Character</Text>
      </TouchableOpacity>
  
      <Text style={styles.title}>Your Characters</Text>
      
      <FlatList
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
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Return Button */}
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Text style={styles.returnButtonText}>Return</Text>
      </TouchableOpacity>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#008CBA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  characterCard: {
    width: '100%',
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
    backgroundColor: '#FF6347',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  returnButton: {
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
});
