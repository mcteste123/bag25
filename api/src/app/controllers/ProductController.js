const ProductsRepository = require('../repositories/ProductsRepository');
const SalesHistoryRepository = require('../repositories/SalesHistoryRepository');
const isValidUUID = require('../utils/isValidUUID');
const { ClienteGemini } = require('../../client');

class ProductController {
  async index(request, response) {
    const { orderBy } = request.query;
    const products = await ProductsRepository.findAll(orderBy);
    response.json(products);
  }

  async ia(req, res) {
    try {
      const { prompt } = req.body;

      // Estoque atual
      const produtos = await ProductsRepository.findAll();
      const dadosEstoque = produtos.map(p =>
        `Produto: ${p.name} | Categoria: ${p.category_id} | Quantidade: ${p.quantidade_itens}`
      ).join('\n');

      // Histórico de vendas
      const historico = await SalesHistoryRepository.findAll();
      const dadosHistorico = historico.map(h =>
        `${h.sale_date.toISOString().split('T')[0]} - ${h.product_name}: ${h.quantity_sold} unidades`
      ).join('\n');


      // Contexto final para IA
      const contexto = `
        Você é um analista de estoque e vendas.
        Aqui estão os dados do estoque atual e histórico de vendas.
        Responda sempre em português, de forma clara e objetiva.

        Estoque atual:
        ${dadosEstoque}

        Histórico de vendas:
        ${dadosHistorico}

        Pergunta do usuário:
        ${prompt}
      `;

      const resposta = await ClienteGemini(contexto);
      res.json({ resposta });

    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao gerar resposta da IA' });
    }
  }

  async biggest(request, response) {
    const products = await ProductsRepository.findBiggest();

    response.json(products);
  }

  async smallest(request, response) {
    const products = await ProductsRepository.findSmallest();

    response.json(products);
  }

  async show(request, response) {
    const { id } = request.params;

    const products = await ProductsRepository.findById(id);

    if (!products) {
      // 404 NOT FOUND
      return response.status(404).json({ error: 'Product not found' });
    }

    response.json(products);
  }

  async store(request, response) {
    const {
      name, category_id, quantidade_itens,
    } = request.body;

    if (!name) {
      return response.status(400).json({ error: 'Name is required' });
    }

    if (!category_id) {
      return response.status(400).json({ error: 'Category is required' });
    }

    if (!quantidade_itens) {
      return response.status(400).json({ error: 'Item quantity is required' });
    }

    if (category_id && !isValidUUID(category_id)) {
      return response.status(400).json({ error: 'Invalid category' });
    }

    const product = await ProductsRepository.create({
      name,
      category_id,
      quantidade_itens,
    });

    response.status(201).json(product);
  }

  async update(request, response) {
    const {
      name, category_id, quantidade_itens,
    } = request.body;

    const { id } = request.params;

    if (category_id && !isValidUUID(category_id)) {
      return response.status(400).json({ error: 'Invalid category' });
    }

    if (!name) {
      return response.status(400).json({ error: 'Name is required' });
    }

    const productExists = await ProductsRepository.findById(id);

    if (!productExists) {
      return response.status(404).json({ error: 'Product not found' });
    }

    const product = await ProductsRepository.update(id, {
      name,
      category_id,
      quantidade_itens,
    });

    response.json(product);
  }

  async delete(request, response) {
    const { id } = request.params;

    const productExists = await ProductsRepository.findById(id);

    if (!productExists) {
      return response.status(404).json({ error: 'Product not found' });
    }

    await ProductsRepository.delete(id);
    // 204 NO CONTENT
    response.sendStatus(204);
  }
}

// Singleton
module.exports = new ProductController();
