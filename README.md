# 🏦 BIX Financial Dashboard

Dashboard financeiro moderno e responsivo construído com **Next.js 14**, **TypeScript** e **styled-components**. Aplicação completa para visualização e gerenciamento de dados financeiros com autenticação persistente e design responsivo.

## 📋 Funcionalidades

- **Autenticação Persistente**: Sistema de login que mantém sessão após refresh (F5)
- **Dashboard Financeiro**: Cards de resumo, gráficos interativos e tabela de transações
- **Filtros Globais**: Por data, conta, indústria e estado
- **Cache Inteligente**: localStorage + cache HTTP com ETag
- **Design Responsivo**: Otimizado para mobile e desktop com menu lateral adaptativo

## 🛠 Tecnologias

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: styled-components
- **Gráficos**: Chart.js com react-chartjs-2
- **Ícones**: lucide-react
- **Testes**: Jest + React Testing Library
- **Autenticação**: Context API com hidratação otimizada

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone 
   cd bix
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   
   ```

## 🎯 Como Usar

### Login
- **Credenciais Demo**:
  - Email: `admin@bix.tech`
  - Senha: `bix2025`
- Use o botão "Preencher com Credenciais Demo" para acesso rápido
- O login persiste mesmo após recarregar a página (F5)

### Navegação
- **Sidebar**: Navegação fixa com opções de home e logout
- **Header**: Filtros globais para personalizar visualizações
- **Mobile**: Menu recolhível para dispositivos móveis

### Filtros de Dados
- **Período**: Filtre transações por intervalo de datas
- **Conta**: Filtre por contas específicas de empresas
- **Indústria**: Filtre por categorias de indústria
- **Estado**: Filtre por abreviações de estados dos EUA

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Executar ESLint
npm test             # Executar testes
```

## 📊 Estrutura de Dados

```typescript
interface Transaction {
  date: number;              // Timestamp em milissegundos
  amount: string;            // Valor monetário como string (centavos)
  transaction_type: 'deposit' | 'withdraw';
  currency: 'usd';           // Dólar Americano
  account: string;           // Nome da empresa
  industry: string;          // Categoria da indústria
  state: string;             // Abreviação do estado dos EUA
}
```

## 🔧 Cache

- **localStorage**: Cache de 5 minutos para dados de transações
- **HTTP Cache**: Suporte a ETag para validação eficiente
- **Limpeza Automática**: Remoção de cache expirado a cada 30 minutos

## 📱 Design Responsivo

- **Desktop**: Layout de largura total com sidebar fixa
- **Tablet**: Layouts de grid adaptativos
- **Mobile**: Navegação recolhível, espaçamento otimizado



## 📄 Licença

Este projeto está licenciado sob a MIT License.

---

**Desenvolvido com ❤️ para BIX Tecnologia**