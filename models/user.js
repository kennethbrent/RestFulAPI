const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        firstName:{
            type: Sequelize.STRING,
            validate:{
                notEmpty: {
                    msg: "First Name is required"
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: 'Last name is required'
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            unique: {
                msg: 'This email address is already associated with an account'
            },
            validate: {
                notEmpty: {
                    msg: 'Emaill Address is required'
                },
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notContains: ' ',
                notEmpty: {
                    msg: 'Password is required'
                }
            }
        }
    }, {sequelize});

    User.associate = (models) => {
        User.hasMany(models.Course);
      };

    return User;
}