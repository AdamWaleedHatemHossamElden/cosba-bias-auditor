const fs = require('fs');
const path = require('path');

const uploadsDirectory = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(uploadsDirectory, { recursive: true });

const deleteUploadFile = async (fileName) => {
  if (!fileName) return;

  const safeFileName = path.basename(fileName);
  if (safeFileName !== fileName) {
    console.error('Refused to delete an upload with an invalid filename');
    return;
  }

  try {
    await fs.promises.unlink(path.join(uploadsDirectory, safeFileName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to delete upload file:', error);
    }
  }
};

module.exports = { deleteUploadFile };
