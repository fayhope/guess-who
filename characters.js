import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Add Character" onPress={handleAddCharacter} />
  
      <Text style={styles.title}>Your Characters</Text>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.characterCard}>
            <Text style={styles.characterName}>{item.name}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.characterImage} />}
            <Button title="Delete" onPress={() => handleDeleteCharacter(item.id)} />
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
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  characterCard: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  characterImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  returnButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#008CBA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  returnButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
