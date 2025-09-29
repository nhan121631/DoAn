// Test upload contract image functionality
console.log('Testing contract image upload...');

const testUpload = async () => {
  try {
    // Test với contract ID từ data bạn cung cấp
    const contractId = '3dd9762c-f658-4711-bc44-bf2336a8e8a6';
    
    // Tạo mock file để test
    const blob = new Blob(['test content'], { type: 'image/png' });
    const file = new File([blob], 'test-image.png', { type: 'image/png' });
    
    // Test với frontend service
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/contracts/${contractId}/image`, {
      method: 'PUT',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    // Verify that contractImage field is updated
    if (result.contractImage) {
      console.log('✅ Contract image updated successfully:', result.contractImage);
      
      // Test URL formatting
      const fullUrl = result.contractImage.startsWith('http') 
        ? result.contractImage 
        : `https://res.cloudinary.com${result.contractImage}`;
      console.log('✅ Full Cloudinary URL:', fullUrl);
    } else {
      console.log('❌ Contract image not updated');
    }
    
  } catch (error) {
    console.error('❌ Upload test failed:', error);
  }
};

// Run test when this file is executed
// testUpload();

export { testUpload };