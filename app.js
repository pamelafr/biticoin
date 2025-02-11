const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Log de acesso
app.use((req, res, next) => {
    console.log(`Acesso realizado: ${req.method} ${req.url}`);
    next();
});

// Função para pegar o preço do Bitcoin
const getBitcoinPrice = async (currency) => {
    try {
        const response = await axios.get(`https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`);
        return response.data.bpi[currency].rate;
    } catch (error) {
        console.error('Erro ao acessar a API', error);
        return null;
    }
};

// Rota principal para a página inicial
app.get('/', async (req, res) => {
    try {
        const usdPrice = await getBitcoinPrice('USD');
        const eurPrice = await getBitcoinPrice('EUR');
        const gbpPrice = await getBitcoinPrice('GBP');
        const date = new Date().toLocaleString();

        res.render('index', {
            usdPrice,
            eurPrice,
            gbpPrice,
            date
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Erro ao carregar os dados do Bitcoin' });
    }
});

// Rota para os preços de acordo com a moeda
app.get('/:currency', async (req, res) => {
    const { currency } = req.params;
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
        try {
            const price = await getBitcoinPrice(currency);
            const date = new Date().toLocaleString();
            res.render('index', {
                [`${currency.toLowerCase()}Price`]: price,
                date
            });
        } catch (error) {
            res.status(500).render('error', { message: 'Erro ao carregar os dados do Bitcoin' });
        }
    } else {
        res.status(404).render('error', { message: 'Endpoint não encontrado' });
    }
});

// Rota de erro
app.get('*', (req, res) => {
    res.status(404).render('error', { message: 'Página não encontrada' });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
