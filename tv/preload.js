const { ipcRenderer } = require('electron');

let imageToggle = true;

function getProfileImage(lrn) {
  return lrn ? `../pictures/${lrn}.png` : getRandomProfileImage();
}

function getRandomProfileImage() {
  const images = ['male-default.png', 'female-default.png'];
  imageToggle = !imageToggle;
  return images[imageToggle ? 0 : 1];
}

function processImage(imageUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const aspectRatio = img.width / img.height;
    let newWidth, newHeight, offsetX = 0, offsetY = 0;
    
    if (aspectRatio > 1) {
      newWidth = img.height;
      newHeight = img.height;
      offsetX = (img.width - img.height) / 5;
    } else if (aspectRatio < 1) {
      newWidth = img.width;
      newHeight = img.width;
      offsetY = (img.height - img.width) / 5;
    } else {
      newWidth = img.width;
      newHeight = img.height;
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(
      img,
      offsetX, offsetY, img.width - offsetX * 5, img.height - offsetY * 5,
      0, 0, newWidth, newHeight
    );

    canvas.toBlob(blob => {
      const newImageUrl = URL.createObjectURL(blob);
      callback(newImageUrl);
    }, 'image/png');
  };
  
  img.onerror = () => {
    console.error('Failed to load image:', imageUrl);
    callback(null);
  };
  
  img.src = imageUrl;
}

function updateProfileImage(imageElement, lrn) {
  const imageUrl = getProfileImage(lrn);
  
  processImage(imageUrl, processedImageUrl => {
    if (processedImageUrl) {
      imageElement.src = processedImageUrl;
      imageElement.style.display = 'block';
    } else {
      console.error('Failed to process image');
    }
  });
}

function highlightScanner(scannerElement, status) {
  let highlightClass;
  switch (status) {
    case 'success':
      highlightClass = 'highlight-success';
      break;
    case 'error':
      highlightClass = 'highlight-error';
      break;
    default:
      highlightClass = 'highlight-waiting';
  }
  scannerElement.classList.add(highlightClass);
  setTimeout(() => {
    scannerElement.classList.remove(highlightClass);
  }, 1000);
}
window.addEventListener('DOMContentLoaded', () => {
  const scanners = document.querySelectorAll('.scanner');
  scanners.forEach(scanner => {
    const profileImage = scanner.querySelector('.profile-image');
    profileImage.src = getRandomProfileImage();
    profileImage.style.display = 'block';
  });

  // Add focus to the text box in scanner-5
  const scanner5Input = document.querySelector('#scanner-5 .scanner-input-professional');
  if (scanner5Input) {
    scanner5Input.focus();
    
    // Add event listener for input changes
    scanner5Input.addEventListener('input', async () => {
      if (scanner5Input.value.length === 12) {
        const lrn = scanner5Input.value;
        scanner5Input.value = ''; // Clear input field

        // Send the LRN to the backend for validation
        ipcRenderer.send('validate-lrn', lrn);
      }
    });
  }

  ipcRenderer.on('update-text', (event, message) => {
    console.log('Message received in renderer:', message);
    try {
      const data = JSON.parse(message);
      console.log('here' + data)
      let scannerId;
      let status = 'waiting';
      let lrn = '';
  
      if (!data.student) {
        scannerId = data.scanner;
        status = data.status || 'waiting';
      } else {
        scannerId = data.student.scanner;
        status = data.student.status || 'waiting';
        lrn = data.student.lrn;
      }
  
      const scannerElement = document.getElementById(`scanner-${scannerId}`);
  
      if (!scannerElement) {
        console.error(`No element found for scanner ID ${scannerId}`);
        return;
      }
  
      highlightScanner(scannerElement, status);
  
      const contentElement = scannerElement.querySelector('.scanner-content');
      const profileImage = scannerElement.querySelector('.profile-image');
      if (!contentElement) {
        console.error(`No content element found for scanner ID ${scannerId}`);
        return;
      }
  
      scannerElement.classList.remove('waiting', 'error', 'success');
  
      if (data.message === 'Student not found' || data.message === 'Internal Server Error' || data.message === 'SHA-256 hash not found in the data' || data.message === 'No student found. Read operation failed.') {
        contentElement.innerHTML = `<p><strong>ERROR:</strong> </br>${data.message}</p>`;
        profileImage.src = getRandomProfileImage();
        profileImage.style.display = 'block';
        scannerElement.classList.add('error');
      } else if(data.message === 'Scan failed. Cooldown.') {
        contentElement.innerHTML = `<p><strong>ERROR:</strong></p> </br> <h5>SUCCESSIVE SCANNING DETECTED.</h5></br> <h5> PLEASE TRY AGAIN </br> AFTER 10 MINUTES.</h5>`;
        profileImage.src = getRandomProfileImage();
        profileImage.style.display = 'block';
        scannerElement.classList.add('error');
      } else {
        const { fname, lname, lrn, section, grade } = data.student;
        contentElement.innerHTML = `
        <p style="font-size:33px; margin-top:30px">${lname.toUpperCase()}, <h5 style="margin-top:-30px">${fname.toUpperCase()}</h5></p>
        <p style="font-size:20px; margin-top:50px" class="category">LRN</p>
        <p style="font-size:30px; "><strong>${lrn}</strong></p>
        <p style="font-size:20px; margin-top:50px" class="category">Section</p>
        <p style="font-size:30px; "><strong>${grade} - ${section}</strong></p>
        `;
        updateProfileImage(profileImage, lrn);
        scannerElement.classList.add('success');
      }
  
      console.log('Updated scanner element:', scannerElement.innerHTML);
    } catch (err) {
      console.error('Error parsing or updating:', err);
      const errorElement = document.createElement('p');
      errorElement.innerHTML = `<strong>Error:</strong> </br>${err.message}`;
      document.body.appendChild(errorElement);
    }
  });
  ipcRenderer.on('scanner5-validation-result', (event, result) => {
    console.log('Scanner 5 validation result:', result);
    const scannerElement = document.getElementById('scanner-5');
    if (!scannerElement) {
      console.error('No element found for scanner ID 5');
      return;
    }

    const profileImage = scannerElement.querySelector('.profile-image');
    const contentElement = scannerElement.querySelector('.scanner-content');
    console.log(result)

    scannerElement.classList.remove('waiting', 'error', 'success');

    if (result.message === 'Scan recorded successfully') {
      const { fname, lname, lrn, grade, section } = result.student;
      contentElement.innerHTML = `
        <p style="font-size:33px; margin-top:70px">${lname.toUpperCase()}, <h6 style="margin-top:-30px">${fname.toUpperCase()}</h6></p>
        <p style="font-size:20px; margin-top:50px" class="category">LRN</p>
        <p style="font-size:30px; "><strong>${lrn}</strong></p>
        <p style="font-size:20px; margin-top:50px" class="category">Section</p>
        <p style="font-size:30px; "><strong>${grade} - ${section}</strong></p>
      `;
      updateProfileImage(profileImage, lrn);
      highlightScanner(scannerElement, 'success');
      scannerElement.classList.add('success');

    }  else if(result.message === 'Scan failed. Cooldown.') {
      contentElement.innerHTML = `<p style="margin-top:80px"><strong>ERROR:</strong></p> </br> <h5>SUCCESSIVE SCANNING DETECTED.</h5></br> <h5> PLEASE TRY AGAIN </br> AFTER 10 MINUTES.</h5>`;
      profileImage.src = getRandomProfileImage();
      profileImage.style.display = 'block';
      highlightScanner(scannerElement, 'error');
      scannerElement.classList.add('error');

    } else {
      contentElement.innerHTML = `<p style="margin-top:150px"><strong>ERROR:</strong> <br/><h3>${result.message.toUpperCase()}</h3></p>`;
      profileImage.src = getRandomProfileImage();
      profileImage.style.display = 'block';
      highlightScanner(scannerElement, 'error');
      scannerElement.classList.add('error');

    }
  });
});
