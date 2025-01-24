import React, { useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CharacterSelectionModal({ visible, onClose, characters, onSelectCharacter }) {
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  const handleSelect = (character) => {
    setSelectedCharacters((prevSelected) => {
      const isSelected = prevSelected.some((item) => item.id === character.id);
      const updatedSelection = isSelected
        ? prevSelected.filter((item) => item.id !== character.id)
        : [...prevSelected, { id: character.id, name: character.name, image: character.image }];
      
      console.log('Selected characters:', updatedSelection);  // Debugging line

      return updatedSelection;
    });
  };

  const handleSave = () => {
    onSelectCharacter(selectedCharacters); // Pass selected characters (with name & image)
    onClose();
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Choose Characters</Text>
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedCharacters.some((char) => char.id === item.id);
              return (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <View style={[styles.characterItem, isSelected && styles.selectedCharacter]}>
                    <Image source={item.image} style={styles.characterImage} />
                    <Text style={styles.characterName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  characterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  characterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  characterName: {
    fontSize: 16,
  },
  selectedCharacter: {
    backgroundColor: "#eeeee4",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#008CBA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
