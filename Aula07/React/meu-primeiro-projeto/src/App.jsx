import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
return (
<div>
<h1>Olá, React!</h1>
<p>Estou alterando meu primeiro componente.</p>
<Saudacao />
<Perfil nome="Gabriel" cargo="Brabo"/>
<Painel />
<Produto nome="Notebook" preco={5320.00} categoria="Eletrônicos" />
<Dashboard />

</div>
)
}
export default App

function Saudacao(){
  return (
    <div style={{backgroundColor: 'black', padding: '8px', marginBottom: '10px'}}>
      <h2 style={{color: 'blue'}}> Olá, Aluno</h2>
      <p>Este Componente foi criado separadamente</p>
    </div>
  )
}

// Crie 2 componente, chamados Perfil e Painel respectivamente e adicione alguma frase e estilização á sua escolha. Obs: Não se esqueça de chama-los no componente principal (App)

function Perfil({nome, cargo}) {
  return (
    <div style={{
      border: '2px solid green',
      borderRadius: '12px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: 'White',
      boxShadow: '2px 2px 5px Black'
    }}>
      <h3 style={{margin: '0 0 5px 0', color: 'green'}}>
        Nome: {nome}
      </h3>
      <p style={{ margin: 0, color: 'grey'}}>
        Cargo: <strong>{cargo}</strong>
        </p>
    </div>
  );
}

function Painel() {
  return (
    <div style={{backgroundColor: 'gray', padding: '8px', marginBottom: '10px'}}>
      <h2 style={{color: 'red'}}>Painel</h2>
      <p>Este é o Painel</p>
    </div>
  )
}

// Crie 1 novo componemte que receba ao menos 3 propriedades e as utilize para alguma exibição. Obs: não esqueça de passar essas propriedades quando chamar esse componente no App

function Produto({ nome, preco, categoria }) {
  return (
    <div style={{
      border: '2px solid orange',
      borderRadius: '12px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: '#fff8f0',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 5px 0', color: 'orange' }}>{nome}</h3>
      <p style={{ margin: '4px 0', color: 'gray' }}>Categoria: <strong>{categoria}</strong></p>
      <p style={{ margin: '4px 0', color: 'green', fontSize: '1.2rem' }}>
        R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function Dashboard() {
  const [texto, setTexto] = useState('Bem-vindo ao Dashboard!');

  return (
    <div style={{ backgroundColor: '#79ff51', padding: '20px', border: '2px solid #ccc', marginTop: '20px', borderRadius: '8px' }}>
      <h4>Escreva uma mensagem: </h4>
      <input
        type="text"
        placeholder="Digite algo..."
        onChange={(e) => setTexto(e.target.value)}
        style={{ padding: '8px', width: '100%'}}
      />
      <p style={{ marginTop: '15px', color: '#333' }}><strong>{texto}</strong></p>
    </div>
  );
}
