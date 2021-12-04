// LUNA - File System Blockchain Backup Manager
//        Handles read/write operations to file
const fs = require('fs');

// Read from file  

// Example function call:
// 
// read('./file.json', (err, data) => {   
//       if (err) {
//             console.log(err);
//       } else {
//             console.log(data);
//       }
// });

const read = (path, cb) => {                                                   
      // Attempt to read the file                                              
      fs.readFile(path, 'utf-8', (err, fileData) => {                          
            
            if (fileData.length > 0) {
                  // Return early if an error is encountered                         
                  if (err) {                                                         
                        return cb && cb(err);                                        
                  }                                                                  
                                                                                    
                  try {
                        // Try parsing the JSON file
                        if (fileData.length > 0) {
                              const object = JSON.parse(fileData);
                              return cb && cb(null, object); // Return parsed JSON
                        }
                        else {
                              return cb && cb(null, 0);
                        }
                  } catch (err) {
                        // If an error is encountered while parsing the JSON: return callback with the error
                        return cb && cb(err);
                  }
            } 
      });
}

// Write to file
const write = (path, data) => {
      // Convert incoming JSON to string
      const dataString = JSON.stringify(data, null, 2); // ! The `null` and `2` arguments will format the string (pretty JSON baby)

      // TODO: the `fs.writeFile` method erases and rewrites the whole file
      // TODO: try to implement a writing in append mode system for performance boosting

      // Attempt to write to file. If an error is found: log it
      fs.writeFile(path, dataString, err => {
            if (err) {
                  console.log(err);
            }
      });
}

module.exports = { read, write };