const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getFilePath(collectionName) {
  return path.join(dataDir, `${collectionName}.json`);
}

function getSeedData(collectionName) {
  return [];
}

function readCollection(collectionName) {
  try {
    const file = getFilePath(collectionName);
    if (!fs.existsSync(file)) {
      const initialData = getSeedData(collectionName);
      fs.writeFileSync(file, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading ' + collectionName + ' collection:', err);
    return getSeedData(collectionName);
  }
}

function writeCollection(collectionName, data) {
  try {
    const file = getFilePath(collectionName);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing ' + collectionName + ' collection:', err);
  }
}

module.exports = {
  readCollection,
  writeCollection
};
