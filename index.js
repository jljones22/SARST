const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const { UserCollection, RegistrationReqCollection, RoleCollection } = require('./models/schema')
const DB = require('./mongodb')

const templatePath = path.join(__dirname, './templates')

app.use(express.json())
app.set('view engine', 'hbs')
app.set('views', templatePath)
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', async (req, res) => {
    const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    }

    await RegistrationReqCollection.insertMany([data])

    res.render('login') // Once user signups, redirected to login page (Was home page)
})

app.post('/login', async (req, res) => {
    try {
        const check = await UserCollection.findOne({
            email: req.body.email
        })

        if(check.password === req.body.password) {
            switch(check.role) { // checks user role and redirects to appropriate homepage
                case 'Root':
                    res.render('root/home')
                    break
                case 'Admin':
                    res.render('admin/home')
                    break
                case 'Provider':
                    res.render('provider/home')
                    break
                default:
                    res.send("Cannot redirect: unknown role")
            }
        }
        else {
            res.send("Wrong password")
        }
    }
    catch {
        res.send("Wrong details")
    }

    //res.render('home') ???
})

app.get('/root/registration-req', async (req, res) => {
    let requests = RegistrationReqCollection;

    let result = await requests.find({})
    .then((requestData) => {
        res.render('root/registration-req', { data: requestData })
    })
    .catch((err) => {
        res.send('No registration requests')
    })
})

app.post('/root/registration-req'), async (req, res) => {
    const data = {
        _id: req.body._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    }
    
    await UserCollection.insertMany([data])
    
    res.send("An error has occured")
}

app.listen(3000, () => {
    console.log('port connected')
})