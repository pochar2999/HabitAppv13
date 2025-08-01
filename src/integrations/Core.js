// Mock file upload functionality
export const UploadFile = async ({ file }) => {
  // Simulate file upload delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock file URL
  return {
    file_url: `https://example.com/uploads/${file.name}`
  };
};