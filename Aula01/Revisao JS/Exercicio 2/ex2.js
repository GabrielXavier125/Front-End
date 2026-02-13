let salario = parseInt(prompt("Digite o Salário: "))
let aluguel = parseFloat(prompt("Digite o preço do Aluguel: "))
let lazer = parseFloat(prompt("Digite o preço Lazer: "))
let alimentacao = parseFloat(prompt("Digite o preço Alimentação: "))

let total_desp = aluguel + lazer + alimentacao
let saldo_res = salario - total_desp
 
if( saldo_res > 0){
    console.log('Saldo Positivo: ' + saldo_res)
    console.log("Total Despesas: "+ total_desp)
    console.log("Salário: "+ salario)
} else if ( saldo_res === 0) {
    console.log('Saldo no Limite: '+ saldo_res)
    console.log("Total Despesas: "+ total_desp)
    console.log("Salário: "+ salario)
} else {
    console.log('Saldo Negativo: '+ saldo_res)
    console.log("Total Despesas: " + total_desp)
    console.log("Salário: "+ salario)
}