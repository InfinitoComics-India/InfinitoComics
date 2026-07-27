import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllCharacters from './AllCharacters';
import AdminPanel from './AdminPanel';
import { cleanCharacterData } from './formConfig';
import { fetchCharactersData, deleteCharacter, updateCharacter, createCharacter } from '../../services/characterService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CharacterManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [originalCharacter, setOriginalCharacter] = useState(null); // For PATCH
  const [loading, setLoading] = useState(true);
  const [nextId, setNextId] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);

  // Fetch all characters from backend
  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetchCharactersData();
      setCharacters(response.data.data || []);
      setNextId((response.data.data?.length || 0) + 1);
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]);
      toast.error('Error fetching characters!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const filteredCharacters = characters.filter(character =>
    (character.knownAs?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.originalName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper: Get only changed fields for PATCH
  function getChangedFields(original, updated) {
    const changed = {};
    Object.keys(updated).forEach(key => {
      // For arrays, compare as strings
      if (Array.isArray(updated[key]) && Array.isArray(original[key])) {
        if (JSON.stringify(updated[key]) !== JSON.stringify(original[key])) {
          changed[key] = updated[key];
        }
      }
      // For files, always send if present
      else if (updated[key] instanceof File) {
        changed[key] = updated[key];
      }
      // For other types
      else if (updated[key] !== original[key]) {
        changed[key] = updated[key];
      }
    });
    return changed;
  }

  const handleEditCharacter = (character) => {
    const cleaned = cleanCharacterData(character);
    setEditingCharacter(cleaned);
    setOriginalCharacter(cleaned); // Store original for PATCH comparison
    setActiveTab('create');
  };

  const handleDeleteCharacter = (characterId) => {
    setCharacterToDelete(characterId);
    setShowDeleteModal(true);
  };

  const confirmDeleteCharacter = async () => {
    if (!characterToDelete) return;
    try {
      await deleteCharacter(characterToDelete);
      await fetchCharacters();
      toast.success('Character deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete character from server. Removing locally.');
      setCharacters(characters.filter(char => char._id !== characterToDelete));
    }
    setShowDeleteModal(false);
    setCharacterToDelete(null);
  };

  const cancelDeleteCharacter = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
  };

  const handleCharacterSaved = async (updatedCharacter, isEditing) => {
    const cleanCharacter = cleanCharacterData(updatedCharacter);

    if (isEditing) {
      if (!cleanCharacter._id) {
        toast.error('Character ID missing for update!');
        return;
      }

      // Get only changed fields
      const changedFields = getChangedFields(originalCharacter, cleanCharacter);

      // If nothing changed, do nothing
      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes detected.');
        setEditingCharacter(null);
        setOriginalCharacter(null);
        return;
      }

      // Build FormData if any field is a File, else send JSON
      let dataToSend = changedFields;
      let headers = {};
      const hasFile = Object.values(changedFields).some(
        val => val instanceof File
      );
      if (hasFile) {
        const formData = new FormData();
        Object.keys(changedFields).forEach(key => {
          if (changedFields[key] instanceof File) {
            formData.append(key, changedFields[key]);
          } else if (Array.isArray(changedFields[key])) {
            changedFields[key].forEach(item => formData.append(key, item));
          } else {
            formData.append(key, changedFields[key]);
          }
        });
        dataToSend = formData;
        headers = {}; // Let Axios set Content-Type for FormData
      } else {
        headers = { 'Content-Type': 'application/json' };
      }

      console.log('Update - Data being sent to backend:');
      if (dataToSend instanceof FormData) {
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
        }
      } else {
        console.log(dataToSend);
      }

      try {
        const res = await updateCharacter(cleanCharacter._id, dataToSend, headers);
        await fetchCharacters();
        toast.success('Character updated successfully!');
      } catch (error) {
        toast.error('Failed to update character on server.');
      }
      setEditingCharacter(null);
      setOriginalCharacter(null);
    } else {
      // ---- POST REQUEST FOR CREATE ----
      const newId = String(nextId);
      setNextId(nextId + 1);

      // Log the clean character data before FormData conversion
      console.log('Clean character data before FormData:', cleanCharacter);

      const formData = new FormData();
      Object.keys(cleanCharacter).forEach(key => {
        if (key !== 'mainImage' && key !== 'storylineImage' && key !== 'originImage' &&
          key !== 'mainLandscapeImage' && key !== 'power1Image' && key !== 'power2Image' && key !== 'power3Image') {
          if (Array.isArray(cleanCharacter[key])) {
            cleanCharacter[key].forEach(item => {
              formData.append(key, item);
            });
          } else {
            formData.append(key, cleanCharacter[key]);
          }
        }
      });
      formData.append('_id', newId);

      // Handle all image fields consistently - just like mainImage
      if (cleanCharacter.mainImage) {
        if (cleanCharacter.mainImage instanceof File) {
          formData.append('mainImage', cleanCharacter.mainImage);
        } else if (typeof cleanCharacter.mainImage === 'string') {
          formData.append('mainImageUrl', cleanCharacter.mainImage);
        }
      }

      if (cleanCharacter.mainLandscapeImage) {
        if (cleanCharacter.mainLandscapeImage instanceof File) {
          formData.append('mainLandscapeImage', cleanCharacter.mainLandscapeImage);
        } else if (typeof cleanCharacter.mainLandscapeImage === 'string') {
          formData.append('mainLandscapeImageUrl', cleanCharacter.mainLandscapeImage);
        }
      }

      if (cleanCharacter.power1Image) {
        if (cleanCharacter.power1Image instanceof File) {
          formData.append('power1Image', cleanCharacter.power1Image);
        } else if (typeof cleanCharacter.power1Image === 'string') {
          formData.append('power1ImageUrl', cleanCharacter.power1Image);
        }
      }

      if (cleanCharacter.power2Image) {
        if (cleanCharacter.power2Image instanceof File) {
          formData.append('power2Image', cleanCharacter.power2Image);
        } else if (typeof cleanCharacter.power2Image === 'string') {
          formData.append('power2ImageUrl', cleanCharacter.power2Image);
        }
      }

      if (cleanCharacter.power3Image) {
        if (cleanCharacter.power3Image instanceof File) {
          formData.append('power3Image', cleanCharacter.power3Image);
        } else if (typeof cleanCharacter.power3Image === 'string') {
          formData.append('power3ImageUrl', cleanCharacter.power3Image);
        }
      }

      if (cleanCharacter.storylineImage) {
        if (cleanCharacter.storylineImage instanceof File) {
          formData.append('storylineImage', cleanCharacter.storylineImage);
        } else if (typeof cleanCharacter.storylineImage === 'string') {
          formData.append('storylineImageUrl', cleanCharacter.storylineImage);
        }
      }

      if (cleanCharacter.originImage) {
        if (cleanCharacter.originImage instanceof File) {
          formData.append('originImage', cleanCharacter.originImage);
        } else if (typeof cleanCharacter.originImage === 'string') {
          formData.append('originImageUrl', cleanCharacter.originImage);
        }
      }

      try {
        const res = await createCharacter(formData);
        await fetchCharacters();
      } catch (error) {
        console.error('Error creating character:', error);
        const newCharacter = { ...cleanCharacter, _id: newId };
        setCharacters(prevCharacters => [...prevCharacters, newCharacter]);
        toast.error('Error creating character on server. Added locally.');
      }
    }
  };

  return (
    <>
      <ToastContainer />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold text-white mb-4">Delete Character</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this character?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteCharacter}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCharacter}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-500">
          Character Management System
        </h1>
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'create' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
              }`}
            onClick={() => setActiveTab('create')}
          >
            {editingCharacter ? 'Edit Character' : 'Create Character'}
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
              }`}
            onClick={() => {
              setActiveTab('all');
              setEditingCharacter(null);
              setOriginalCharacter(null);
            }}
          >
            All Characters
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'create' ? (
            <AdminPanel
              editingCharacter={editingCharacter}
              setEditingCharacter={setEditingCharacter}
              onCharacterSaved={handleCharacterSaved}
            />
          ) : (
            <AllCharacters
              characters={filteredCharacters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onEdit={handleEditCharacter}
              onDelete={handleDeleteCharacter}
              loading={loading}
              onRefresh={fetchCharacters}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CharacterManager;