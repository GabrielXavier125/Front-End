# TaskFlow — Gestão de Prioridades

Aplicação React de gerenciamento de tarefas com níveis de prioridade, filtragem por status, busca em tempo real, edição inline e persistência de dados via LocalStorage.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Como Executar](#como-executar)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Conceitos Fundamentais do React](#conceitos-fundamentais-do-react)
6. [Funcionalidades e Como Funcionam](#funcionalidades-e-como-funcionam)
   - [Criar Tarefa](#1-criar-tarefa)
   - [Ordenação Automática por Prioridade](#2-ordenação-automática-por-prioridade)
   - [Busca em Tempo Real](#3-busca-em-tempo-real)
   - [Filtro por Status](#4-filtro-por-status)
   - [Concluir e Reabrir Tarefas](#5-concluir-e-reabrir-tarefas)
   - [Edição Inline de Tarefas](#6-edição-inline-de-tarefas)
   - [Confirmação antes de Excluir](#7-confirmação-antes-de-excluir)
   - [Persistência com LocalStorage](#8-persistência-com-localstorage)
7. [Estilização Condicional](#estilização-condicional)
8. [Código Completo Comentado — App.jsx](#código-completo-comentado--appjsx)
9. [Código Completo Comentado — App.css](#código-completo-comentado--appcss)

---

## Visão Geral

O TaskFlow é uma Single Page Application (SPA) construída com React que permite ao usuário:

- Criar tarefas com descrição e nível de prioridade (Alta, Média, Baixa)
- Visualizar as tarefas ordenadas automaticamente pela prioridade
- Buscar tarefas pelo texto em tempo real
- Filtrar tarefas por status (Todas, Pendentes, Concluídas)
- Editar o texto de qualquer tarefa diretamente no card
- Concluir ou reabrir tarefas com um clique
- Remover tarefas com uma confirmação de segurança
- Ter todos os dados salvos automaticamente no navegador (LocalStorage)

---

## Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| React 18 | Biblioteca de interface (UI) |
| Vite | Ferramenta de build e servidor de desenvolvimento |
| JavaScript (ES6+) | Linguagem de programação |
| CSS3 | Estilização da interface |
| LocalStorage (Web API) | Persistência de dados no navegador |

---

## Como Executar

**Pré-requisito:** ter o Node.js instalado na máquina.

```bash
# 1. Entrar na pasta do projeto
cd taskflow

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Após o passo 3, a aplicação estará disponível em: `http://localhost:5173`

---

## Estrutura de Arquivos

```
taskflow/
├── src/
│   ├── App.jsx       ← Componente principal (toda a lógica e interface)
│   ├── App.css       ← Estilização da aplicação
│   └── main.jsx      ← Ponto de entrada (renderiza o App no HTML)
├── index.html        ← Página HTML base
├── package.json      ← Dependências e scripts do projeto
└── vite.config.js    ← Configuração do Vite
```

---

## Conceitos Fundamentais do React

Antes de entrar nas funcionalidades, é importante entender os três pilares que sustentam esta aplicação.

### useState — Gerenciamento de Estado

O `useState` é um Hook do React que cria uma **variável reativa**. Diferente de variáveis JavaScript comuns, quando um estado muda, o React **re-renderiza o componente automaticamente**, atualizando a tela.

```js
const [valor, setValor] = useState(valorInicial);
//      ↑         ↑              ↑
//   leitura   atualização   valor de início
```

**Regra importante:** nunca modifique o estado diretamente (`lista.push(item)`). Sempre use a função setter (`setLista([...lista, item])`). O React precisa detectar a mudança para saber que deve re-renderizar.

---

### useEffect — Efeitos Colaterais

O `useEffect` executa um bloco de código em resposta a eventos do ciclo de vida do componente ou à mudança de estados específicos.

```js
// Executa UMA VEZ ao montar o componente (array vazio = sem dependências)
useEffect(() => { ... }, []);

// Executa toda vez que "taskList" mudar
useEffect(() => { ... }, [taskList]);
```

É usado para operações que ficam "fora" da renderização pura: chamadas de API, timers, acesso ao LocalStorage etc.

---

### Imutabilidade — Por que nunca mutamos arrays diretamente

O React compara o estado anterior com o novo para decidir se precisa re-renderizar. Se você mutar o mesmo array/objeto, o React não detecta a mudança (a referência em memória é a mesma).

Por isso, sempre criamos **cópias** com métodos que retornam novos arrays:

| Operação | Método correto | O que NÃO usar |
|---|---|---|
| Adicionar item | `[novoItem, ...lista]` | `lista.push()` |
| Atualizar item | `lista.map(...)` | `lista[i].campo = valor` |
| Remover item | `lista.filter(...)` | `lista.splice()` |

---

## Funcionalidades e Como Funcionam

### 1. Criar Tarefa

O formulário usa um **componente controlado**: o valor do `<input>` e do `<select>` são sempre espelhos dos estados do React (`taskText` e `priority`). Cada tecla digitada dispara `onChange`, que atualiza o estado, que re-renderiza o input com o novo valor.

```jsx
<input
  value={taskText}                              // lê do estado
  onChange={(e) => setTaskText(e.target.value)} // atualiza o estado
/>
```

Ao enviar o formulário (`onSubmit`), a função `addTask` é chamada:

```js
const addTask = (e) => {
  e.preventDefault(); // impede o comportamento padrão (recarregar a página)
  if (!taskText.trim()) return; // ignora campos vazios ou só com espaços

  const newTask = {
    id: crypto.randomUUID(), // ID único e universal para cada tarefa
    text: taskText.trim(),
    priority,                // shorthand: equivale a priority: priority
    completed: false,
    createdAt: new Date().toLocaleDateString('pt-BR'), // ex: 17/04/2026
  };

  // Cria novo array, reordena e atualiza o estado
  const updated = [newTask, ...taskList];
  updated.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  setTaskList(updated);
  setTaskText(''); // limpa o campo após criar
};
```

---

### 2. Ordenação Automática por Prioridade

Toda vez que uma tarefa é adicionada, a lista inteira é reordenada para manter as tarefas de **Alta prioridade no topo**.

A lógica usa um objeto constante fora do componente (para não ser recriado a cada renderização) que atribui pesos numéricos:

```js
const PRIORITY_ORDER = { Alta: 0, Média: 1, Baixa: 2 };
```

O método `.sort()` compara dois elementos por vez. A função `(a, b) => A - B` ordena do menor para o maior:

```js
updated.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

// Exemplo prático:
// Alta(0) vs Baixa(2) → 0 - 2 = -2 (negativo: "a" vem antes de "b") ✔
// Baixa(2) vs Alta(0) → 2 - 0 = +2 (positivo: "b" vem antes de "a") ✔
```

---

### 3. Busca em Tempo Real

Um estado `search` armazena o texto da barra de busca. A variável `filteredTasks` é calculada a cada renderização, combinando todos os filtros ativos:

```js
const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
```

`.toLowerCase()` nos dois lados torna a busca **case-insensitive**: buscar `"react"` também encontra `"React"` e `"REACT"`.

Como `filteredTasks` depende de `search` (que é um estado), toda vez que o usuário digita uma letra, o React re-renderiza o componente e recalcula a lista filtrada — sem nenhum botão de "buscar" necessário.

---

### 4. Filtro por Status

O estado `filter` pode ter três valores: `'Todas'`, `'Pendentes'` ou `'Concluídas'`. Os botões de filtro usam **className condicional** para mostrar qual está ativo:

```jsx
<button className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
```

A lógica de filtragem usa **operador ternário encadeado**:

```js
const matchesFilter =
  filter === 'Pendentes'    ? !t.completed  // tarefas não concluídas
  : filter === 'Concluídas' ? t.completed   // tarefas concluídas
  : true;                                   // 'Todas': aceita qualquer uma
```

---

### 5. Concluir e Reabrir Tarefas

A função `toggleTask` recebe o `id` da tarefa e usa `.map()` para percorrer a lista. Quando encontra a tarefa com o id correto, cria uma cópia do objeto com o campo `completed` invertido:

```js
const toggleTask = (id) => {
  setTaskList((prev) =>
    prev.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed } // cópia com completed invertido
        : t                                  // demais tarefas sem alteração
    )
  );
};
```

O spread `{ ...t }` cria um **novo objeto** com todas as propriedades de `t`. Em seguida, `completed: !t.completed` sobrescreve apenas esse campo — os demais (id, text, priority, createdAt) permanecem intactos.

No JSX, o texto do botão muda dinamicamente conforme o status:

```jsx
<button onClick={() => toggleTask(item.id)}>
  {item.completed ? 'Reabrir' : 'Concluir'}
</button>
```

---

### 6. Edição Inline de Tarefas

A edição usa dois estados para controlar qual tarefa (se alguma) está sendo editada:

```js
const [editingId, setEditingId]     = useState(null); // id da tarefa em edição
const [editingText, setEditingText] = useState('');   // texto temporário
```

**Fluxo completo:**

1. Usuário clica em **"Editar"** → `startEdit(task)` é chamada
2. `editingId` recebe o `id` da tarefa; `editingText` recebe o texto atual
3. No JSX, o card com `item.id === editingId` renderiza um `<input>` em vez do `<h3>`
4. O usuário digita o novo texto (armazenado em `editingText`)
5. Ao clicar em **"Salvar"** (ou pressionar `Enter`) → `saveEdit(id)` é chamada
6. `.map()` atualiza só o campo `text` da tarefa correta
7. `editingId` volta a `null`, encerrando o modo de edição

```js
const saveEdit = (id) => {
  if (!editingText.trim()) return; // não salva se o campo estiver vazio

  setTaskList((prev) =>
    prev.map((t) =>
      t.id === id
        ? { ...t, text: editingText.trim() } // atualiza só o texto
        : t
    )
  );

  setEditingId(null);  // sai do modo de edição
  setEditingText('');
};
```

O campo de edição também responde ao teclado:

```jsx
onKeyDown={(e) => {
  if (e.key === 'Enter')  saveEdit(item.id); // salva com Enter
  if (e.key === 'Escape') cancelEdit();       // cancela com Escape
}}
```

E o `autoFocus` posiciona o cursor automaticamente no campo ao entrar no modo de edição.

---

### 7. Confirmação antes de Excluir

Antes de remover definitivamente uma tarefa, `window.confirm` exibe um diálogo nativo do navegador:

```js
const deleteTask = (id) => {
  const task = taskList.find((t) => t.id === id); // busca a tarefa pelo id

  const confirmed = window.confirm(
    `Tem certeza que deseja remover a tarefa:\n"${task.text}"?`
  );

  if (!confirmed) return; // usuário clicou em "Cancelar" → não faz nada

  setTaskList((prev) => prev.filter((t) => t.id !== id));
};
```

`.find()` retorna o **primeiro objeto** do array que satisfaz a condição — usado aqui para buscar o texto da tarefa e exibi-lo na mensagem de confirmação.

`.filter()` retorna um **novo array** contendo apenas os elementos onde a condição é `true`. Como a condição é `t.id !== id`, a tarefa com o id informado fica de fora — ou seja, é removida.

---

### 8. Persistência com LocalStorage

O LocalStorage é um banco de dados chave-valor embutido no navegador. Os dados persistem mesmo após fechar a aba ou o navegador.

**Limitação importante:** o LocalStorage só armazena **strings**. Por isso usamos:
- `JSON.stringify()` para converter array JS → string antes de salvar
- `JSON.parse()` para converter string → array JS ao carregar

```js
// CARREGAR (executa uma vez ao abrir a página)
useEffect(() => {
  const saved = localStorage.getItem('@taskflow_data');
  if (saved) setTaskList(JSON.parse(saved)); // string → array JS
}, []);

// SALVAR (executa toda vez que taskList mudar)
useEffect(() => {
  localStorage.setItem('@taskflow_data', JSON.stringify(taskList)); // array JS → string
}, [taskList]);
```

---

## Estilização Condicional

O React permite aplicar classes CSS dinamicamente com base nas propriedades do objeto. Isso conecta diretamente a lógica JavaScript com a aparência visual:

```jsx
<div className={`task-card ${item.priority.toLowerCase()} ${item.completed ? 'done' : ''}`}>
```

Para uma tarefa de prioridade Alta não concluída, o resultado é:
```
class="task-card alta"
```

Para uma tarefa de prioridade Baixa concluída:
```
class="task-card baixa done"
```

No CSS, cada classe aplica um estilo diferente:

```css
:root {
  --low:    #28a745; /* Verde   */
  --medium: #ffc107; /* Amarelo */
  --high:   #dc3545; /* Vermelho */
}

.task-card.baixa { border-color: var(--low);    }
.task-card.média { border-color: var(--medium); }
.task-card.alta  { border-color: var(--high);   }

.task-card.done {
  opacity: 0.6;        /* Semi-transparente */
  background: #e9ecef; /* Fundo acinzentado */
}

.task-card.done h3 {
  text-decoration: line-through; /* Texto riscado */
}
```

---

## Código Completo Comentado — App.jsx

```jsx
// Importações necessárias do React
// - useState: hook para criar e gerenciar estados (variáveis reativas)
// - useEffect: hook para executar efeitos colaterais (ex: salvar no localStorage)
import React, { useState, useEffect } from 'react';
import './App.css';

// Objeto que mapeia cada prioridade a um peso numérico para ordenação.
// Alta(0) → Média(1) → Baixa(2): quanto menor, mais acima na lista.
// Fica fora do componente para não ser recriado a cada renderização.
const PRIORITY_ORDER = { Alta: 0, Média: 1, Baixa: 2 };

function App() {

  // ── ESTADOS ──
  const [taskText, setTaskText]       = useState('');      // texto do campo de criação
  const [priority, setPriority]       = useState('Baixa'); // prioridade selecionada
  const [taskList, setTaskList]       = useState([]);      // lista completa de tarefas
  const [filter, setFilter]           = useState('Todas'); // filtro de status ativo
  const [search, setSearch]           = useState('');      // texto da barra de busca
  const [editingId, setEditingId]     = useState(null);    // id da tarefa em edição (null = nenhuma)
  const [editingText, setEditingText] = useState('');      // texto temporário da edição

  // ── EFEITO 1: Carrega dados do LocalStorage ao montar o componente ──
  // [] = executa UMA VEZ ao abrir a página
  useEffect(() => {
    const saved = localStorage.getItem('@taskflow_data');
    if (saved) setTaskList(JSON.parse(saved)); // string → array JS
  }, []);

  // ── EFEITO 2: Salva dados no LocalStorage sempre que taskList mudar ──
  // [taskList] = executa toda vez que a lista for atualizada
  useEffect(() => {
    localStorage.setItem('@taskflow_data', JSON.stringify(taskList)); // array JS → string
  }, [taskList]);

  // ── FUNÇÃO: Adicionar nova tarefa ──
  const addTask = (e) => {
    e.preventDefault();           // impede o recarregamento da página
    if (!taskText.trim()) return; // ignora campos vazios

    const newTask = {
      id: crypto.randomUUID(),    // ID único universal
      text: taskText.trim(),
      priority,
      completed: false,
      createdAt: new Date().toLocaleDateString('pt-BR'), // DD/MM/AAAA
    };

    const updated = [newTask, ...taskList]; // insere no início do array
    // Ordena: Alta(0) → Média(1) → Baixa(2)
    updated.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    setTaskList(updated);
    setTaskText(''); // limpa o campo
  };

  // ── FUNÇÃO: Alternar status concluída/pendente ──
  const toggleTask = (id) => {
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed } // cópia com completed invertido
          : t
      )
    );
  };

  // ── FUNÇÃO: Remover tarefa com confirmação ──
  const deleteTask = (id) => {
    const task = taskList.find((t) => t.id === id); // busca a tarefa para exibir o nome
    const confirmed = window.confirm(
      `Tem certeza que deseja remover a tarefa:\n"${task.text}"?`
    );
    if (!confirmed) return; // usuário cancelou
    setTaskList((prev) => prev.filter((t) => t.id !== id)); // remove da lista
  };

  // ── FUNÇÃO: Iniciar modo de edição ──
  const startEdit = (task) => {
    setEditingId(task.id);     // marca qual tarefa está sendo editada
    setEditingText(task.text); // pré-preenche com o texto atual
  };

  // ── FUNÇÃO: Salvar edição ──
  const saveEdit = (id) => {
    if (!editingText.trim()) return; // não salva vazio
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, text: editingText.trim() } // atualiza só o texto
          : t
      )
    );
    setEditingId(null);  // sai do modo edição
    setEditingText('');
  };

  // ── FUNÇÃO: Cancelar edição ──
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText(''); // descarta texto temporário
  };

  // ── DERIVAÇÃO: Lista filtrada ──
  // Não é estado — é calculada em tempo de renderização.
  // Combina filtro de status E busca por texto com o operador &&.
  const filteredTasks = taskList.filter((t) => {
    const matchesFilter =
      filter === 'Pendentes'    ? !t.completed
      : filter === 'Concluídas' ? t.completed
      : true;

    // case-insensitive: toLowerCase() nos dois lados
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // ── RENDERIZAÇÃO (JSX) ──
  return (
    <div className="app-container">
      <header>
        <h1>TaskFlow</h1>
        <p>Gestão de Produtividade</p>
      </header>

      {/* Formulário de criação — onSubmit chama addTask */}
      <section className="form-section">
        <form onSubmit={addTask}>
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Descrição da tarefa..."
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
          <button type="submit">Criar</button>
        </form>
      </section>

      {/* Busca em tempo real — atualiza "search" a cada tecla digitada */}
      <section className="search-section">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarefa pelo texto..."
        />
      </section>

      {/* Filtros de status — .map() gera os botões dinamicamente */}
      <section className="filter-section">
        {['Todas', 'Pendentes', 'Concluídas'].map((f) => (
          <button
            key={f}                                   // key obrigatório em listas
            className={filter === f ? 'active' : ''}  // classe condicional
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Grade de cards */}
      <main className="task-grid">

        {/* Mensagem quando a lista está vazia — renderização condicional com && */}
        {filteredTasks.length === 0 && (
          <p className="empty-msg">Nenhuma tarefa encontrada.</p>
        )}

        {filteredTasks.map((item) => (
          <div
            key={item.id}
            // className dinâmico: "task-card alta done" (exemplo)
            className={`task-card ${item.priority.toLowerCase()} ${item.completed ? 'done' : ''}`}
          >
            <div className="task-content">
              {/* Operador ternário: modo edição OU modo exibição */}
              {editingId === item.id ? (
                // MODO EDIÇÃO
                <div className="edit-group">
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  saveEdit(item.id); // salva com Enter
                      if (e.key === 'Escape') cancelEdit();      // cancela com Escape
                    }}
                    autoFocus // foca automaticamente ao entrar no modo edição
                  />
                  <div className="edit-actions">
                    <button className="save" onClick={() => saveEdit(item.id)}>Salvar</button>
                    <button className="cancel" onClick={cancelEdit}>Cancelar</button>
                  </div>
                </div>
              ) : (
                // MODO EXIBIÇÃO — fragmento <> não cria div extra no HTML
                <>
                  <h3>{item.text}</h3>
                  <span>Prioridade: {item.priority}</span>
                  <small>Criada em: {item.createdAt}</small>
                </>
              )}
            </div>

            {/* Botões ocultos durante a edição para evitar ações conflitantes */}
            {editingId !== item.id && (
              <div className="task-actions">
                <button onClick={() => toggleTask(item.id)}>
                  {item.completed ? 'Reabrir' : 'Concluir'}
                </button>
                {/* Passa o objeto inteiro para pré-preencher o campo de edição */}
                <button className="edit" onClick={() => startEdit(item)}>Editar</button>
                <button className="delete" onClick={() => deleteTask(item.id)}>Remover</button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
```

---

## Código Completo Comentado — App.css

```css
/* Variáveis CSS globais — definidas no :root (elemento raiz = <html>).
   Uso: var(--nome). Vantagem: muda a cor em um único lugar. */
:root {
  --low:    #28a745; /* Verde    → prioridade Baixa  */
  --medium: #ffc107; /* Amarelo  → prioridade Média  */
  --high:   #dc3545; /* Vermelho → prioridade Alta   */
}

/* Aplica a TODOS os elementos.
   box-sizing: border-box inclui padding e border na largura total do elemento,
   evitando que elementos "transbordem" do layout. */
* { box-sizing: border-box; }

body {
  margin: 0;
  background: #f0f2f5;               /* Fundo cinza claro */
  font-family: system-ui, sans-serif; /* Fonte nativa do sistema operacional */
}

/* Limita largura e centraliza o conteúdo.
   margin: auto nas laterais centraliza horizontalmente. */
.app-container {
  max-width: 860px;
  margin: 2rem auto;
  padding: 0 1rem; /* espaço lateral em telas pequenas */
}

/* ── FORMULÁRIO ──
   display: flex alinha os filhos em linha.
   flex-wrap: wrap quebra para próxima linha em telas pequenas. */
.form-section form {
  display: flex;
  gap: 10px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08); /* sombra: deslocX deslocY desfoque cor */
  flex-wrap: wrap;
}

/* flex: 3 = ocupa 3 partes; select tem flex: 1 = ocupa 1 parte.
   Proporção 3:1 → input ocupa 75% e select 25% do espaço livre. */
.form-section input {
  flex: 3; min-width: 160px;
  padding: 10px 12px; border: 1px solid #ced4da;
  border-radius: 6px; font-size: 0.95rem;
}

.form-section select {
  flex: 1; min-width: 100px;
  padding: 10px 8px; border: 1px solid #ced4da;
  border-radius: 6px; font-size: 0.95rem;
}

/* Seletor de atributo [type='submit'] evita afetar outros botões do formulário */
.form-section button[type='submit'] {
  padding: 10px 20px; background: #333; color: #fff;
  border: none; border-radius: 6px; cursor: pointer;
  transition: background 0.2s; /* animação suave de 0.2 segundos no hover */
}
.form-section button[type='submit']:hover { background: #555; }

/* ── BUSCA ── */
.search-input {
  width: 100%; padding: 10px 14px;
  border: 1px solid #ced4da; border-radius: 6px; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.search-input:focus {
  outline: none;      /* remove o outline padrão do navegador */
  border-color: #333; /* substitui por borda personalizada */
}

/* ── FILTROS ──
   border-radius: 20px cria o visual de "pílula" (botão oval). */
.filter-section { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
.filter-section button {
  padding: 7px 18px; border: 1px solid #ccc;
  border-radius: 20px; background: #fff; cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
/* Classe "active" é aplicada pelo React ao botão do filtro selecionado */
.filter-section button.active { background: #333; color: #fff; border-color: #333; }

/* ── GRADE CSS ──
   auto-fill: cria o máximo de colunas que couber na linha.
   minmax(250px, 1fr): cada coluna tem no mínimo 250px e no máximo 1 fração.
   Resultado responsivo: 3 colunas em telas grandes, 2 médias, 1 pequena. */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

/* grid-column: 1 / -1 faz o elemento ocupar TODAS as colunas da grade */
.empty-msg { grid-column: 1 / -1; text-align: center; color: #999; margin: 2rem 0; }

/* ── CARD ──
   flex-direction: column empilha conteúdo e ações verticalmente.
   justify-content: space-between empurra os botões para o rodapé do card. */
.task-card {
  padding: 15px; border-radius: 8px;
  border-left: 8px solid #ccc; /* cor sobrescrita pelas classes de prioridade abaixo */
  background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; justify-content: space-between;
  transition: opacity 0.2s;
}

/* ESTILIZAÇÃO CONDICIONAL — aplicada pelo React via className dinâmico
   ex: className="task-card alta" → borda vermelha */
.task-card.baixa { border-color: var(--low);    } /* Verde   */
.task-card.média { border-color: var(--medium); } /* Amarelo */
.task-card.alta  { border-color: var(--high);   } /* Vermelho */

/* Classe "done" é adicionada quando item.completed === true */
.task-card.done    { opacity: 0.6; background: #e9ecef; }
.task-card.done h3 { text-decoration: line-through; color: #888; }

/* ── BOTÕES DE AÇÃO ──
   flex: 1 em cada botão → todos com largura igual, dividindo o espaço disponível. */
.task-actions { margin-top: 14px; display: flex; gap: 6px; flex-wrap: wrap; }
.task-actions button {
  flex: 1; padding: 6px 10px; border: none; border-radius: 5px;
  cursor: pointer; background: #6c757d; /* Cinza — Concluir/Reabrir */
  color: #fff; transition: background 0.2s;
}
.task-actions button.edit   { background: #0d6efd; } /* Azul    — Editar  */
.task-actions button.delete { background: #dc3545; } /* Vermelho — Remover */

/* ── EDIÇÃO INLINE ──
   Substitui visualmente o conteúdo do card durante a edição. */
.edit-group { display: flex; flex-direction: column; gap: 8px; }
.edit-input {
  width: 100%; padding: 8px 10px;
  border: 1px solid #adb5bd; border-radius: 5px; font-size: 0.95rem;
}
.edit-input:focus { outline: none; border-color: #0d6efd; }
.edit-actions { display: flex; gap: 6px; }
.edit-actions button.save {
  flex: 1; padding: 6px; background: #198754; /* Verde */
  color: #fff; border: none; border-radius: 5px; cursor: pointer;
}
.edit-actions button.cancel {
  flex: 1; padding: 6px; background: #6c757d; /* Cinza */
  color: #fff; border: none; border-radius: 5px; cursor: pointer;
}
```

---

*Projeto desenvolvido para a disciplina de Front-End — Turma 3DEVT*
