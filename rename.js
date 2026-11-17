const fs = require('fs');
const path = require('path');

// Target the book1 folder first. Change this to './public/book2' later for the second volume.
const folderPath = './public/book1'; 

const files = fs.readdirSync(folderPath);

// Filter for PNG files and sort them naturally (so 2 comes before 10)
const images = files
  .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
  .sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);

images.forEach((file, index) => {
  const extension = path.extname(file);
  // Generate the new name with leading zeros: page-001, page-012, etc.
  const newName = `page-${String(index + 1).padStart(3, '0')}${extension}`;
  
  const oldPath = path.join(folderPath, file);
  const newPath = path.join(folderPath, newName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: ${file}  ->  ${newName}`);
});