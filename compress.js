import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

// Define the two book folders based on your structure
const foldersToProcess = ['book1', 'book2'];

foldersToProcess.forEach(folderName => {
    const inputFolder = `./public/${folderName}`;
    const outputFolder = `./public/${folderName}_webp`;

    // Create the output folders if they don't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Read and compress the files
    if (fs.existsSync(inputFolder)) {
        fs.readdirSync(inputFolder).forEach(file => {
            if (file.match(/\.(png|jpg|jpeg)$/i)) {
                const inputPath = path.join(inputFolder, file);
                const outputPath = path.join(outputFolder, file.replace(/\.[^/.]+$/, ".webp"));

                sharp(inputPath)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath)
                    .then(() => console.log(`Converted: ${folderName}/${file}`))
                    .catch(err => console.error(`Failed to convert ${folderName}/${file}:`, err));
            }
        });
    }
});