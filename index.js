const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function readDataFromFile() {
    try {
      const data = await fs.readFile('students.json', 'utf8');
      if(!data.trim()){
        return[];
      }
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      } else {
        console.error('Error reading data from file:', error.message);
        return [];
      }
    }
}

async function writeDataToFile(data) {
 try {
      await fs.writeFile('students.json', JSON.stringify(data, null, 2), 'utf8');
 } catch (error) {
   console.error('Error writing data to file:', error.message);
 }
}

function paginateItems(items, cursor, perPage = 10) {
    const start = cursor ? parseInt(cursor) : 0;
    const end = start + perPage;
    return {
      data: items.slice(start, end),
      cursor: end < items.length ? end.toString() : null,
    };
  }

app.post('/students', async (req, res) => {
    try {
      const students = await readDataFromFile();
      const newStudent = {
        id: students.length + 1,
        name: req.body.name,
        age: req.body.age,
        grade: req.body.grade
      };
      students.push(newStudent);
      await writeDataToFile(students);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error('Error handling POST request:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.get('/students/:id', async(req,res) => {
    try {
        const students = await readDataFromFile();
        const studentId = parseInt(req.params.id);
        const foundStudent = students.find((student) => student.id === studentId)
        if (foundStudent) {
            res.json(foundStudent);
          } else {
            res.status(404).json({ error: 'Student not found' });
          }
    } catch (error) {
        console.error('Error handling POST request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/students',async(req,res) =>{
    try {
        const students = await readDataFromFile();
        const cursor = req.query.cursor;
        const paginatedStudentsList = paginateItems(students, cursor);
        res.json(paginatedStudentsList)
        
    } catch (error) {
        console.error('Error handling POST request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });        
    }
})

app.put('/students/:id', async(req,res) => {
    try {
        const students = await readDataFromFile();
        const studentId = parseInt(req.params.id);
        const foundStudent = students.find((student) => student.id === studentId)
        if(foundStudent){
            foundStudent.name = req.body.name;
            foundStudent.age = req.body.age;
            foundStudent.grade = req.body.grade;
            await writeDataToFile(students);
            res.json(foundStudent);
    } else {
      res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        console.error('Error handling POST request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
})

app.delete('/students/:id', async(req,res) => {
    try {
        const students = await readDataFromFile();
        const studentId = parseInt(req.params.id);
        const updatedStudents = students.filter((s) => s.id !== studentId);
        await writeDataToFile(updatedStudents);
        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        console.error('Error handling POST request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
})
  

app.listen( PORT, ()=> {
    console.log(`Successfully started server on port ${PORT}.`)
}
)
