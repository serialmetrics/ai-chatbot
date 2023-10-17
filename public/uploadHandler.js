document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
  
    uploadButton.addEventListener('click', function() {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', function() {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
  
        fetch('http://3.134.106.86:3000/upload', {
          method: 'POST',
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
          console.log('File uploaded successfully:', data);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
      }
    });
  });
  