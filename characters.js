import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert, Button, FlatList,
    Image, StyleSheet, Text, TextInput,
    View
} from 'react-native';

export default function Characters() {
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
            <Text>{item.name}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            <Button title="X" onPress={() => handleDeleteCharacter(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 10,
  },
  characterCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});