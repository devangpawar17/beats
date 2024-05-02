const puppeteer = require('puppeteer');
const xlsx = require('xlsx');
const path = require('path')
const fs = require('fs');

const emailGetter = async () => {
    const browser = await puppeteer.launch({
             executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });

    try {
        // Open a new page
        const page = await browser.newPage();

        const client = await page.createCDPSession()
        await client.send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: path.resolve('./documents')
        })
        console.log(client)        
        // Navigate to the website
        await page.goto('https://illpeoplemusic.com/');

        //screen size 
        await page.setViewport({ width: 1920, height: 1080 });

        // Wait for the page to load completely
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Target the sign-in button with href="javascript:void(0)"
        await page.evaluate(() => {
            const signInButton = document.querySelector('.nav-links a[href="javascript:void(0)"]');
            if (signInButton) {
                signInButton.click();
            } else {
                console.error('Sign-in button not found');
            }
        });

        // Fill in the email and password fields
        await page.type('input[name="email"]', 'devangpawar5@gmail.com');
        await page.type('input[name="password"]', 'Devang@5');

        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.click('.mdc-button__label');
        await new Promise(resolve => setTimeout(resolve, 5000));

        //Main email getter
        await page.evaluate(() => {
            const radioButton = document.querySelector('input[type="radio"][value="analytics"]');
            if (radioButton) {
                radioButton.click();
            } else {
                console.error('Analytics radio button not found');
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.evaluate(() => {
            const mp3DownloadsButton = [...document.querySelectorAll('button')].find(btn => btn.textContent.trim() === 'MP3 Downloads');
            if (mp3DownloadsButton) {
                mp3DownloadsButton.click();
            } else {
                console.error('MP3 Downloads button not found');
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.evaluate(() => {
            const sevenDaysButton = document.querySelector('button.btn.ipm-day-box.ng-star-inserted');
            if (sevenDaysButton && sevenDaysButton.textContent.trim() === '7D') {
                sevenDaysButton.click();
            } else {
                console.error('7D button not found');
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.evaluate(() => {
            const mp3DownloadsButton = document.querySelector('i.pi.pi-download');
            if (mp3DownloadsButton) {
                mp3DownloadsButton.click();
            } else {
                console.error('MP3 Downloads button not found');
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000));


        await browser.close();
 // Load the Excel file

        const folderPath = path.join(__dirname, 'documents');

        // Read the contents of the folder
        let excelFileName
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            // Filter out only Excel files
            const excelFiles = files.filter(file => file.endsWith('.xlsx'));

            if (excelFiles.length === 0) {
                console.log('No Excel files found in the folder.');
                return;
            }

            // Assuming there's only one Excel file, get its name
            excelFileName = excelFiles[0];
            console.log('Found Excel file:', excelFileName);

        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const workbook = xlsx.readFile(path.resolve(`./documents/${excelFileName}`));

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the sheet to JSON
        let emailData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
         [first,...emailData] = emailData

        const delFilePath = path.resolve(`./documents/${excelFileName}`); // Specify the path to the file you want to delete

        // Delete the file
        fs.unlink(delFilePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return;
            }
            console.log('File deleted successfully');
        });

        return emailData


    }
    catch (err) {
        await browser.close();
        console.log(err);
    }
}


module.exports = emailGetter  
