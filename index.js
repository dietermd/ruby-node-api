const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')

const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { body, check } = require('express-validator')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 5, // 5 requests,
// });

//app.use(limiter);

const obterVendedorPorUid = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const uid = request.params.uid;
  pool.query('SELECT * FROM vendedores WHERE uid = $1', [uid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows[0]);
  });
}

const inserirVendedor = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const { uid, cnpj, nome_responsavel, nome_estabelecimento, descricao, coordenada } = request.body
  pool.query('INSERT INTO vendedores (uid, cnpj, nome_responsavel, nome_estabelecimento, descricao, coordenada) VALUES ($1, $2, $3, $4, $5, $6)',
    [uid, cnpj, nome_responsavel, nome_estabelecimento, descricao, (`(${coordenada.x}, ${coordenada.y})`)], error => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'Sucesso', message: 'Vendedor adicionado' });
    });
}

const alterarVendedor = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const { uid, cnpj, nome_responsavel, nome_estabelecimento, descricao, coordenada } = request.body
  pool.query('UPDATE vendedores SET cnpj = $2, nome_responsavel = $3, nome_estabelecimento = $4, descricao = $5, coordenada = $6 WHERE uid = $1',
    [uid, cnpj, nome_responsavel, nome_estabelecimento, descricao, (`(${coordenada.x}, ${coordenada.y})`)], error => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'Sucesso', message: 'Vendedor atualizado' });
    });
}

const vendedorValidator = [check('uid').not().isEmpty().isLength({ min: 1, max: 128 }).trim(),
check('cnpj').not().isEmpty().isLength({ min: 1, max: 14 }).trim(),
check('nome_responsavel').not().isEmpty().isLength({ min: 1, max: 255 }).trim(),
check('nome_estabelecimento').not().isEmpty().isLength({ min: 1, max: 255 }).trim(),
]

const obterTodosProdutos = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const uid = request.params.uid;
  pool.query('SELECT * FROM produtos WHERE vendedor_uid = $1', [uid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

const inserirProduto = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const { vendedor_uid, nome, preco, descricao, imagem_url } = request.body;
  pool.query('INSERT INTO produtos (vendedor_uid, nome, preco, descricao, imagem_url) VALUES ($1, $2, $3, $4, $5)',
    [vendedor_uid, nome, preco, descricao, imagem_url], error => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'Sucesso', message: 'Produto adicionado' });
    });
}

const obterProduto = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const id = request.params.id;
  pool.query('SELECT * FROM produtos WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows[0]);
  });
}

const alterarProduto = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const { id, nome, preco, descricao, imagem_url } = request.body
  pool.query('UPDATE produtos SET nome = $2, preco = $3, descricao = $4, imagem_url = $5 WHERE id = $1',
    [id, nome, preco, descricao, imagem_url], error => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'Sucesso', message: 'Produto atualizado' });
    });
}

const excluirProduto = (request, response) => {
  if (!request.header('ApiKey') || request.header('ApiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' });
  }
  const id = request.params.id;
  pool.query('DELETE FROM produtos WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json({ status: 'Sucesso', message: 'Produto excluido' });
  });
}

app.get('/vendedor/:uid', obterVendedorPorUid);
app.post('/vendedor/inserir', inserirVendedor);
app.put('/vendedor/alterar', alterarVendedor);

app.get('/vendedor/produtos/:uid', obterTodosProdutos);
app.post('/produto/inserir', inserirProduto);
app.get('/produto/:id', obterProduto);
app.put('/produto/alterar', alterarProduto);
app.delete('/produto/excluir/:id', excluirProduto);


app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`);
});