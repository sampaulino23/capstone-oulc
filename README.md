# OULC Contract Management System
A contract management system for De La Salle University - Office of the University Legal Counsel.

### Local setup and executing the program
1. Navigate to the directory
2. Install the dependencies by using the command: `npm install`
3. Run the server by using the command: `npm start`
    * Navigate to `http://localhost:3000/` in the browser to view the app.
4. To stop the server from running, use Ctrl+C (Windows) or Command+C (Mac)

### Database setup

#### Prerequisites
[Mongodb Database Tools](https://www.mongodb.com/try/download/database-tools)
   * Refer to the installation guide through this [link](https://www.mongodb.com/docs/database-tools/installation/installation/)

#### Importing the data
`mongorestore --uri "mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority" ./databackup/test

### Dependencies
* ajax
* assert
* axios
* bcrypt
* body-parser
* crypto
* express
* express-handlebars
* fs
* form-data
* handlebars
* moment
* mongodb
* mongoose
* nodemailer
* path
* socket.io

### Project Members
* Brosoto, Mig
* Murillo, Martin
* Paulino, Samantha
* Zhuang, Ze Long
