# Ledger
Simpler ledger implementation in javascript.

# Usage
Before using it make sure you had properly created your entries files with .ledger termination (for more information please visit [Keeping a journal](https://www.ledger-cli.org/3.0/doc/ledger3.html#Keeping-a-Journal))

After having all your .ledgers files with correct entries data you need to create and index file, on each line put the directive "!include " and the name of the ledger file you want to add.

# Run
node ledger.js [options] [commands]

# Options
### Required 
  -f <path_to_file>
  --file <path_fo_file>

### Optional 
  --sort VALEXPR [ValueExpressions](https://www.ledger-cli.org/3.0/doc/ledger3.html#Value-Expressions)
  
  --price_db <price_db_name>
  
# Commands 
### Supported
  bal [accounts]
  balance [accounts]
  
  print [accounts]
  
### Working on it
  reg [accounts]
  register [accounts]
  
