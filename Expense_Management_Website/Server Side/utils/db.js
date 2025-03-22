import mysql from 'mysql'

const con = mysql.createConnection({
    host: "localhost",
    port:5713,
    user: "root",
    password: "",
    database: "expense"
})

con.connect(function(err) {
    if(err) {
        console.log("connection error")
    } else {
        console.log("Connected")
    }
})

export default con;

