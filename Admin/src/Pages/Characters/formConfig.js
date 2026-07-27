export const formFields = [
  { name: 'knownAs', label: 'Known As', type: 'text', validation: { required: 'Known As is required' } },
  { name: 'originalName', label: 'Original Name', type: 'text', validation: {} }, // not required
  { name: 'birthDate', label: 'Birth Date', type: 'date', validation: { required: 'Birth Date is required' } },
  { name: 'height', label: 'Height', type: 'text', validation: {} }, // not required
  { name: 'weight', label: 'Weight', type: 'text', validation: {} }, // not required
  { name: 'age', label: 'Age', type: 'number', validation: { required: 'Age is required', valueAsNumber: true, min: { value: 1, message: 'Age must be at least 1' } } },
  { name: 'species', label: 'Species', type: 'text', validation: {} }, // not required
  { name: 'eyes', label: 'Eyes', type: 'text', validation: {} }, // not required
  { name: 'hair', label: 'Hair', type: 'text', validation: {} }, // not required
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], validation: { required: 'Gender is required' } },
  { name: 'placeOfOrigin', label: 'Place of Origin', type: 'text', validation: { required: 'Place of Origin is required' } },
];

// Helper function to clean character data
export const cleanCharacterData = (character) => {
  const cleanCharacter = { ...character };

  // Map nested storyLine and origin to flat fields for the form
  if (character.storyLine) {
    cleanCharacter.storylineText = character.storyLine.text || '';
    cleanCharacter.storylineImage = character.storyLine.image || null;
  }
  if (character.origin) {
    cleanCharacter.originText = character.origin.text || '';
    cleanCharacter.originImage = character.origin.image || null;
  }
  
  // Map image URLs to image fields for the form
  if (character.mainImageUrl) {
    cleanCharacter.mainImage = character.mainImageUrl;
  }
  if (character.mainLandscapeImageUrl) {
    cleanCharacter.mainLandscapeImage = character.mainLandscapeImageUrl;
  }
  if (character.power1ImageUrl) {
    cleanCharacter.power1Image = character.power1ImageUrl;
  }
  if (character.power2ImageUrl) {
    cleanCharacter.power2Image = character.power2ImageUrl;
  }
  if (character.power3ImageUrl) {
    cleanCharacter.power3Image = character.power3ImageUrl;
  }

  // Fix: Convert birthDate to YYYY-MM-DD for input type="date"
  if (character.birthDate) {
    try {
      // Handles both normal and weird ISO strings
      const dateObj = new Date(character.birthDate);
      if (!isNaN(dateObj.getTime())) {
        // Format as YYYY-MM-DD
        const yyyy = dateObj.getFullYear().toString().padStart(4, '0');
        const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const dd = dateObj.getDate().toString().padStart(2, '0');
        cleanCharacter.birthDate = `${yyyy}-${mm}-${dd}`;
      } else {
        // fallback: just use the first 10 chars if parsing fails
        cleanCharacter.birthDate = character.birthDate.slice(0, 10);
      }
    } catch {
      cleanCharacter.birthDate = character.birthDate.slice(0, 10);
    }
  }

  // Remove the nested fields to avoid confusion
  delete cleanCharacter.storyLine;
  delete cleanCharacter.origin;
  delete cleanCharacter.mainImageUrl;
  delete cleanCharacter.mainLandscapeImageUrl;
  delete cleanCharacter.power1ImageUrl;
  delete cleanCharacter.power2ImageUrl;
  delete cleanCharacter.power3ImageUrl;

  return cleanCharacter;
};