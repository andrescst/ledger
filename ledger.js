const program = require('commander');
const fs = require('fs');

function parseQuantity(quantity) {  

  
  let float = quantity.replace(/[^\d.-]/g, "").trim();
  return parseFloat(float);
}
function parseCurrency(quantity) {
  return quantity.replace(/[,-\d.]/g, "").trim();
}




function isValidDate(date){
    return new Date(date);
    
}

class Entry {
  constructor(date, description, senderAccount, senderQuantity, receiverAccount, receiverQuantity){
    this.date = date;
    this.description = description;
    this.senderAccount = senderAccount;
    this.senderQuantity = senderQuantity;
    this.receiverAccount = receiverAccount;
    this.receiverQuantity = receiverQuantity;
  }

  
}

class Commodity {
  constructor(indicator, date, symbol, price){
    this.indicator = indicator;
    this.date = date;
    this.symbol = symbol;
    this.price = price;
  }

  get indicator(){
    return this._indicator;
  }
  set indicator(value){
     this._indicator = value;
  }
  get date(){
    return this.date;
  }
  set date(value){
    this._date = value;
 }
  get time(){
    return this._time;
  }
  set time(value){
    this._time = value;
 }
  get symbol(){
    return this._abbrevation;
  }
  set symbol(value){
    this._symbol = value;
 }
  get price(){
    return this._price;
  }
  set price(value){
    this._price = value;
  }
}

class Ledger {

  constructor(){
    this.file = null;
    this.sortBy = 'd';
  }
  parseEntries(){
    this.entries = []
    this.files.forEach(file => {
      let lines = fs.readFileSync(file.trim() , 'utf8').split("\n").filter(word => word.length > 0 && !word.startsWith(";"));

      for (let index = 0; index < lines.length; index = index + 3) {
          let firstLine = lines[index].split(" ");
          let secondLine = lines[index+1].trim().replace(/\t/g, '\t').split("\t").filter(word => word.length > 0);
          let thirdLine = lines[index+2].trim().replace(/\t/g, '\t').split("\t").filter(word => word.length > 0);
          
          let date = isValidDate(firstLine.shift());
          
          let description = firstLine.join(" ");

          let senderAccount = secondLine[0];
          let senderQuantity = secondLine[1];


          let receiverAccount = thirdLine[0];
          let receiverQuantity = senderQuantity;
          if (thirdLine[1]) receiverQuantity = thirdLine[1];

          if(parseQuantity(senderQuantity) == parseQuantity(receiverQuantity)){
            receiverQuantity = parseCurrency(senderQuantity) +''+ (parseQuantity(senderQuantity)*(-1));
            
          };
          this.entries.push(new Entry(date, description, senderAccount, senderQuantity, receiverAccount, receiverQuantity))
        }
    });
  }
  parseCommodities(lines){
    this.commodities = [];
    let indicator;
    let date;
    let symbol;
    let price;
    let splitLine;

    lines.forEach(line => {
       if (line.startsWith('D')) {
        splitLine = line.split(' ');
        indicator = 'D';
        date = null;
        symbol = parseCurrency(splitLine[1]);
        price = parseQuantity(splitLine[1]);
        this.commodities.push(new Commodity(indicator, date, symbol, price))
       } else if (line.startsWith('N')){
        splitLine = line.split(' ');
        indicator = 'N';
        date = null;
        symbol = parseCurrency(line.split(' ')[1]);
        price = null;
        this.commodities.push(new Commodity(indicator, date, symbol, price))
       } else if (line.startsWith('P')){
        splitLine = line.split(' ');
        indicator = 'P';
        
        date = isValidDate(splitLine[1] + ' '+ splitLine[2]);

        symbol = splitLine[3];
        price = parseQuantity(splitLine[4]);
        
        this.commodities.push(new Commodity(indicator, date, symbol, price))
       }
      
    });

  }
  readIndexFile(strPath) {
    let files;
  
      try {
        const data = fs.readFileSync(strPath, 'utf8');
        files = data.trim().split("!include ").filter(word => word.length > 0);
        return files;
      } catch (err) {
        console.error(err)
      }
  }
  readDbFile(strPath) {
    let db;
  
      try {
        const data = fs.readFileSync(strPath, 'utf8').trim().split("\n").filter(word => word.length > 0 && !word.startsWith(";"));
        return data;
      } catch (err) {
        console.error(err)
      }
  }
  setDb(path){
    let lines = this.readDbFile(path);
    this.parseCommodities(lines);  
    
  }
  balance(){
    let accounts = new Map();
    this.entries.forEach(entry => {
      let sender = entry.senderAccount.trim();
      let sentMoney = entry.senderQuantity;
      let receiver = entry.receiverAccount.trim();
      let receivedMoney = entry.receiverQuantity;
    
      if(!accounts.has(sender)){
        
        accounts.set(sender, [sentMoney]);
      } else {
        let floatAmount = 0;
        
        
        
        accounts.get(sender).push(sentMoney);
        
      }

      if(!accounts.has(receiver)){
        
        accounts.set(receiver, [receivedMoney]);
      } else {
        
        accounts.get(receiver).push(receivedMoney);
      }      
    
    });

    Array.from(accounts.keys()).sort().forEach(account => {
      console.log(account + " " + parseCurrency(accounts.get(account)[0])  + accounts.get(account).reduce((pv, cv) => pv + parseQuantity(cv), 0));  
    });
      console.log('----------------------------------------------------------');
      
    
    let balance = new Map();
    
    Array.from(accounts.values()).forEach(accounTransaction => {
      accounTransaction.forEach(value => {
        if(this.commodities){

        }else{
          let currentCurrency = parseCurrency(value);
          if(!balance.has(currentCurrency)){
            balance.set(currentCurrency, parseQuantity(value));
          } else {
            balance.set(currentCurrency, balance.get(currentCurrency) + parseQuantity(value));
          }
        }
        
      });
    });
    Array.from(balance.keys()).forEach(currency => {
      if(currency === '$'){
      console.log(currency +''+ balance.get(currency));
      } else {
        console.log(balance.get(currency) +' '+ currency);
      }
      
    });
    
    
  }
  register(){
    let accounts = new Map();
    let remaining = new Map();

    this.entries.forEach(entry => {
      let sender = entry.senderAccount.trim();
      let sentMoney = entry.senderQuantity;
      let receiver = entry.receiverAccount.trim();
      let receivedMoney = entry.receiverQuantity;
      
      if(!accounts.has(sender)){
        accounts.set(sender, [sentMoney]);
      } else {
        accounts.get(sender).push(sentMoney);
      }

      if(!accounts.has(receiver)){
        accounts.set(receiver, [receivedMoney]);
      } else{
        accounts.get(receiver).push(receivedMoney);
      }      

      console.log(entry.date.getFullYear()+"/"+entry.date.getMonth()+"/"+entry.date.getDate() + " " + entry.description + "\t\t" + entry.senderAccount +"\t"+sentMoney +"\t\t"+sentMoney);
      
      if (parseQuantity(sentMoney) === parseQuantity(receivedMoney)*(-1)){
        console.log("\t\t\t\t\t" + entry.receiverAccount +"\t"+ receivedMoney +"\t\t"+ 0);
      } else {
        let currentReceived = parseCurrency(receivedMoney);
        let currentSent = parseCurrency(sentMoney);

        if (!remaining.has(currentReceived)){
          remaining.set(currentReceived, parseQuantity(receivedMoney));
          console.log("\t\t\t\t\t" + entry.receiverAccount +"\t"+ receivedMoney +"\t\t"+ sentMoney);
        } else {
          remaining.set(currentReceived, remaining.get(currentReceived) + parseQuantity(receivedMoney));
          Array.from(remaining.values()).forEach(element => {
          
          });
        } 
        if (!remaining.has(currentSent)){
          
          remaining.set(currentSent, parseQuantity(sentMoney));
          console.log("\t\t\t\t\t" + entry.receiverAccount +"\t"+ receivedMoney +"\t\t"+ receivedMoney);
        } else {
          remaining.set(currentSent, remaining.get(currentSent) + parseQuantity(sentMoney));
          Array.from(remaining.values()).forEach(element => {
            
          });
        }
        
      }
    });

    
    console.log(remaining);
    
  }

  print(){
    this.entries.forEach(entry => {
      console.log(entry.date.getFullYear()+"/"+entry.date.getMonth()+"/"+entry.date.getDate() + " " + entry.description);
      console.log("\t"+ entry.senderAccount + "\t\t\t" + entry.senderQuantity);
      console.log("\t"+ entry.receiverAccount);
    });
  }

  sort(sortBy){
    this.sortBy = sortBy;
    switch (this.sortBy) {
      case 'd':
        this.entries = this.entries.sort(function(entry, nextEntry){
          return entry.date > nextEntry.date});
        break;
      default:
        console.err(this.sortBy + ' is not valid');
        break;
    }
    
  }

  init(path){
    this.files = this.readIndexFile(path);
    this.parseEntries(); 
    
  }
}


  
var ledger = new Ledger();
  
function init(path){
  ledger.init(path);
}
function setDb(path){
  ledger.setDb(path);
}
function bal(accounts){
  ledger.balance();
}

function reg(accounts){

  ledger.register();
}

function sort(sortBy){
  ledger.sort(sortBy);
}

function print(accounts){
  ledger.print();
}

program
  .option('-f, --file <file name>', 'File name argument', init)
  .option('--price-db <commodities file name>', 'DB name argument', setDb)
  .option('--sort <Value expression>', 'Value expression argument', sort);
program
  .command('bal [accounts...]')
  .action(function (accounts) {
    bal(accounts);
  });
program
  .command('balance [accounts...]')
  .action(function (accounts) {
    bal(accounts);
  });
 program.command('print [accounts...]')
  .action(function (accounts) {
    print(accounts);
  });
program.command('reg [accounts...]')
  .action(function (accounts) {
    reg(accounts);
  });
program.parse(process.argv);
 
