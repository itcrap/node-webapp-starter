module.exports = {
  "env": {
  	"browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": [ "prettier", "eslint:recommended"],
  "plugins": [ "prettier"],
  "parser": "@babel/eslint-parser",
  "rules": {
    "max-len": [2, {"code": 140, "tabWidth": 2, "ignoreUrls": true}],
    "no-console": "off",
    "no-underscore-dangle": "off",
    "prettier/prettier": "error"
  },
  "settings": {
    "import/resolver": {
      "node": {
        "paths": ["src"],
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  }
}