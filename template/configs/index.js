//@flow

module.exports = {
  dev: {
    debug: true,
    sequelize: {
      database: "",
      username: "",
      password: "",
      options: {
        dialect: "sqlite",
        storage: ":memory:",
        logging: console.log
      }
    }
  },
  prod: {
    debug: false,
    sequelize: {
      database: "",
      username: "",
      password: "",
      options: {
        dialect: "sqlite",
        storage: ":memory:",
        logging: false
      }
    }
  }
}
