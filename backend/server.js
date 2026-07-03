const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const rawData = fs.readFileSync('user.json');
    const users = JSON.parse(rawData);
    for(const user of users) {
        if(user.username === username) {
            return res.status(400).json({ message: "Username already exists." });
        }
    }
    const userId= Date.now();
    users.push({ userId, username, password });
    fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
    res.json({ userId });
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const rawData = fs.readFileSync('user.json');
    const users = JSON.parse(rawData);
    let usern= null;
    for(const user of users) {
        if(user.username === username) {
            if(user.password === password) {
                res.json({ userId: user.userId });
                usern = user.username;
                break;
            }
        }
    }
    if(!usern) {
        return res.status(400).json({ message: "Invalid username or password." });
    }
})

app.get('/:userId/entries', (req, res) => {
    const userId = parseInt(req.params.userId);
    const rawData = fs.readFileSync('diary.json');
    const entries = JSON.parse(rawData);
    const userEntries = entries.filter(entry => entry.userId === userId);
    res.json({ entries: userEntries.reverse() });
});

app.post('/:userId/entries/newentry', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { title, content } = req.body;
    const date= Date.now();
    const timestamp = new Date(date);
    const newEntry = {editId: date, userId, title, content, time: timestamp.toLocaleTimeString(), date: timestamp.toLocaleDateString()};
    const rawData = fs.readFileSync('diary.json');
    let entries = JSON.parse(rawData);
    entries.push(newEntry);
    fs.writeFileSync('diary.json', JSON.stringify(entries, null, 2));
    res.json({ message: "Entry saved successfully." });
});

app.put('/:userId/entries/editentry/:editId', (req, res) => {       
    const userId = parseInt(req.params.userId);
    const editId = parseInt(req.params.editId);
    const { title, content } = req.body;
    const rawData = fs.readFileSync('diary.json');
    let entries = JSON.parse(rawData);
    for (let entry of entries) {
        if (entry.userId === userId && entry.editId === editId) {
            entry.title = title;
            entry.content = content;
            break;
        }
    }
    fs.writeFileSync('diary.json', JSON.stringify(entries, null, 2));
    res.json({ message: "Entry updated successfully." });
});

app.delete('/entries/:editId', (req, res) => {
    const editId = parseInt(req.params.editId);
    const rawData = fs.readFileSync('diary.json');
    let entries = JSON.parse(rawData);
    entries = entries.filter(entry => entry.editId !== editId);
    fs.writeFileSync('diary.json', JSON.stringify(entries, null, 2));
    res.json({ message: "Entry deleted successfully." });
})

app.listen(3000);