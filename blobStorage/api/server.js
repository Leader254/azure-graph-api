const express = require('express');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api', fileRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;