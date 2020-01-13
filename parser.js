const puppeteer = require('puppeteer');

//constants
const SITE = "http://www.bondcoder.com";


let browser = {};



//start parsing for site
async function startParsing(){
   try{

    browser =  await puppeteer.launch({headless: false, ignoreHTTPSErrors: true, args: ['--no-sandbox']});

    await getPostsNames(browser);
    
    // const page = await browser.newPage();
    // await page.goto(SITE, { timeout: 0, waitUntil: "networkidle0" });

    // const categories = await getCategories(page);
    // console.log(categories);

    // const numberOfPages = await getPageNumbers(page);
    //   console.log(numberOfPages);
   


    //  await page.close();

    console.log("PARSING PROCESS SUCCESSFULLY ENDED");
    // await finish();

   }
   catch(err){
     console.log(err);
    await finish();
   }
}


//get categories from site
async function getCategories(page){
    try{
 
     let result = await page.evaluate(() => {
        const categories = [];
        const categoriesElems = document.querySelectorAll("#categories-2 .cat-item");
        
        for(let i=0; i<categoriesElems.length; i++){
           categories.push( (categoriesElems[i].innerText) );
        }
        
        return categories;

     });
 
    //  await page.close();      
     
     return result;
 
    }
    catch(err){
      console.log(err);
    }
 }


 async function getPostsNames(browser){
    const page = await browser.newPage();
    await page.goto(SITE, { timeout: 0, waitUntil: "networkidle0" });
    let currentPage = 1;
    let pageRef = true; 
    //visit all pages
    while(pageRef){
        pageRef = await getPageRef(page, currentPage++);

    }
 }

//get refs for pages
async function getPageRef(page, numberOfNewPage){
    return await page.evaluate(() => {
        let pageRef;

        const pagesRefsElem = document.querySelectorAll(".page-numbers");
        for(let i=0; i < pagesRefsElem.length; i++){
            if( pagesRefsElem.innerText === numberOfNewPage){
             pageRef = pagesRefsElem[i].getAttribute("href");
             break;
            }

        }

        return pageRef;
       
    });
} 


//posts from page
async function postsFromPage(page){
    await page.evaluate(() => {
        await page.goto(SITE, { timeout: 0, waitUntil: "networkidle0" });
   });
}

async function finish(){
  await browser.close();
  process.exit();
}


startParsing();