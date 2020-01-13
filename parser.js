const puppeteer = require('puppeteer');

//constants
const SITE = "http://www.bondcoder.com";


let browser = {};


//start parsing for site
async function startParsing(){
   try{

    browser =  await puppeteer.launch({headless: false, ignoreHTTPSErrors: true, args: ['--no-sandbox']});

   console.log("CATEGORIES");
   console.log(await getCategories());
   console.log("ALL POSTS NAMES ");
   console.log(  await getPostsNames() );
    console.log("PARSING PROCESS SUCCESSFULLY ENDED");
    await finish();

   }
   catch(err){
     console.log(err);
    await finish();
   }
}



//get post names from all pages
 async function getPostsNames(ref=SITE){

    let page;
 
    const postTitles = [];
    let currentPage = 1;
    let nextPageRef = true; 

    //visit all pages
    while(nextPageRef){
        
        page = await browser.newPage();

        if(currentPage === 1){
            await page.goto(ref, { timeout: 0, waitUntil: "networkidle0" });
        }else{
            await page.goto(nextPageRef, { timeout: 0, waitUntil: "networkidle0" });
        }
      

        //collect from this page
        postTitles.push( ...await getPostsFromPage(page) );
        nextPageRef = await getNextPageRef(page, ++currentPage);
        await page.close();
    }

    return postTitles;
 }

 //get posts from the page
async function getPostsFromPage(page){

    
    
  return await page.evaluate(()=>{
        const postsTitles = [];
        let postsTitleEls = document.querySelectorAll(".post-title");
         
        for(let i=0; i<postsTitleEls.length; i++){
            postsTitles.push(postsTitleEls[i].innerText);
        }

        return postsTitles;

  });
}

//get refs for pages
async function getNextPageRef(page, numberOfNewPage){
    return await page.evaluate((numberOfNewPage) => {
        let pageRef;

        const pagesRefsElem = document.querySelectorAll(".page-numbers");
        for(let i=0; i < pagesRefsElem.length; i++){

            if( pagesRefsElem[i].innerText == numberOfNewPage){
             return pagesRefsElem[i].getAttribute("href");
            }

        }

        return pageRef;
       
    }, numberOfNewPage);
} 


async function finish(){
  await browser.close();
  process.exit();
}


//get categories from site
async function getCategories(){
    try{
     
     const page = await browser.newPage();
     await page.goto(SITE, { timeout: 0, waitUntil: "networkidle0" });
     
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



startParsing();