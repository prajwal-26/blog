const express = require('express');
const axios = require('axios');
const _ = require('lodash'); // Import Lodash
const app = express();
const bodyParser = require('body-parser');
const blogRoutes = require('./routes/blogRoutes');

const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', blogRoutes);
app.use('/api',blogRoutes);
app.use('',blogRoutes);
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
