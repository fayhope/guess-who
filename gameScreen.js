import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameScreen({ route }) {
  const navigation = useNavigation();
  const { characters = [] } = route.params || {}; // Default to empty array
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isTurnOver, setIsTurnOver] = useState(false);

  const handleSelectCharacter = (characterId) => {
    setSelectedCharacters((prevSelected) =>
      prevSelected.includes(characterId)
        ? prevSelected.filter((id) => id !== characterId)
        : [...prevSelected, characterId]
    );
  };

  const handleRemove = () => {
    setIsTurnOver(true);
    setTimeout(() => {
      setSelectedCharacters([]); // Reset selections
      setIsTurnOver(false); // Allow the next turn
    }, 2000); // Simulated delay
  };

  const handleExit = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guess Who</Text>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        numColumns={5} // Change grid size if needed
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.characterBox,
              selectedCharacters.includes(item.id) && styles.selected,
            ]}
            onPress={() => handleSelectCharacter(item.id)}
            disabled={isTurnOver}
          >
            {item.image && <Image source={{ uri: item.image }} style={styles.characterImage} />}
            <Text style={styles.characterName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
      />
      <TouchableOpacity
        style={[styles.removeButton, isTurnOver && styles.disabledButton]}
        onPress={handleRemove}
        disabled={isTurnOver}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.exitButton}
        onPress={handleExit}
      >
        <Text style={styles.buttonText}>Exit</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    justifyContent: 'center',
  },
  characterBox: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selected: {
    backgroundColor: 'red',
  },
  characterImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginBottom: 5,
  },
  characterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  removeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#008CBA',
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bbb',
  },
  exitButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
