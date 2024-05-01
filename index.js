const express = require('express');
const dataScrapper = require('./dataScrapper');
const emailGetter = require('./emailGetter');

// Creating an instance of express
const app = express();
var cron = require('node-cron');
const fs = require('fs');
const port = 3000; // You can change the port as needed

app.use(express.json());

//cron job to run the scrapper every one hour
cron.schedule('0 * * * *', async() => {
  try{
  const data = await dataScrapper()
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync('data.json', jsonData);
  console.log('Scrapper cron job ran - ',new Date(Date.now()).toLocaleString());
  }catch(e){
    console.log(e);
  }
});

cron.schedule('5 0 * * *', async () => {
  try {
    const data = await emailGetter()
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('emails.json', jsonData);
    console.log('got emails - ', new Date(Date.now()).toLocaleString());
    
  } catch (e) {
    console.log(e);
  }
});

app.get('/runScrapper', async (req, res) => {
  try {
    const data = await dataScrapper()
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('data.json', jsonData);
    console.log('Scrapper api hit at - ', new Date(Date.now()).toLocaleString());
    res.send("scarpped")
  } catch (e) {
    console.log(e);
  }
})

// get the data from json file
app.get('/getIPMData',(req,res)=>{
  try{
  const data = JSON.parse(fs.readFileSync('data.json'))
  res.json(data)
  }catch(e){
    res.status(400).send(e)
  }
})

//get emails from a json file
app.get('/getEmails', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('emails.json'))
    res.json(data)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
