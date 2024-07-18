const UpdateLocation = async (lat, lon) => {
  try {
    const requestOptions = {
      method: 'GET',
      // Add headers or other options needed by your backend API
    };
    
    // Adjust the URL to your backend endpoint, assuming it also uses lat and lon as query parameters
    const response = await fetch(`http://localhost:8000/api/?lat=${lat}&lon=${lon}`, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    // Assuming your backend returns a similar structure, otherwise adjust these lines accordingly
    const city = result.city;
    const state = result.state;
    const country = result.country;
    
    return [city, state, country];
  } catch (error) {
    console.log('error', error);
    return []; // Return an empty array or handle the error as needed
  }
};

// Use named exports if you plan to export more than one function or variable from this file
// For a single export, default is fine but it contradicts the comment about using named exports
export default UpdateLocation;