const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const { name } = require('ejs');

const app = express();
const PORT = 3000;

// View engine setup
app.set('view engine', 'ejs');

// App Configuration
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hr_manager',
});

connection.connect((err) => {
  if (err) {
    console.error(`Error connection to MySQL: ${err}`);
    return;
  }
  console.log(`[${getDateTime()}] Connected to MySQL database`);
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let id = req.params.id;
    cb(null, `public/hr_folders/${id}`);
  },
  filename: (req, file, cb) => {
    let date = new Date();
    // Format to DD/MM/YYYY-HH:MM:SS
    let formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    cb(null, `${formattedDate}-${file.originalname}`);
  },
});

let upload = multer({
  storage: storage,
  limits: {
    // File limit of 25MB
    fileSize: 25000000,
  },
});

function getDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Rendering

// Home
app.get('/', (req, res) => {
  const sql = `SELECT A.id, A.title, A.body, A.dateCreated, E.firstName FROM announcements AS A LEFT JOIN employees AS E ON A.employee = E.id ORDER BY A.dateCreated DESC;`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving announcements!`);
    }
    // Render HTML page with data
    res.render('index', { announcements: results });
  });
});

// Employees

// Display Employee Listing Page
app.get('/Employee', (req, res) => {
  const sql = `SELECT E.id, E.firstName, E.lastName, E.businessEmail, E.businessMobile, D.name FROM employees AS E INNER JOIN departments AS D ON E.department = D.id;`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving employees OR departments!!`);
    }
    // Render HTML page with data
    res.render('employee', { employees: results });
  });
});
// Display Add Employee Form Page
app.get('/AddEmployee', (req, res) => {
  const sql = `SELECT P.id AS PID, P.name AS PN FROM programmes P;`;
  connection.query(sql, (err, results1) => {
    let programmes;
    let departments;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving departments!`);
    }
    programmes = results1;
    const sql = `SELECT D.id AS DID, D.name AS DN FROM departments D;`;
    connection.query(sql, (err, results2) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Retrieving programmes!`);
      }
      departments = results2;
      // Render HTML page with data
      res.render('employee_add', { programmes: programmes, departments: departments });
    });
  });
});
// Creation of New Employee
app.post('/NewEmployee', (req, res) => {
  // Obtaining the parameters
  let { firstName, lastName, pEmail, bEmail, pMobile, bMobile, postal, address, dpt, leaves, note, programmeId } = req.body;
  // Date creations
  const today = new Date();
  // Processing Data
  programmeId = programmeId === 'none' ? null : parseInt(programmeId);
  // Employee creation
  const createEmployee = `INSERT INTO employees (firstName, lastName, personalEmail, businessEmail, personalMobile, businessMobile, postal, address, department, leaves, dateJoined, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  connection.query(createEmployee, [firstName, lastName, pEmail, bEmail, pMobile, bMobile, postal, address, dpt, leaves, today, note], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Creating New Employee!`);
    }
    const employeeId = results.insertId;
    if (programmeId !== null) {
      const createProgramme = `INSERT INTO employee_has_programme (employee, programme, enrollDate, status) VALUES (?, ?, ?, ?)`;
      connection.query(createProgramme, [employeeId, programmeId, today, 4], (err) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Creating New Employee Programme!`);
        }
      });
    }
    res.redirect('/Employee');
  });
});
// Display Employee Details Page
app.get('/Employee/:id', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const sql = `SELECT E.id AS emId, CONCAT(E.firstName, ' ', E.lastName) as emName, E.personalEmail AS pEmail, E.businessEmail AS bEmail, E.personalMobile AS pMobile, E.businessMobile AS bMobile, E.postal, E.address, D.name AS DN, E.dateJoined, E.dateLeft, E.leaves, E.note, P.category AS PC, P.id AS PID, P.name AS PN, EHP.enrollDate, S.name AS SN FROM employees E LEFT JOIN employee_has_programme EHP ON E.id = EHP.employee LEFT JOIN programmes P ON EHP.programme = P.id LEFT JOIN statuses S ON EHP.status = S.id JOIN departments D ON E.department = D.id WHERE E.id = ?;`;
  connection.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving employee!`);
    }
    if (results.length > 0) {
      // Render HTML page with the announcement data
      res.render('employee_detail', { employee: results });
    } else {
      res.status(404).send(`Employee ${employeeId} not found`);
    }
  });
});
// Display Employee Edit Page
app.get('/Employee/:id/Edit', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const sql = `SELECT E.id AS emId, E.firstName, E.lastName, E.personalEmail AS pEmail, E.businessEmail AS bEmail, E.personalMobile AS pMobile, E.businessMobile AS bMobile, E.postal, E.address, D.id AS DID, D.name AS DN, E.dateJoined, E.dateLeft, E.leaves, E.note, P.category AS PC, P.id AS PID, P.name AS PN, EHP.enrollDate, S.name AS SN FROM employees E LEFT JOIN employee_has_programme EHP ON E.id = EHP.employee LEFT JOIN programmes P ON EHP.programme = P.id LEFT JOIN statuses S ON EHP.status = S.id JOIN departments D ON E.department = D.id WHERE E.id = ?;`;
  connection.query(sql, [employeeId], (err, results1) => {
    let employee;
    let departments;
    let programmes;
    let statuses;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving employee!`);
    }
    employee = results1;
    const sql = `SELECT id, name FROM departments;`;
    connection.query(sql, (err, results2) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Retrieving departments!`);
      }
      departments = results2;
      const sql = `SELECT id, name FROM programmes;`;
      connection.query(sql, (err, results3) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Retrieving programmes!`);
        }
        programmes = results3;
        const sql = `SELECT * FROM statuses;`;
        connection.query(sql, (err, results4) => {
          if (err) {
            console.error(`Database query error: ${err.message}`);
            return res.status(500).send(`Error Retrieving statuses!`);
          }
          statuses = results4;
          // Render HTML page with the announcement data
          res.render('employee_edit', { employee, departments, programmes, statuses });
        });
      });
    });
  });
});
// Update Employee Details
app.post('/Employee/:id/Edit', (req, res) => {
  // Obtaining the parameters
  const employeeId = parseInt(req.params.id);
  const now = new Date();
  let { firstName, lastName, pEmail, bEmail, pMobile, bMobile, postal, address, dpt, leaves, dismissDisplay, note, programmeId } = req.body;
  // Obtaining the variable number of statuses
  let statuses = {};
  let existingProgrammeIds = [];
  for (let key in req.body) {
    if (key.startsWith('status')) {
      statuses[parseInt(key.split('status')[1])] = req.body[key];
      existingProgrammeIds.push(parseInt(key.split('status')[1]));
    }
  }
  dismissDisplay = dismissDisplay === '' ? null : dismissDisplay;
  programmeId = programmeId === 'none' ? null : programmeId;
  programmeId = !(programmeId in existingProgrammeIds) ? programmeId : null;
  // Updating the employee
  const sql = `UPDATE employees SET firstName = ?, lastName = ?, personalEmail = ?, businessEmail = ?, personalMobile = ?, businessMobile = ?, postal = ?, address = ?, department = ?, dateLeft = ?, leaves = ?, note = ? WHERE id = ?;`;
  connection.query(sql, [firstName, lastName, pEmail, bEmail, pMobile, bMobile, postal, address, dpt, dismissDisplay, leaves, note, employeeId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Updating employee!`);
    }
    // Updating employee status
    for (let key in statuses) {
      const sql = `UPDATE employee_has_programme SET status = ? WHERE employee = ? AND programme = ?`;
      connection.query(sql, [statuses[key], employeeId, key], (err) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Updating employee programme status!`);
        }
      });
    }
    // Creating new employee programme
    if (programmeId !== null) {
      const createProgramme = `INSERT INTO employee_has_programme (employee, programme, enrollDate, status) VALUES (?, ?, ?, ?)`;
      connection.query(createProgramme, [employeeId, programmeId, now, 4], (err) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Creating New Employee Programme!`);
        }
      });
    }
    res.redirect(`/Employee/${employeeId}`);
  });
});
// Delete Employee
app.get('/Employee/:id/Delete', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const sql = `DELETE FROM employees WHERE id = ?`;
  connection.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Deleting employee!`);
    } else {
      res.redirect(`/Employee`);
    }
  });
});
// Delete Employee's Programme
app.get('/Employee/:id/:proid/Delete', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const programmeId = parseInt(req.params.proid);
  console.log(`/Employee/${employeeId}/${programmeId}/Delete`);
  const sql = `DELETE FROM employee_has_programme WHERE employee = ? AND programme = ?;`;
  connection.query(sql, [employeeId, programmeId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Deleting employee's Programme!`);
    } else {
      res.redirect(`/Employee/${employeeId}/Edit`);
    }
  });
});

// Documents
app.get('/Document', (req, res) => {
  const sql = `SELECT Fo.id AS folderId, Fo.name AS folderName, ROUND(SUM(Fi.size)/1000000, 2) AS folderSize FROM folders AS Fo LEFT JOIN files AS Fi ON Fo.id = Fi.folder GROUP BY Fo.id ORDER BY Fo.id;`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving folders!`);
    }
    // Render HTML page with data
    res.render('document', { documentFolders: results });
  });
});
// Display Edit Folder
app.get('/EditDocument', (req, res) => {
  const sql = `SELECT * FROM folders`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving folders!`);
    }
    // Render HTML page with data
    res.render('document_edit', { documentFolders: results });
  });
});
// Form Processing
app.post('/Document/Edit', (req, res) => {
  // Obtaining the variable no. of paremeters
  let names = {};
  for (const key in req.body) {
    if (key.startsWith('name')) {
      let id = key.slice(4);
      names[id] = req.body[key];
    }
  }
  console.log(names);
  // Obtaining the last parameter (newName)
  let newName = req.body.newName;
  newName = newName === '' ? null : newName;
  if (names.length !== 0) {
    const sql = `UPDATE folders SET name = ? WHERE id = ?;`;
    for (let key in names) {
      connection.query(sql, [names[key], key], (err, results) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Updating folder name in database!`);
        }
      });
    }
  }
  // Adding the Folder
  if (newName !== null) {
    const sql1 = `SELECT id FROM folders ORDER BY id DESC LIMIT 1;`;
    const sql2 = `INSERT INTO folders (id, name) VALUES (?,?)`;
    connection.query(sql1, (err, results) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error getting folder id!`);
      }
      console.log(results[0])
      let folderId = (results[0] === undefined) ? 1 : results[0].id + 1;
      const path = `./public/hr_folders/${folderId}`;
      console.log(path);
      connection.query(sql2, [folderId, newName], (err, results) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Adding folder!`);
        }
        fs.access(path, (err) => {
          // Check if the folder already exists
          if (err) {
            fs.mkdir(path, (err) => {
              if (err) {
                console.error(`Error creating folder: ${err}`);
                res.status(500).send(`Error creating folder`);
              } else {
                console.log(`Folder created: ${path}`);
              }
            });
          }
        });
      });
    });
  }
  res.status(201).redirect('/Document');
});
// Deleting folder
app.get('/Document/:id/Delete', (req, res) => {
  const folderId = parseInt(req.params.id);
  const sql = `DELETE folders, files FROM folders LEFT JOIN files ON folders.id = files.folder WHERE folders.id = ?;`;
  connection.query(sql, [folderId], (err, results) => {
    if (err) {
      console.error(`Error deleting folder from database: ${err}`);
      res.status(500).send(`Error deleting folder`);
    } else {
      const path = `./public/hr_folders/${folderId}`;
      fs.rmdir(path, { recursive: true }, (err) => {
        if (err) {
          console.error(`Error deleting folder from ./public/hr_folders: ${err}`);
          res.status(500).send(`Error deleting folder`);
        } else {
          console.log(`Folder deleted: ${path}`);
          res.status(201).redirect('/EditDocument');
        }
      });
    }
  });
});
// Display Folder contents
app.get('/Document/:id', (req, res) => {
  const folderId = parseInt(req.params.id);
  const sql = `SELECT Fi.id AS fileId, Fi.name AS fileName, Fi.size, Fi.type, Fo.id AS Folderid, Fo.name AS folderName FROM files AS Fi INNER JOIN folders AS Fo ON Fi.folder = Fo.id WHERE Fi.folder = ?`;
  connection.query(sql, [folderId], (err, results1) => {
    let files;
    let folder;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving files!`);
    }
    files = results1;
    const sql = `SELECT * from folders WHERE id = ?`;
    connection.query(sql, [folderId], (err, results2) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Retrieving folder!`);
      }
      folder = results2[0];
      // Render HTML page with data
      res.render('document_file', { files, folder });
    });
  });
});
// Display edit page
app.get('/Document/:id/Edit', (req, res) => {
  const folderId = parseInt(req.params.id);
  const sql = `SELECT files.id, files.name, files.size, files.type, folders.id AS folderId, folders.name AS folderName FROM files RIGHT JOIN folders ON files.folder = folders.id WHERE folders.id = ?;`;
  connection.query(sql, [folderId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving files!`);
    }
    // Render HTML page with data
    res.render('document_file_edit', { files: results });
  });
});
// Form processing
app.post('/Document/:id/Edit', upload.single('fileUpload'), (req, res) => {
  const folderId = parseInt(req.params.id);
  let date = new Date();
  let formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  // Obtaining the variable no. of paremeters
  let names = {};
  for (const key in req.body) {
    if (key.startsWith('name')) {
      const nameNumber = key.slice(4);
      names[nameNumber] = req.body[key];
    }
  }
  console.log(names);
  // Updating the Folders
  if (names.length !== 0) {
    for (let key in names) {
      const sql1 = `SELECT name FROM files WHERE id = ?;`;
      const sql2 = `UPDATE files SET name = ? WHERE id = ?;`;
      let currPath; let newPath;
      console.log(sql1);
      console.log(sql2);
      connection.query(sql1, [key], (err, results) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error getting file names!`);
        }
        currPath = `./public/hr_folders/${folderId}/${results[0].name}`
        console.log(currPath);
        connection.query(sql2, [names[key], key], (err, results) => {
          if (err) {
            console.error(`Database query error: ${err.message}`);
            return res.status(500).send(`Error Updating file names!`);
          }
          // Change file name
          newPath = `./public/hr_folders/${folderId}/${names[key]}`
          console.log(newPath);
          fs.rename(currPath, newPath, (err) => {
            if (err) {
              console.error(`Error renaming file: ${err}`);
              res.status(500).send(`Error renaming file`);
            } else {
              console.log(`File renamed: ${currPath} to ${newPath}`);
            }
          })
        });
      })
    }
  }
  // Adding the Folder
  if (req.file) {
    const sql = `INSERT INTO files (folder, name, size, type) VALUES (?, ?, ?, ?);`;
    let fileName = `${formattedDate}-${req.file.originalname}`
    connection.query(sql, [folderId, fileName, req.file.size, req.file.mimetype], (err, results) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error uploading file!`);
      }
      console.log(`File uploaded: ${fileName}`);
    });
  } else if (!req.file) {
    console.log(`No file uploaded`);
  }
  res.status(201).redirect(`/Document/${folderId}`);
});
// Download route
app.get('/Document/:id/:fileId/Download', (req, res) => {
  const folderId = parseInt(req.params.id);
  const fileId = parseInt(req.params.fileId);
  const sql = `SELECT name FROM files WHERE id = ?;`;
  connection.query(sql, [fileId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error getting file!`);
    }
    const fileName = results[0].name;
    const file = `./public/hr_folders/${folderId}/${fileName}`;
    res.download(file);
    console.log(`File downloaded: ${fileName}`);
  });
})
// File Deletion
app.get('/Document/:id/:fileId/Delete', (req, res) => {
  const folderId = parseInt(req.params.id);
  const fileId = parseInt(req.params.fileId);
  const sql1 = `SELECT name FROM files WHERE id = ?;`;
  const sql2 = `DELETE FROM files WHERE id = ?;`;
  connection.query(sql1, [fileId], (err, results) => {
    let fileName;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error getting file!`);
    } else {
      fileName = results[0].name;
      connection.query(sql2, [fileId], (err, results) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
          return res.status(500).send(`Error Deleting file!`);
        } else {
          console.log(`File deleted: ${fileId}: ${fileName}`);
          const path = `./public/hr_folders/${folderId}/${fileName}`;
          fs.rm(path, (err) => {
            if (err) {
              console.error(`Error deleting folder from ./public/hr_folders/${folderId}: ${err}`);
              res.status(500).send(`Error deleting file`);
            } else {
              console.log(`File deleted: ${path}`);
              res.redirect(`/Document/${folderId}/Edit`);
            }
          });
        }
        }
      );
    }
  });
});

// Programmes
app.get('/ProgrammeCategory', (req, res) => {
  const sql = `SELECT * FROM programmetypes`;
  // Fetch data from MySQL
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving programmetypes!`);
    }
    // Render HTML page with data
    res.render('programme_category', { programmeCategories: results });
  });
});

app.get('/ProgrammeCategory/Edit', (req, res) => {
  const sql = `SELECT * FROM programmetypes`;
  // Fetch data from MySQL
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving programmetypes!`);
    }
    // Render HTML page with data
    res.render('programme_category_edit', { programmeCategories: results });
  });
});

app.post('/ProgrammeCategory/Edit', (req, res) => {
  // Obtaining the variable no. of paremeters
  let names = {};
  for (const key in req.body) {
    if (key.startsWith('name')) {
      let id = key.slice(4);
      names[parseInt(id)] = [req.body[key], req.body[`desc${id}`]];
    }
  }
  // Obtaining the last parameter (newName)
  let newName = req.body.newName;
  newName = newName === '' ? null : newName;
  let newDesc = req.body.newDesc;
  newDesc = newDesc === '' ? null : newDesc;
  const sql = `UPDATE programmetypes SET name = ?, description = ? WHERE id = ?`;
  for (let key in names) {
    connection.query(sql, [names[key][0], names[key][1], key], (err, results) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Updating folder!`);
      }
    });
  }
  // Adding the ProgrammeType
  if (newName === null) {
    const sql = `INSERT INTO programmetypes (name, description) VALUES (?, ?)`;
    connection.query(sql, [newName, newDesc], (err, results) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Adding programmetypes!`);
      }
    });
  }
  res.status(201).redirect('/ProgrammeCategory');
});

app.post('/ProgrammeCategory/Add', (req, res) => {
  const { newName, newDesc } = req.body;
  const sql = `INSERT INTO programmetypes (name, description) VALUES (?, ?);`;
  connection.query(sql, [newName, newDesc], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Adding programmetype!`);
    }
    res.status(201).redirect('/ProgrammeCategory/Edit');
  });
});

app.get('/ProgrammeCategory/:id/Delete', (req, res) => {
  const categoryId = req.params.id;
  const sql = `DELETE programmetypes, programmes FROM programmetypes LEFT JOIN programmes ON programmes.category = programmetypes.id WHERE programmetypes.id = ?;`;
  connection.query(sql, [categoryId], (err, results) => {
    if (err) {
      console.error(`Error deleting programmetype: ${err}`);
      res.status(500).send(`Error deleting programmetype!`);
    } else {
      res.redirect(`/ProgrammeCategory/Edit`);
    }
  });
});

app.get('/ProgrammeCategory/:id', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const sql = `SELECT P.name AS PN, P.id AS PID, PT.name AS PTN, PT.id AS PTID FROM programmes AS P RIGHT JOIN programmetypes AS PT ON P.category = PT.id WHERE PT.id = ?;`;
  connection.query(sql, [categoryId], (err, results1) => {
    let relatedProgrammes;
    let employees;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving programmes!`);
    }
    relatedProgrammes = results1;
    const sql = `SELECT id, CONCAT(firstName, ' ', lastName) AS name FROM employees`;
    connection.query(sql, (err, results2) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Retrieving employees!`);
      }
      // Render HTML page with data
      employees = results2;
      res.render('programme', { relatedProgrammes, employees });
    });
  });
});

app.post('/ProgrammeCategory/:id/Add', (req, res) => {
  const categoryId = parseInt(req.params.id);
  console.log(categoryId);
  const { newName, newDuration, newLead, newLessons } = req.body;
  const sql = `INSERT INTO programmes (category, name, lead, lessons, duration) VALUES (?, ?, ?, ?, ?);`;
  connection.query(sql, [categoryId, newName, newLead, newLessons, newDuration], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Adding programme!`);
    }
    res.status(201).redirect(`/ProgrammeCategory/${categoryId}`);
  });
});

app.get('/ProgrammeCategory/:id/:pid', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const programmeId = parseInt(req.params.pid);

  const sql = `SELECT P.id AS PID, PT.id AS PTID, P.name AS PN, PT.name AS PTN, P.lessons AS lessons, P.duration AS duration, P.lead AS leadId, CONCAT(E.firstName, ' ', E.lastName) AS lead FROM programmes P LEFT JOIN programmetypes PT ON P.category = PT.id LEFT JOIN employees E ON P.lead = E.id WHERE P.id = ?;`;
  connection.query(sql, [programmeId], (err, results1) => {
    let programme;
    let employeesInvolved;
    let employees;
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving programme details!`);
    }
    programme = results1;
    const sql = `SELECT E.id AS emId, EHP.enrollDate, CONCAT(E.firstName, ' ', E.lastName) AS name, S.name AS SN FROM employee_has_programme EHP JOIN employees E ON EHP.employee = E.id JOIN statuses S ON EHP.status = S.id WHERE programme = ?;`;
    connection.query(sql, [programmeId], (err, results2) => {
      if (err) {
        console.error(`Database query error: ${err.message}`);
        return res.status(500).send(`Error Retrieving employeesInvolved!`);
      }
      employeesInvolved = results2;
      const sql = `SELECT id, CONCAT(firstName, ' ', lastName) AS name FROM employees`;
      connection.query(sql, (err, results3) => {
        if (err) {
          console.error(`Database query error: ${err.message}`);
        }
        employees = results3;
        // Render HTML page with data
        res.render('programme_detail', { programme: programme[0], employeesInvolved: employeesInvolved, employees: employees });
      });
    });
  });
});

app.post('/ProgrammeCategory/:id/:pid/Edit', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const programmeId = parseInt(req.params.pid);
  const { newName, newLead, newLessons, newDuration } = req.body;
  const sql = `UPDATE programmes SET name = ?, lead = ?, lessons = ?, duration = ? WHERE id = ?;`;
  connection.query(sql, [newName, newLead, newLessons, newDuration, programmeId], (err, results) => {
    if (err) {
      console.error(`Error editing programme: ${err}`);
      res.status(500).send('Error Updating programme!');
    } else {
      res.status(201).redirect(`/ProgrammeCategory/${categoryId}/${programmeId}`);
    }
  });
});

app.get('/ProgrammeCategory/:id/:pid/Delete', (req, res) => {
  const categoryId = parseInt(req.params.id);
  const programmeId = parseInt(req.params.pid);
  const sql = `DELETE FROM programmes WHERE programmes.id = ?;`;
  connection.query(sql, [programmeId], (err, results) => {
    if (err) {
      console.error(`Error deleting programme: ${err}`);
      res.status(500).send(`Error deleting programme!`);
    } else {
      res.redirect(`/ProgrammeCategory/${categoryId}/`);
    }
  });
});

app.get('/Announcement', (req, res) => {
  const sql = `SELECT A.id, A.title, A.body, A.dateCreated, E.firstName FROM announcements AS A LEFT JOIN employees AS E ON A.employee = E.id ORDER BY A.dateCreated DESC;`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving announcements!`);
    }
    res.render('announcement', { announcements: results });
  });
});

app.get('/Announcement/Add', (req, res) => {
  res.render('announcement_add');
});

app.post('/Announcement/Add', (req, res) => {
  const { newTitle, newBody } = req.body;
  const sql = `INSERT INTO announcements (employee, dateCreated, dateModified, title, body) VALUES (?, ?, ?, ?, ?)`;
  const now = new Date();
  connection.query(sql, [1, now, now, newTitle, newBody], (err, results) => {
    if (err) {
      console.error(`Error adding announcement: ${err}`);
      res.status(500).send('Error Adding announcement!');
    } else {
      res.redirect('/Announcement');
    }
  });
});

app.get('/Announcement/:id', (req, res) => {
  const announcementId = parseInt(req.params.id);
  const sql = `SELECT A.id AS AID, A.title, A.body, A.dateCreated, A.dateModified, CONCAT(E.firstName, ' ', E.lastName) AS name FROM announcements AS A LEFT JOIN employees AS E ON A.employee = E.id WHERE A.id = ?;`;
  connection.query(sql, [announcementId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving announcement!`);
    }
    if (results.length > 0) {
      res.render('announcement_detail', { announcement: results[0] });
    } else {
      res.status(404).send(`Announcement ${announcementId} not found`);
    }
  });
});

app.get('/Announcement/:id/Edit', (req, res) => {
  const announcementId = parseInt(req.params.id);
  const sql = `SELECT A.id AS AID, A.title, A.body, A.dateCreated, A.dateModified, CONCAT(E.firstName, ' ', E.lastName) AS name FROM announcements AS A LEFT JOIN employees AS E ON A.employee = E.id WHERE A.id = ?;`;
  connection.query(sql, [announcementId], (err, results) => {
    if (err) {
      console.error(`Database query error: ${err.message}`);
      return res.status(500).send(`Error Retrieving announcement!`);
    }
    if (results.length > 0) {
      res.render('announcement_edit', { announcement: results[0] });
    } else {
      res.status(404).send(`Announcement ${announcementId} not found`);
    }
  });
});

app.post('/Announcement/:id/Edit', (req, res) => {
  // Obtaining the parameters
  const announcementId = parseInt(req.params.id);
  const { newTitle, newBody } = req.body;
  const now = new Date();

  sql = `UPDATE announcements SET dateModified = ?, title = ?, body = ? WHERE id = ?;`;
  connection.query(sql, [now, newTitle, newBody, announcementId], (err, results) => {
    if (err) {
      console.error(`Error editing announcement: ${err}`);
      res.status(500).send('Error Updating announcement!');
    } else {
      res.status(201).redirect(`/Announcement/${announcementId}`);
    }
  });
});

app.get('/Announcement/:id/Delete', (req, res) => {
  const announcementId = parseInt(req.params.id);
  const sql = `DELETE FROM announcements WHERE announcements.id = ?;`;
  connection.query(sql, [announcementId], (err, results) => {
    if (err) {
      console.error(`Error deleting announcement: ${err}`);
      res.status(500).send(`Error deleting announcement!`);
    } else {
      res.redirect(`/Announcement`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
