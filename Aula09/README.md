# TaskFlow — Gestão de Prioridades

Atividade Front-End — React | Turma: 3DEVT | SENAI

---

## O que é este projeto?

**TaskFlow** é uma aplicação de gerenciamento de tarefas construída em React.  
O objetivo da aula é aprender na prática os principais recursos do React moderno:
gerenciar estado, sincronizar dados com o navegador e construir uma interface
que reage automaticamente às ações do usuário — sem recarregar a página.

---

## Como rodar o projeto

```bash
cd taskflow
npm install
npm run dev
```

Abra o navegador em `http://localhost:5173`.

---

## Conceitos ensinados na aula

### 1. `useState` — Gerenciamento de Estado

`useState` é um **hook** do React que cria uma variável reativa.  
"Reativa" significa: toda vez que o valor muda, o React atualiza a tela automaticamente.

```jsx
const [taskText, setTaskText] = useState('');
//     ^ valor atual   ^ função para atualizar   ^ valor inicial
```

Neste projeto, cada tarefa é um **objeto complexo** guardado dentro de um array de estado:

```js
{
  id: "uuid-único",
  text: "Estudar React",
  priority: "Alta",
  completed: false,
  createdAt: "24/04/2026"
}
```

> Regra do React: nunca modifique o estado diretamente (`array.push()` não funciona).
> Sempre crie um **novo array** com `.map()`, `.filter()` ou spread `[...array]`.

---

### 2. `useEffect` — Sincronização com LocalStorage

`useEffect` executa código como **efeito colateral** após a renderização.  
É usado para coisas que não são renderização pura: buscar dados, salvar no banco, etc.

O projeto usa dois `useEffect`:

```jsx
// Executa UMA VEZ ao abrir o app — carrega os dados salvos
useEffect(() => {
  const saved = localStorage.getItem('@taskflow_data');
  if (saved) setTaskList(JSON.parse(saved));
}, []); // [] vazio = roda só na montagem

// Executa TODA VEZ que taskList muda — salva os dados
useEffect(() => {
  localStorage.setItem('@taskflow_data', JSON.stringify(taskList));
}, [taskList]); // [taskList] = roda quando taskList muda
```

**LocalStorage** é um banco de dados simples do navegador.  
Ele só aceita texto, por isso usamos:
- `JSON.stringify()` para converter o array em texto ao salvar
- `JSON.parse()` para converter o texto de volta em array ao carregar

---

### 3. Lógica de Filtro — Visualizações Parciais

O filtro **não apaga** as tarefas da lista original — ele apenas decide **quais mostrar**.  
A lista original (`taskList`) fica intacta. O que muda é a variável derivada `filteredTasks`:

```js
const filteredTasks = taskList.filter((t) => {
  const matchesFilter =
    filter === 'Pendentes'  ? !t.completed :
    filter === 'Concluídas' ?  t.completed :
    true; // 'Todas'

  const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());

  return matchesFilter && matchesSearch; // passa pelos dois filtros
});
```

> `filteredTasks` não é um estado (`useState`). É uma variável calculada durante a
> renderização. Isso significa que sempre está atualizada, sem precisar de `setX()`.

---

### 4. Estilização Condicional

A cor da borda de cada card muda conforme a prioridade da tarefa.  
No JSX, as classes CSS são aplicadas dinamicamente:

```jsx
<div className={`task-card ${item.priority.toLowerCase()} ${item.completed ? 'done' : ''}`}>
```

Isso gera strings como `"task-card alta"` ou `"task-card baixa done"`.  
No CSS, cada classe tem uma cor diferente:

```css
:root {
  --low:    #28a745; /* Verde   */
  --medium: #ffc107; /* Amarelo */
  --high:   #dc3545; /* Vermelho */
}

.task-card.baixa { border-color: var(--low);    }
.task-card.média { border-color: var(--medium); }
.task-card.alta  { border-color: var(--high);   }
.task-card.done  { opacity: 0.6; background: #e9ecef; }
```

---

## Implementações extras (nível expert)

O PDF pede 4 funcionalidades adicionais para quem quer ir além do código base.
Todas foram implementadas neste projeto.

---

### Extra 1 — Ordenação Automática por Prioridade

**O que faz:** Toda vez que uma tarefa é criada, a lista é reordenada colocando
as tarefas de prioridade **Alta** no topo, seguidas de **Média** e depois **Baixa**.

**Como funciona:**

```js
// Objeto que mapeia prioridade → peso numérico
const PRIORITY_ORDER = { Alta: 0, Média: 1, Baixa: 2 };

// Dentro de addTask():
updated.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
```

O método `.sort()` compara dois elementos por vez. Quando o resultado é negativo,
o primeiro elemento vai antes. Como `Alta = 0` e `Baixa = 2`, a subtração `0 - 2 = -2`
(negativo) coloca Alta antes de Baixa.

---

### Extra 2 — Busca em Tempo Real

**O que faz:** Um campo de texto filtra as tarefas enquanto o usuário digita,
sem precisar clicar em nenhum botão.

**Como funciona:**

```jsx
// Estado que guarda o texto da busca
const [search, setSearch] = useState('');

// Input que atualiza o estado a cada tecla
<input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Buscar tarefa pelo texto..."
/>
```

A busca é **case-insensitive** (não diferencia maiúsculas de minúsculas):

```js
const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
```

Como `search` é um estado, qualquer mudança no valor dispara uma nova renderização,
e `filteredTasks` é recalculado automaticamente com o novo texto de busca.

---

### Extra 3 — Edição de Tarefas (inline)

**O que faz:** Um botão "Editar" transforma o texto do card em um campo de texto
onde o usuário pode digitar a nova descrição, com opções de salvar ou cancelar.

**Como funciona:**

Dois estados controlam qual tarefa está sendo editada e o texto temporário:

```js
const [editingId, setEditingId] = useState(null); // id da tarefa em edição
const [editingText, setEditingText] = useState(''); // texto provisório
```

Dentro do card, o JSX decide o que renderizar com um operador ternário:

```jsx
{editingId === item.id ? (
  // MODO EDIÇÃO: campo de texto + botões Salvar e Cancelar
  <div className="edit-group">
    <input value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus />
    <button onClick={() => saveEdit(item.id)}>Salvar</button>
    <button onClick={cancelEdit}>Cancelar</button>
  </div>
) : (
  // MODO NORMAL: exibe texto, prioridade e data
  <>
    <h3>{item.text}</h3>
    <span>Prioridade: {item.priority}</span>
    <small>Criada em: {item.createdAt}</small>
  </>
)}
```

Para salvar, o `.map()` encontra a tarefa pelo `id` e substitui apenas o campo `text`:

```js
const saveEdit = (id) => {
  setTaskList((prev) =>
    prev.map((t) => t.id === id ? { ...t, text: editingText.trim() } : t)
  );
  setEditingId(null); // sai do modo edição
};
```

O campo de edição também suporta atalhos de teclado:
- `Enter` — salva a edição
- `Escape` — cancela sem salvar

---

### Extra 4 — Confirmação de Exclusão

**O que faz:** Antes de remover uma tarefa definitivamente, uma caixa de diálogo
pergunta ao usuário se ele tem certeza, mostrando o nome da tarefa.

**Como funciona:**

```js
const deleteTask = (id) => {
  const task = taskList.find((t) => t.id === id); // busca o nome para exibir

  const confirmed = window.confirm(
    `Tem certeza que deseja remover a tarefa:\n"${task.text}"?`
  );

  if (!confirmed) return; // cancela se o usuário clicar em "Cancelar"

  setTaskList((prev) => prev.filter((t) => t.id !== id));
};
```

`window.confirm()` é uma função nativa do navegador que exibe um diálogo com
dois botões: **OK** (retorna `true`) e **Cancelar** (retorna `false`).
Se o usuário cancelar, a função para no `return` e a tarefa não é excluída.

---

## Estrutura de arquivos

```
taskflow/
├── src/
│   ├── App.jsx      ← toda a lógica e interface da aplicação
│   ├── App.css      ← estilos da aplicação
│   └── main.jsx     ← ponto de entrada (monta o App no DOM)
├── index.html       ← HTML base da aplicação
└── package.json     ← dependências e scripts do projeto
```

---

## Resumo do fluxo da aplicação

```
Usuário interage → useState atualiza → React re-renderiza a tela

Criar tarefa   → addTask()    → .sort() reordena → setTaskList() → useEffect salva
Buscar texto   → setSearch()  → filteredTasks recalcula          → lista atualiza
Filtrar status → setFilter()  → filteredTasks recalcula          → lista atualiza
Editar tarefa  → startEdit()  → card vira input  → saveEdit()    → .map() atualiza
Excluir tarefa → confirm()    → se OK            → .filter() remove
Fechar e abrir → useEffect carrega do localStorage automaticamente
```

---

## Tecnologias utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Biblioteca de interface |
| Vite | 6 | Bundler e servidor de desenvolvimento |
| LocalStorage | API nativa | Persistência de dados no navegador |
| CSS Grid | CSS nativo | Layout responsivo dos cards |
| CSS Custom Properties | CSS nativo | Variáveis de cor por prioridade |
