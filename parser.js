// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const pluginProxy = require('puppeteer-extra-plugin-proxy');


puppeteer.use(pluginProxy({
  address: '117.1.16.131',
  port: 8080
}));

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

async function finish(){
    await browser.close();
    process.exit();
  }
  



//make parallel process
async function makeParallel(func, chunk, browser){
    try{
       if(!chunk||!chunk.length) throw new Error("Error in parallel processing!");
    await Promise.all(chunk.map(async(item)=>{
      return new Promise(async(resolve, reject)=>{
         //safe exit
        let clearID = setTimeout(()=>{
            resolve();
        }, 120000);
        
        
        await func(item, browser);
        clearTimeout(clearID);
        resolve();
    
      });
     })); //end of promise  
      }
      catch(err){
        console.log(err);
        return false;
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
 
     await page.close();      
     
     return result;
 
    }
    catch(err){
      console.log(err);
    }
 }

//divide array on n chunks
function divideOnChunks(array, numberInChunk){
    try{
     if(!array||!array.length|| !numberInChunk||!isNumeric(numberInChunk)|| numberInChunk<0) 
        throw new Error("Wrong params!");
     if(array.length < numberInChunk) return [array];
  
     let results = [];
     let tempList = [];
     for(let i=0; i<array.length;  i++)
     {
       tempList.push(array[i]);
  
       //if last
       if(i==array.length-1){
         //is not empty
         if(tempList.length)
           results.push([...tempList]);
           return results;  
       }
  
       //time to divide
       if( (i+1) % numberInChunk == 0){
         results.push([...tempList]);
         tempList.length = 0;
       }

     }
    }
    catch(err){
      console.log(err);
    }
  }


 startParsing();