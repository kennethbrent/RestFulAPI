const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        firstName:{
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: "First Name is required"
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Last name is required'
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
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