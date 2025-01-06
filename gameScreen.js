import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { db } from './firebaseConfig';

export default function GameScreen({ route }) {
  const { gameCode } = route.params;
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const gameRef = doc(db, 'games', gameCode);
        const gameSnapshot = await getDoc(gameRef);

        if (gameSnapshot.exists()) {
          const gameData = gameSnapshot.data();
          setCharacters(gameData.selectedCharacters || []);  // Fetch selected characters
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [gameCode]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading characters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Started!</Text>
      <Text style={styles.subtitle}>Here are the characters:</Text>
      {characters.map((character, index) => (
        <Text key={index} style={styles.character}>
          {character}
        </Text>
      ))}
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
