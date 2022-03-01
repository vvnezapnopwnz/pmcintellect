const fs = require('fs')

const data = fs.readFileSync('./aa', 'utf-8')

const massiv = data.split('\n').map((result) => {


    const newstr = result.replace('\t', '\t"').replace(')', '")')
    return newstr


})

console.log(massiv)

fs.writeFileSync('.newaa', massiv.join(''))