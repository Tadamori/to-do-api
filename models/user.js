module.exports = function (sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //может быть только один пользователь с таким мэйлом
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len:[5, 100]
			}
		}
	})
};