// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var cors = require('cors')
//var md5 = require("md5")
//var jwt = require('express-jwt');
var { expressjwt: jwt } = require("express-jwt");
var jwks = require('jwks-rsa');

// Server port
var HTTP_PORT = process.env.PORT || 8000 ;

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://cic-retail-demo-hackathon.eu.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://cache-service',
  issuer: 'https://cic-retail-demo-hackathon.eu.auth0.com/',
  algorithms: ['RS256']
});
app.use(cors());
app.use(jwtCheck);
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
/*
app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    console.log("Update data: " + data.name)
    console.log(data)
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})
*/
//ORDERS
// Insert here other API endpoints
app.get("/api/orders", (req, res, next) => {
    //console.log(req)
    var sql = "select * from orders"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/user/:id/orders", (req, res, next) => {
    var sql = "select * from orders where userid = ?"
    var params = [req.params.id]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({
            "message":"success",
            "orders":rows
        })
      });
});

app.get("/api/order/:id", (req, res, next) => {
    var sql = "select * from orders where order_id = ?"
    var sql_details = "select * from order_details where order_id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }


        db.all(sql_details, params,(err, details) => {
            if (err) {
                res.status(400).json({"error":err.message});
                return;
            }
            res.json({
                "message":"success",
                "order_id":row,
                "items":details
            })

        })

        
      });
});

app.post("/api/order/", (req, res, next) => {
    var errors=[]
    if (!req.body.userid){
        errors.push("No user specified");
    }
    if (!req.body.order_date){
        errors.push("No order_date(YYYY-MM-DD HH:MM:SS) specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        order_date: req.body.order_date,
        userid: req.body.userid,
    }
    console.log(req.body)
    var sql ='INSERT INTO orders (order_date, userid) VALUES (?,?)'
    var params =[data.order_date, data.userid]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        var orderid = this.lastID;
        console.log("Insert order_details")
        console.log(req.body.items)
        for (item of req.body.items){
            var sql = 'INSERT INTO order_details (order_id, item, desc, price, qty) VALUES (?,?,?,?,?)'
            var params = [orderid,item.item, item.desc, item.price, item.qty]
            console.log(params)
            db.run(sql,params, function(err, result){
                if (err){
                    res.status(400).json({"error": err.message})
                    return;
                }
            })
        }
        
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.patch("/api/order/:id", (req, res, next) => {
    var data = {
        order_id: req.params.id,
        payed: req.body.payed,
        order_date : req.body.order_date
    }
    console.log("Update data: " + data.order_id)
    console.log(data)
    db.run(
        `UPDATE orders set 
           payed = COALESCE(?,payed) ,
           order_date = COALESCE(?,order_date)
           WHERE order_id = ?`,
        [data.payed, data.order_date, data.order_id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

app.delete("/api/order/:id", (req, res, next) => {
    console.log("Delete order")
    db.run(
        'DELETE FROM orders WHERE order_id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            db.run(
                'DELETE FROM order_details WHERE order_id = ?',
                req.params.id,
                function (err, result) {
                    if (err){
                        res.status(400).json({"error": res.message})
                        return;
                    }
                    res.json({"message":"deleted", changes: this.changes})
            });

    });
})



// Default response for any other request
app.use(function(req, res){
    res.status(404);
});