// Minimal JavaScript for essential functionality only
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Simple active navigation highlighting
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = 'home';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // Download Functionality (Public)
  const downloadCvBtn = document.getElementById('download-cv-btn');
  const downloadCertBtn = document.getElementById('download-cert-btn');
  const downloadProjectBtn = document.getElementById('download-project-btn');

  const cvDownloadStatus = document.getElementById('cv-download-status');
  const certDownloadStatus = document.getElementById('cert-download-status');
  const projectDownloadStatus = document.getElementById('project-download-status');

  let currentCvFile = null;
  let currentCertFiles = [];
  let currentProjectFiles = [];
  let uploadedFiles = [];

  // Initialize download buttons as disabled
  if (downloadCvBtn) {
    downloadCvBtn.disabled = true;
    downloadCvBtn.style.opacity = '0.6';
  }
  if (downloadCertBtn) {
    downloadCertBtn.disabled = true;
    downloadCertBtn.style.opacity = '0.6';
  }
  if (downloadProjectBtn) {
    downloadProjectBtn.disabled = true;
    downloadProjectBtn.style.opacity = '0.6';
  }

  // Load saved files from localStorage on page load
  loadSavedFiles();

  // Load public files for regular users
  loadPublicFiles().catch(error => {
    console.error('Error loading public files:', error);
  });

  // CV Download
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', function() {
      if (currentCvFile) {
        downloadFile(currentCvFile.id);
        showDownloadStatus(cvDownloadStatus, '✓ CV downloaded successfully', 'success');
      } else {
        showDownloadStatus(cvDownloadStatus, '✗ No CV available for download', 'error');
      }
    });
  }

  // Certificates Download
  if (downloadCertBtn) {
    downloadCertBtn.addEventListener('click', function() {
      if (currentCertFiles.length > 0) {
        if (currentCertFiles.length === 1) {
          // If only one file, download directly
          downloadFile(currentCertFiles[0].id);
          showDownloadStatus(certDownloadStatus, '✓ Certificate downloaded successfully', 'success');
        } else {
          // Show selection modal for multiple files
          showFileSelectionModal(currentCertFiles, 'certificates', certDownloadStatus);
        }
      } else {
        showDownloadStatus(certDownloadStatus, '✗ No certificates available for download', 'error');
      }
    });
  }

  // Project Files Download
  if (downloadProjectBtn) {
    downloadProjectBtn.addEventListener('click', function() {
      if (currentProjectFiles.length > 0) {
        if (currentProjectFiles.length === 1) {
          // If only one file, download directly
          downloadFile(currentProjectFiles[0].id);
          showDownloadStatus(projectDownloadStatus, '✓ Project file downloaded successfully', 'success');
        } else {
          // Show selection modal for multiple files
          showFileSelectionModal(currentProjectFiles, 'project files', projectDownloadStatus);
        }
      } else {
        showDownloadStatus(projectDownloadStatus, '✗ No project files available for download', 'error');
      }
    });
  }

  // Admin Access (Hidden functionality) - DISABLED FOR PRODUCTION
  let adminMode = false;
  let keySequence = [];
  const adminSequence = ['a', 'd', 'm', 'i', 'n'];

  // Check if we're in development mode (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Secret key sequence to enable admin mode (type "admin") - ONLY IN DEVELOPMENT
  if (isDevelopment) {
    document.addEventListener('keydown', function(e) {
      // Only track letter keys when not in input fields
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        keySequence.push(e.key.toLowerCase());

        // Keep only the last 5 keys
        if (keySequence.length > 5) {
          keySequence.shift();
        }

        // Check if the sequence matches "admin"
        if (keySequence.join('') === adminSequence.join('')) {
          adminMode = !adminMode;
          const uploadSection = document.querySelector('.upload-section.admin-only');
          if (uploadSection) {
            uploadSection.style.display = adminMode ? 'block' : 'none';
          }
          console.log(adminMode ? 'Admin mode enabled - Upload section visible' : 'Admin mode disabled - Upload section hidden');
          keySequence = []; // Reset sequence

          // Show a subtle notification
          showAdminNotification(adminMode);
        }
      }
    });
  } else {
    // In production, completely hide admin section
    const uploadSection = document.querySelector('.upload-section.admin-only');
    if (uploadSection) {
      uploadSection.remove(); // Completely remove from DOM
    }
    console.log('Admin mode disabled - Production environment detected');
  }

  // Show admin mode notification
  function showAdminNotification(isEnabled) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isEnabled ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = isEnabled ? '🔓 Admin Mode Enabled' : '🔒 Admin Mode Disabled';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Helper function to show download status
  function showDownloadStatus(statusElement, message, type) {
    statusElement.textContent = message;
    statusElement.className = `download-status ${type}`;
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'download-status';
    }, 3000);
  }

  // Show file selection modal for multiple files
  function showFileSelectionModal(files, fileTypeName, statusElement) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeInModal 0.3s ease-out;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideInUp 0.3s ease-out;
    `;

    // Create modal HTML
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 style="margin: 0 0 1rem 0; color: var(--text, #ffffff);">Select ${fileTypeName} to download</h3>
        <button class="modal-close" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--muted, #888);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        ">×</button>
      </div>
      <div class="modal-body">
        <div class="file-selection-list">
          ${files.map(file => `
            <div class="file-selection-item" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1rem;
              margin-bottom: 0.5rem;
              background: rgba(6, 182, 212, 0.1);
              border-radius: 8px;
              border: 1px solid rgba(6, 182, 212, 0.2);
              transition: all 0.3s ease;
            ">
              <div class="file-info" style="display: flex; align-items: center; gap: 0.8rem;">
                <span class="file-icon" style="font-size: 1.5rem;">${getFileIcon(file.type)}</span>
                <div>
                  <h5 style="margin: 0; color: var(--text, #ffffff); font-size: 0.9rem;">${file.name}</h5>
                  <p style="margin: 0; color: var(--muted, #888); font-size: 0.8rem;">${file.size}</p>
                </div>
              </div>
              <button class="download-file-btn" data-file-id="${file.id}" style="
                background: var(--primary, #06b6d4);
                color: var(--text, #ffffff);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.3s ease;
              ">Download</button>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions" style="
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          justify-content: flex-end;
        ">
          <button class="download-all-btn" style="
            background: var(--primary, #06b6d4);
            color: var(--text, #ffffff);
            border: none;
            padding: 0.7rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          ">Download All</button>
          <button class="cancel-btn" style="
            background: transparent;
            color: var(--muted, #888);
            border: 1px solid var(--muted, #888);
            padding: 0.7rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
          ">Cancel</button>
        </div>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    const closeModal = () => {
      modalOverlay.style.animation = 'fadeOutModal 0.3s ease-in forwards';
      setTimeout(() => modalOverlay.remove(), 300);
    };

    // Close button
    modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    modalContent.querySelector('.cancel-btn').addEventListener('click', closeModal);

    // Click outside to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Individual download buttons
    modalContent.querySelectorAll('.download-file-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const fileId = parseFloat(e.target.dataset.fileId);
        console.log('Modal download button clicked for file ID:', fileId);
        console.log('Button dataset:', e.target.dataset);

        const file = files.find(f => f.id == fileId); // Use == for loose comparison
        if (file) {
          console.log('File found in modal:', file.name);
          downloadFile(fileId);
          showDownloadStatus(statusElement, `✓ ${file.name} downloaded successfully`, 'success');
          closeModal();
        } else {
          console.error('File not found in modal for ID:', fileId);
          console.log('Available files in modal:', files.map(f => ({ id: f.id, name: f.name })));
          showDownloadStatus(statusElement, '✗ File not found', 'error');
        }
      });
    });

    // Download all button
    modalContent.querySelector('.download-all-btn').addEventListener('click', () => {
      files.forEach(file => downloadFile(file.id));
      showDownloadStatus(statusElement, `✓ All ${files.length} ${fileTypeName} downloaded`, 'success');
      closeModal();
    });

    // Add hover effects
    modalContent.querySelectorAll('.file-selection-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(6, 182, 212, 0.2)';
        item.style.transform = 'translateY(-2px)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'rgba(6, 182, 212, 0.1)';
        item.style.transform = 'translateY(0)';
      });
    });
  }

  // Helper function to update download button state
  function updateDownloadButton(button) {
    if (button) {
      button.disabled = false;
      button.style.opacity = '1';
    }
  }

  // Helper function to disable download button
  function disableDownloadButton(button) {
    if (button) {
      button.disabled = true;
      button.style.opacity = '0.6';
    }
  }

  // Save files to localStorage
  function saveFilesToStorage() {
    try {
      // Save current file references
      localStorage.setItem('currentCvFile', JSON.stringify(currentCvFile));
      localStorage.setItem('currentCertFiles', JSON.stringify(currentCertFiles));
      localStorage.setItem('currentProjectFiles', JSON.stringify(currentProjectFiles));
    } catch (error) {
      console.error('Error saving files to localStorage:', error);
    }
  }

  // Save file with base64 data
  async function saveFileWithData(fileObj) {
    try {
      const base64Data = await fileToBase64(fileObj.file);
      const fileToSave = {
        id: fileObj.id,
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type,
        data: base64Data
      };

      // Save individual file
      localStorage.setItem(`file_${fileObj.id}`, JSON.stringify(fileToSave));

      // Update file list in localStorage
      const savedFileIds = JSON.parse(localStorage.getItem('portfolioFileIds') || '[]');
      if (!savedFileIds.includes(fileObj.id)) {
        savedFileIds.push(fileObj.id);
        localStorage.setItem('portfolioFileIds', JSON.stringify(savedFileIds));
      }
    } catch (error) {
      console.error('Error saving file with data:', error);
    }
  }

  // Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Load public files for regular users (predefined files)
  async function loadPublicFiles() {
    // Only load public files if no admin files are present
    if (uploadedFiles.length === 0) {
      console.log('Loading public files for regular users...');

      // Define your public files here - only files that actually exist will be loaded
      const publicFiles = [
        {
          id: 'cv_001',
          name: 'Adit_Resume.pdf',
          type: 'cv',
          url: 'assets/files/Adit_Resume.pdf'
        },
        {
          id: 'cert_001',
          name: 'Web_Development_Certificate.pdf',
          type: 'cert',
          url: 'assets/files/Web_Development_Certificate.pdf'
        },
        {
          id: 'cert_002',
          name: 'UI_Design_Award.pdf',
          type: 'cert',
          url: 'assets/files/UI_Design_Award.pdf'
        },
        {
          id: 'project_001',
          name: 'Project_Documentation.pdf',
          type: 'project',
          url: 'assets/files/Project_Documentation.pdf'
        }
      ];

      // Check if files exist and add them
      const fileCheckPromises = publicFiles.map(async (fileData) => {
        try {
          const response = await fetch(fileData.url, { method: 'HEAD' });
          if (response.ok) {
            // Get file size from response headers
            const contentLength = response.headers.get('content-length');
            const fileSize = contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown size';

            const fileObj = {
              id: fileData.id,
              name: fileData.name,
              size: fileSize,
              type: fileData.type,
              url: fileData.url,
              isPublic: true
            };

            uploadedFiles.push(fileObj);

            // Add to appropriate arrays
            if (fileData.type === 'cv') {
              currentCvFile = fileObj;
            } else if (fileData.type === 'cert') {
              currentCertFiles.push(fileObj);
            } else if (fileData.type === 'project') {
              currentProjectFiles.push(fileObj);
            }

            console.log('Public file loaded:', fileData.name);
            return true;
          } else {
            console.log('Public file not found:', fileData.name);
            return false;
          }
        } catch (error) {
          console.log('Error checking file:', fileData.name, error);
          return false;
        }
      });

      // Wait for all file checks to complete
      await Promise.all(fileCheckPromises);

      // Update download buttons
      if (currentCvFile && downloadCvBtn) {
        updateDownloadButton(downloadCvBtn);
      }
      if (currentCertFiles.length > 0 && downloadCertBtn) {
        updateDownloadButton(downloadCertBtn);
      }
      if (currentProjectFiles.length > 0 && downloadProjectBtn) {
        updateDownloadButton(downloadProjectBtn);
      }

      console.log('Public files loaded successfully');
    }
  }

  // Load files from localStorage
  function loadSavedFiles() {
    try {
      console.log('Loading saved files from localStorage...');

      // Load file IDs
      const savedFileIds = JSON.parse(localStorage.getItem('portfolioFileIds') || '[]');
      console.log('Saved file IDs:', savedFileIds);

      // Reset uploaded files array
      uploadedFiles = [];
      savedFileIds.forEach(fileId => {
        const savedFile = localStorage.getItem(`file_${fileId}`);
        if (savedFile) {
          try {
            const fileData = JSON.parse(savedFile);
            console.log('Loading file:', fileData.name, 'Type:', fileData.type);

            // Convert base64 back to file object
            const file = base64ToFile(fileData.data, fileData.name);
            const fileObj = {
              id: fileData.id,
              name: fileData.name,
              size: fileData.size,
              type: fileData.type,
              file: file
            };
            uploadedFiles.push(fileObj);
            console.log('File loaded successfully:', fileObj.name);
          } catch (fileError) {
            console.error('Error loading individual file:', fileError);
          }
        }
      });

      console.log('Total files loaded:', uploadedFiles.length);

      // Reset current file arrays
      currentCvFile = null;
      currentCertFiles = [];
      currentProjectFiles = [];

      // Rebuild current file references from uploaded files
      uploadedFiles.forEach(fileObj => {
        console.log('Processing file:', fileObj.name, 'Type:', fileObj.type);
        if (fileObj.type === 'cv') {
          currentCvFile = fileObj;
          console.log('CV file set:', fileObj.name);
        } else if (fileObj.type === 'cert') {
          currentCertFiles.push(fileObj);
          console.log('Certificate file added:', fileObj.name);
        } else if (fileObj.type === 'project') {
          currentProjectFiles.push(fileObj);
          console.log('Project file added:', fileObj.name);
        }
      });

      console.log('Current CV file:', currentCvFile ? currentCvFile.name : 'None');
      console.log('Current cert files:', currentCertFiles.length);
      console.log('Current project files:', currentProjectFiles.length);

      // Update download buttons based on available files
      if (currentCvFile && downloadCvBtn) {
        updateDownloadButton(downloadCvBtn);
        console.log('CV download button enabled');
      } else {
        console.log('CV download button NOT enabled - CV file:', !!currentCvFile, 'Button exists:', !!downloadCvBtn);
      }

      if (currentCertFiles.length > 0 && downloadCertBtn) {
        updateDownloadButton(downloadCertBtn);
        console.log(`Certificate download button enabled (${currentCertFiles.length} files)`);
      }

      if (currentProjectFiles.length > 0 && downloadProjectBtn) {
        updateDownloadButton(downloadProjectBtn);
        console.log(`Project download button enabled (${currentProjectFiles.length} files)`);
      }

      // Update the files list display
      updateFilesList();

      // Save the current state to ensure consistency
      saveFilesToStorage();

      console.log('File loading completed');
    } catch (error) {
      console.error('Error loading files from localStorage:', error);
    }
  }

  // Convert base64 back to file
  function base64ToFile(base64Data, filename) {
    try {
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      // Return a dummy file if conversion fails
      return new File([''], filename, { type: 'application/octet-stream' });
    }
  }

  // File Upload Functionality (Admin Only)
  const uploadAreas = document.querySelectorAll('.upload-area');
  const filesList = document.getElementById('files-list');

  uploadAreas.forEach(area => {
    const input = area.querySelector('input[type="file"]');
    const status = area.querySelector('.upload-status');

    // Click to upload
    area.addEventListener('click', () => input.click());

    // Drag and drop
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
      area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      handleFiles(e.dataTransfer.files, area, status);
    });

    // File input change
    input.addEventListener('change', (e) => {
      handleFiles(e.target.files, area, status);
    });
  });

  async function handleFiles(files, area, status) {
    const fileType = area.id.split('-')[0];

    for (const file of Array.from(files)) {
      if (validateFile(file, fileType)) {
        const fileObj = {
          id: `${fileType}_${Date.now()}`,
          name: file.name,
          size: formatFileSize(file.size),
          type: fileType,
          file: file
        };

        uploadedFiles.push(fileObj);

        // Save file to localStorage
        await saveFileWithData(fileObj);

        // Update current files and button states based on file type
        if (fileType === 'cv') {
          currentCvFile = fileObj;
          updateDownloadButton(downloadCvBtn);
        } else if (fileType === 'cert') {
          currentCertFiles.push(fileObj);
          updateDownloadButton(downloadCertBtn);
        } else if (fileType === 'project') {
          currentProjectFiles.push(fileObj);
          updateDownloadButton(downloadProjectBtn);
        }

        // Save current file references
        saveFilesToStorage();

        status.textContent = `✓ ${file.name} uploaded successfully`;
        status.className = 'upload-status success';
      } else {
        status.textContent = `✗ Invalid file type or size`;
        status.className = 'upload-status error';
      }
    }

    updateFilesList();
    setTimeout(() => {
      status.textContent = '';
      status.className = 'upload-status';
    }, 3000);
  }

  function validateFile(file, type) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = {
      cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      cert: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      project: ['application/pdf', 'application/zip', 'application/x-rar-compressed']
    };

    return file.size <= maxSize && allowedTypes[type]?.includes(file.type);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getFileIcon(type) {
    const icons = { cv: '📄', cert: '🏆', project: '💼' };
    return icons[type] || '📁';
  }

  function updateFilesList() {
    if (uploadedFiles.length === 0) {
      filesList.innerHTML = '<p class="no-files">No files uploaded yet</p>';
      return;
    }

    filesList.innerHTML = uploadedFiles.map(file => `
      <div class="file-item">
        <div class="file-info">
          <span class="file-icon">${getFileIcon(file.type)}</span>
          <div class="file-details">
            <h5>${file.name}</h5>
            <p>${file.size} • ${file.type.toUpperCase()}</p>
          </div>
        </div>
        <div class="file-actions">
          <button class="file-btn" onclick="downloadFile(${file.id})">Download</button>
          <button class="file-btn delete" onclick="deleteFile(${file.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  window.downloadFile = function(id) {
    console.log('Attempting to download file with ID:', id);
    console.log('Available files:', uploadedFiles.map(f => ({ id: f.id, name: f.name })));

    const file = uploadedFiles.find(f => f.id == id); // Use == for loose comparison
    if (file) {
      console.log('File found:', file.name);

      if (file.isPublic && file.url) {
        // Handle public files with direct URL download
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        a.target = '_blank'; // Open in new tab if direct download fails
        a.click();
        console.log('Public file download initiated for:', file.name);
      } else if (file.file) {
        // Handle uploaded files with blob URL
        const url = URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Uploaded file download initiated for:', file.name);
      } else {
        console.error('File object is missing both URL and file data');
      }
    } else {
      console.error('File not found for ID:', id);
      console.log('Available file IDs:', uploadedFiles.map(f => f.id));
    }
  };

  window.deleteFile = function(id) {
    const fileToDelete = uploadedFiles.find(f => f.id === id);

    if (fileToDelete) {
      // Update current files and button states based on file type
      if (fileToDelete.type === 'cv' && currentCvFile && currentCvFile.id === id) {
        currentCvFile = null;
        disableDownloadButton(downloadCvBtn);
      } else if (fileToDelete.type === 'cert') {
        currentCertFiles = currentCertFiles.filter(f => f.id !== id);
        if (currentCertFiles.length === 0) {
          disableDownloadButton(downloadCertBtn);
        }
      } else if (fileToDelete.type === 'project') {
        currentProjectFiles = currentProjectFiles.filter(f => f.id !== id);
        if (currentProjectFiles.length === 0) {
          disableDownloadButton(downloadProjectBtn);
        }
      }

      // Remove from localStorage
      localStorage.removeItem(`file_${id}`);
      const savedFileIds = JSON.parse(localStorage.getItem('portfolioFileIds') || '[]');
      const updatedFileIds = savedFileIds.filter(fileId => fileId !== id);
      localStorage.setItem('portfolioFileIds', JSON.stringify(updatedFileIds));

      // Save updated current file references
      saveFilesToStorage();
    }

    uploadedFiles = uploadedFiles.filter(f => f.id !== id);
    updateFilesList();
  };

});
