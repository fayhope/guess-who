import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameScreen({ route, navigation }) {
  const { characters, gridRows = 5, gridCols = 5 } = route.params;

  // Calculate grid item size
  const screenWidth = Dimensions.get('window').width;
  const itemSize = Math.floor(screenWidth / gridCols) - 10; // Padding adjustment

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Screen</Text>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        numColumns={gridCols}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.characterTile, { width: itemSize, height: itemSize }]}
            onPress={() => console.log(`Selected: ${item.name}`)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.characterImage} />
            ) : (
              <Text style={styles.characterText}>{item.name}</Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterTile: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  characterImage: {
    width: '90%',
    height: '90%',
    borderRadius: 5,
  },
  characterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 5,
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
