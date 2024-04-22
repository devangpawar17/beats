const puppeteer = require('puppeteer');

let dataObj = { totalLikedBeats: 0, totalMp3Downloads: 0, followers: 0 }

const dataScrapper = async () => {
    try {
        
        // Launch a headful browser
        const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
                                               });

        // Open a new page
        const page = await browser.newPage();

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

        // Extract the number of downloads
        const divWithTotalMP3Downloads = await page.evaluate(() => {
            const divs = document.querySelectorAll('div.ipm-sell-card');
            for (const div of divs) {
                const pTag = div.querySelector('p.gross_sales');
                if (pTag && pTag.textContent.trim() === 'Total MP3 downloads') {
                    const h3Tag = div.querySelector('h3.total_price');
                    if (h3Tag) {
                        return {
                            divHTML: div.outerHTML,
                            number: h3Tag.textContent.trim()
                        };
                    }
                }
            }
            return null;
        });

        if (divWithTotalMP3Downloads) {
            dataObj.totalMp3Downloads = divWithTotalMP3Downloads.number
        } else {
            console.log('Div with Total MP3 downloads not found.');
        }

        // Extract the total liked beats
        const divWithTotalLikedBeats = await page.evaluate(() => {
            const divs = document.querySelectorAll('div.ipm-sell-card');
            for (const div of divs) {
                const pTag = div.querySelector('p.gross_sales');
                if (pTag && pTag.textContent.trim() === 'Total Liked Beats') {
                    const h3Tag = div.querySelector('h3.total_price');
                    if (h3Tag) {
                        return {
                            divHTML: div.outerHTML,
                            number: h3Tag.textContent.trim()
                        };
                    }
                }
            }
            return null;
        });

        if (divWithTotalLikedBeats) {
            dataObj.totalLikedBeats = divWithTotalLikedBeats.number
        } else {
            console.log('Div with Total Liked beats not found.');
        }

        //get followers
        let titleNames
        await page.$$('.ipm-beat-section-list');
        const beatSections = await page.$$('.ipm-beat-section-list');
        for (const beatSection of beatSections) {
            // Query for all elements with the class "ipm-title-name" within the beat section
            titleNames = await beatSection.$$('.ipm-title-name');
      
        }
        titleNames[0].click()
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.click('.ipm-store-name');
        await new Promise(resolve => setTimeout(resolve, 5000));
        const followers = await page.evaluate(() => {
            const divElements = document.querySelectorAll('.ipm-icon-items');
            for (const divElement of divElements) {
              const imgElement = divElement.querySelector('img');
              if (imgElement && imgElement.getAttribute('src').includes('user-following-icon.svg')) {
                const valueSpan = divElement.querySelector('.ipm-value');
                if (valueSpan) {
                  return valueSpan.textContent.trim();
                }
              }
            }
            return null;
          });
        
        dataObj.followers = followers
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.goto('https://illpeoplemusic.com/dashboard');
        await new Promise(resolve => setTimeout(resolve, 5000));




        ///////////  get 5 beats stats  /////////

        // Query for all elements with the class "ipm-beat-section"

        let beatArr = []
        const beatStats = []

        // Loop through each beat section element
        const beatLooper = async () => {
            const beatSections = await page.$$('.ipm-beat-section-list');
            beatArr = []
            for (const beatSection of beatSections) {
                // Query for all elements with the class "ipm-title-name" within the beat section
                const titleNames = await beatSection.$$('.ipm-title-name');

                // Loop through each title name element within the beat section
                for (const titleName of titleNames) {
                    // Get the text content of each title name element
                    const textContent = await titleName.evaluate(element => element.textContent.trim());
                    // console.log('Title name:', textContent);
                    beatArr.push(titleName)
                }
            }
        }
        await beatLooper()

        //go to beat get data come back
        for (let i = 0; i < beatArr.length; i++) {
            await beatLooper()
            // console.log(beatArr);
            await beatArr[i].click()
            await new Promise(resolve => setTimeout(resolve, 5000));
            //get beat specific data
            const beatTitle = await page.evaluate(() => {
                const titles = document.querySelectorAll('.ipm-title');
                let beatName = "";
                titles.forEach(title => {
                    const textElement = title.querySelector('.ipm-text');
                    if (textElement) {
                        beatName = textElement.textContent.trim()
                    }
                });
                return beatName;
            });

            // Extract likes
            const likes = await page.evaluate(() => {
                const iconElement = document.querySelector('.pi-heart-fill');
                console.log('iconElement:', iconElement); // Check if the iconElement is found
                if (iconElement) {
                    // Traverse up the DOM to find the parent div
                    const parentDiv = iconElement.closest('.ipm-icon-items');
                    console.log('parentDiv:', parentDiv); // Check if the parentDiv is found
                    if (parentDiv) {
                        // Find the adjacent span with class 'ipm-value'
                        const adjacentValueElement = parentDiv.querySelector('.ipm-value');
                        console.log('adjacentValueElement:', adjacentValueElement); // Check if the adjacentValueElement is found
                        if (adjacentValueElement) {
                            return adjacentValueElement.textContent.trim();
                        }
                    }
                }
                return null;
            });

            // Extract downloads
            const downloads = await page.evaluate(() => {
                const iconElement = document.querySelector('.pi-download');
                console.log('iconElement:', iconElement); // Check if the iconElement is found
                if (iconElement) {
                    // Traverse up the DOM to find the parent div
                    const parentDiv = iconElement.closest('.ipm-icon-items');
                    console.log('parentDiv:', parentDiv); // Check if the parentDiv is found
                    if (parentDiv) {
                        // Find the adjacent span with class 'ipm-value'
                        const adjacentValueElement = parentDiv.querySelector('.ipm-value');
                        console.log('adjacentValueElement:', adjacentValueElement); // Check if the adjacentValueElement is found
                        if (adjacentValueElement) {
                            return adjacentValueElement.textContent.trim();
                        }
                    }
                }
                return null;
            });

            //get likes
            // Extract the value by checking the text content of the <li> element
            const plays = await page.evaluate(() => {
                const liElements = document.querySelectorAll('.ipm-items');
                for (const liElement of liElements) {
                    const firstSpan = liElement.querySelector('span:first-child');
                    if (firstSpan && firstSpan.textContent.trim() === 'Plays:') {
                        const secondSpan = liElement.querySelector('span:last-child');
                        if (secondSpan) {
                            return secondSpan.textContent.trim();
                        }
                    }
                }
                return null;
            });

            let beatStatsObj = { beatTitle, plays, likes, downloads }
            beatStats.push(beatStatsObj)

            await page.goto('https://illpeoplemusic.com/dashboard');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }



        //////////////////////


        // Take a screenshot (optional)
        await page.screenshot({ path: 'signin_page.png' });

        // Close the browser
        await browser.close();

        console.log(dataObj, beatStats);
        return [dataObj, beatStats]

    }
    catch (err) {
        console.log(err);
    }
};

module.exports = dataScrapper   
