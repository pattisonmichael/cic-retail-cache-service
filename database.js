var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)';
                db.run(insert, ["admin","admin@example.com",md5("admin123456")]);
                db.run(insert, ["user","user@example.com",md5("user123456")]);
            }
        });  
        // Create Orders table
        console.log("Create order table");
        db.run(`CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_date TEXT,
            payed TEXT,
            userid INTEGER
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO orders (order_date,payed,userid) VALUES (?,?,?)';
                db.run(insert, ["2022-09-14 10:00:00","FALSE",1]);
            }
        });  
        console.log("Create order_details table")
        // Create Orders table
        db.run(`CREATE TABLE order_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            item TEXT NOT NULL,
            desc TEXT,
            price FLOAT NOT NULL,
            qty INTEGER NOT NULL,
            FOREIGN KEY (order_id)
                REFERENCES orders (order_id)
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO order_details (order_id, item, desc, price, qty) VALUES (?,?,?,?,?)'
                db.run(insert, ["1","Item 1","Cool Item 1", "1.00","1"])
                db.run(insert, ["1","Item 2","Cool Item 2", "2.50","2"])
            }
        });  

    }
});


module.exports = db