const router = require('express').Router();
const User = require('../../models/User.js');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const session = require('express-session');

//GET methods for login
router.get('/login', (req, res) => {
    if (!req.session.login) {
        const loginPage = fs.readFileSync("./public/login/login.html", "utf8");
        return res.send(loginPage);
    } else {
        return res.redirect("/home");
    }
});

router.get('/', (req, res) => {
    if (req.session.login) {
        return res.redirect("/home");
    } else {
        return res.redirect("/login");
    }
});

router.get('/home', (req, res) => {
    if (req.session.login) {
        const navbar = fs.readFileSync("./public/navbar/navbar.html", "utf8");
        const homePage = fs.readFileSync("./public/home/home.html", "utf8");
        return res.send(navbar + homePage);
    } else {
        return res.redirect('/login');
    }
});

router.post('/home', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (username && password) {
            const passwordValidation = await User.query().select('id', 'username', 'email', 'password').where('username', username);

            if (passwordValidation.length !== 1) {
                return res.redirect('login');
            }

            if (passwordValidation.length === 1) {
                bcrypt.compare(password, passwordValidation[0].password).then(compare => {
                    if(compare === true) {
                        req.session.userId = passwordValidation[0].id;
                        req.session.login = true;
                        req.session.username = username;
                        req.session.email = passwordValidation[0].email;
                        return res.redirect('/home');
                        
                    } else {
                        return res.redirect('/login');
                    }
                });
            }
        }
    } catch (error) {
    }
});

//POST method for logout
router.post('/logout', (req, res) => {
    //Again using the middleware express-session.
    //This will make sure that when the user logout, they have to login again before accessing the unauthorized pages.
    req.session.login = undefined;
    req.session.username = undefined;
    req.session.email = undefined;
    return res.redirect("/login");
});


module.exports = router;