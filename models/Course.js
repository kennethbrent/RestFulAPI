const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
        userId: {
            type: Sequelize.INTEGER
        },
        title:{
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Title is required'
                }
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Description is required'
                }
            }
        },
        estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true,
            default: null
        },
        materialsNeeded: {
            type: Sequelize.STRING,
            allowNull:true,
            default: null
        }
    }, {sequelize});

    Course.associate = (models) => {
        Course.belongsTo(models.User);
      };

    return Course;
}