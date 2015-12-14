var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


module.exports = function (sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //может быть только один пользователь с таким мэйлом
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: 	DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len:[5, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function (user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			isValid: function (body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then (function (user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						resolve(user);
					}, function (e) {
						return reject();
					})
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt'); //эта функция сделана для того чтобы в не возвращать в респонсе данные о пороле пользователей, дабы избежать хаков.
			},
			generateToken: function (type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({id: this.get('id'), type: type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty123');

					return token;
				} catch (e) {
					console.error(e);
					return undefined;
				}
			}
		}
	});
	return user;
};