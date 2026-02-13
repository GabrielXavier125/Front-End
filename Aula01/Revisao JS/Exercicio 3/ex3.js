let nome = " joao silva "
let forma = nome.trim().toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());

console.log(forma)