
// // const express = require('express');
// // const cors = require('cors');
// // const axios = require('axios');
// // const http = require('http');
// // const path = require('path');
// // const fs = require('fs');
// // require('dotenv').config(); // Pour charger les variables d'environnement

// // const app = express();
// // const PORT = 3000;

// // // Variables d'environnement pour l'API Webasyst
// // const WEBASYST_TOKEN = process.env.WEBASYST_TOKEN || '88938af231cc0e5f365d552646ce51ad';
// // const WEBASYST_ENDPOINT = process.env.WEBASYST_ENDPOINT || 'https://twowin.ru/api.php';

// // // Variable globale pour stocker le catalogue
// // let productCatalog = [];
// // let catalogLastUpdated = null;

// // // Configuration de base
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.static(path.join(__dirname, 'public')));

// // // Configuration de l'API LM Studio
// // const LM_STUDIO_API = 'http://127.0.0.1:1234/v1/chat/completions';
// // const MODEL_NAME = 'mathstral-7b-v0.1'; // ou le modèle que vous utilisez

// // // Fonction de mappage des champs Webasyst vers notre format
// // function mapWebasystProductToOurFormat(webasystProduct) {
// //     // Pour le premier produit uniquement, afficher la structure complète pour debug
// //     if (!mapWebasystProductToOurFormat.hasLoggedExampleProduct) {
// //         console.log("Exemple complet d'un produit Webasyst:", JSON.stringify(webasystProduct, null, 2));
// //         mapWebasystProductToOurFormat.hasLoggedExampleProduct = true;
// //     }

// //     // Extraire le contenu HTML de la description (si besoin)
// //     let cleanDescription = webasystProduct.description || '';
// //     if (cleanDescription && cleanDescription.includes('<')) {
// //         // Option simple: supprimer toutes les balises HTML
// //         cleanDescription = cleanDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
// //     }

// //     // Récupérer le premier SKU pour obtenir l'article
// //     let articleSku = '';
// //     if (webasystProduct.skus && typeof webasystProduct.skus === 'object') {
// //         // Obtenir le premier SKU
// //         const firstSkuId = Object.keys(webasystProduct.skus)[0];
// //         if (firstSkuId && webasystProduct.skus[firstSkuId]) {
// //             articleSku = webasystProduct.skus[firstSkuId].sku || '';
// //         }
// //     }

// //     // Mappage des champs selon l'exemple fourni
// //     return {
// //         'Наименование': webasystProduct.name || 'Товар без названия',
// //         'Артикул': articleSku || webasystProduct.sku_id || webasystProduct.id?.toString() || '',
// //         'Цена': webasystProduct.price?.toString() || '',
// //         'Наличие': parseFloat(webasystProduct.count) > 0 ? 'да' : 'нет',
// //         'Категория': webasystProduct.category_id ? `Категория ${webasystProduct.category_id}` : '',
// //         'Описание': cleanDescription,
// //         'Краткое описание': webasystProduct.summary || '',
// //         // Ajouter des champs supplémentaires qui peuvent être utiles
// //         'Производитель': '',  // À compléter si disponible
// //         'ID товара': webasystProduct.id?.toString() || '',
// //         'Единица измерения': webasystProduct.stock_unit_id || '',
// //         'Валюта': webasystProduct.currency || 'RUB',
// //         'URL товара': webasystProduct.url || '',
// //         'Статус': webasystProduct.status === '1' ? 'Активен' : 'Неактивен'
// //     };
// // }

// // // Chargement du catalogue depuis l'API Webasyst
// // async function loadCatalogFromWebasyst() {
// //     try {
// //         console.log("Tentative de chargement du catalogue depuis l'API Webasyst...");

// //         // Utiliser l'endpoint de recherche avec le paramètre fields pour inclure les skus
// //         const apiUrl = `${WEBASYST_ENDPOINT}/shop.product.search`;

// //         // Paramètres initiaux pour comprendre la pagination
// //         const initialResponse = await axios.get(apiUrl, {
// //             params: {
// //                 access_token: WEBASYST_TOKEN,
// //                 format: 'json',
// //                 limit: 1,
// //                 fields: '*,skus' // Inclure les skus dans la réponse
// //             }
// //         });

// //         // Afficher la structure initiale pour debug
// //         console.log("Structure de la réponse initiale de l'API:", JSON.stringify(initialResponse.data, null, 2));

// //         // Déterminer le nombre total de produits à récupérer
// //         const totalCount = initialResponse.data.count || 1000; // valeur par défaut si count n'est pas disponible
// //         const pageSize = 100; // Nombre de produits par page
// //         let mappedProducts = [];

// //         // Récupérer tous les produits en plusieurs appels si nécessaire
// //         for (let offset = 0; offset < totalCount; offset += pageSize) {
// //             console.log(`Récupération des produits ${offset} à ${offset + pageSize}...`);

// //             const response = await axios.get(apiUrl, {
// //                 params: {
// //                     access_token: WEBASYST_TOKEN,
// //                     format: 'json',
// //                     limit: pageSize,
// //                     offset: offset,
// //                     fields: '*,skus' // Inclure les skus dans la réponse
// //                 }
// //             });

// //             // Afficher la structure du premier lot pour debug
// //             if (offset === 0) {
// //                 console.log("Exemple d'un produit:", JSON.stringify(response.data.products?.[0] || {}, null, 2));
// //             }

// //             // Récupérer les produits
// //             const products = response.data.products || [];

// //             if (Array.isArray(products) && products.length > 0) {
// //                 console.log(`${products.length} produits récupérés dans ce lot`);

// //                 // Mapper chaque produit au format attendu
// //                 const mappedBatch = products.map(product => mapWebasystProductToOurFormat(product));
// //                 mappedProducts = [...mappedProducts, ...mappedBatch];
// //             } else {
// //                 console.log("Pas de produits dans ce lot ou format de réponse inattendu.");
// //                 if (!Array.isArray(products)) {
// //                     console.error("Format de réponse inattendu:", response.data);
// //                 }
// //                 break;
// //             }

// //             // Si moins de produits que prévu sont retournés, nous avons terminé
// //             if (products.length < pageSize) break;
// //         }

// //         console.log(`Catalogue chargé avec succès: ${mappedProducts.length} produits trouvés`);
// //         return mappedProducts;

// //     } catch (error) {
// //         console.error("Erreur lors du chargement du catalogue depuis l'API Webasyst:", error.message);
// //         if (error.response) {
// //             console.error("Détails de l'erreur:", error.response.data);
// //         }
// //         return [];
// //     }
// // }

// // // Charger le catalogue au démarrage
// // async function initCatalog() {
// //     try {
// //         productCatalog = await loadCatalogFromWebasyst();
// //         catalogLastUpdated = new Date();

// //         // Afficher quelques informations utiles sur le catalogue
// //         if (productCatalog && productCatalog.length > 0) {
// //             console.log('Catalogue chargé avec succès au démarrage');
// //             console.log(`Nombre total de produits: ${productCatalog.length}`);

// //             // Compter les produits en stock
// //             const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
// //             console.log(`Produits en stock: ${inStockCount}`);

// //             // Lister quelques catégories si disponibles
// //             const categories = {};
// //             productCatalog.forEach(p => {
// //                 if (p['Категория'] && !categories[p['Категория']]) {
// //                     categories[p['Категория']] = 1;
// //                 } else if (p['Категория']) {
// //                     categories[p['Категория']]++;
// //                 }
// //             });

// //             const categoryCount = Object.keys(categories).length;
// //             console.log(`Nombre de catégories: ${categoryCount}`);

// //             if (categoryCount > 0) {
// //                 console.log('Exemples de catégories:');
// //                 Object.entries(categories)
// //                     .sort((a, b) => b[1] - a[1])
// //                     .slice(0, 5)
// //                     .forEach(([cat, count]) => {
// //                         console.log(`- ${cat}: ${count} produits`);
// //                     });
// //             }
// //         } else {
// //             console.log('Catalogue chargé, mais aucun produit trouvé');
// //         }
// //     } catch (err) {
// //         console.error('Échec du chargement du catalogue:', err);
// //         productCatalog = []; // Initialiser avec un tableau vide en cas d'échec
// //     }
// // }

// // // Fonction pour rechercher des produits dans le catalogue
// // function searchProductsInCatalog(query, limit = 3) {
// //     if (!productCatalog || productCatalog.length === 0) {
// //         return { success: false, message: 'Catalogue non disponible' };
// //     }

// //     const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);
// //     if (keywords.length === 0) {
// //         return { success: false, message: 'Requête trop courte' };
// //     }

// //     // Fonction de score pour la pertinence
// //     function calculateScore(product) {
// //         let score = 0;
// //         const productName = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
// //         const productDesc = product['Описание'] ? product['Описание'].toLowerCase() : '';
// //         const productCat = product['Категория'] ? product['Категория'].toLowerCase() : '';
// //         const productCode = product['Артикул'] ? product['Артикул'].toLowerCase() : '';

// //         keywords.forEach(keyword => {
// //             // Points pour le nom du produit (plus important)
// //             if (productName.includes(keyword)) {
// //                 score += 10;
// //                 if (productName.startsWith(keyword)) score += 5;
// //             }

// //             // Points pour la description
// //             if (productDesc && productDesc.includes(keyword)) score += 3;

// //             // Points pour la catégorie
// //             if (productCat && productCat.includes(keyword)) score += 5;

// //             // Points pour l'article (référence exacte)
// //             if (productCode && productCode.includes(keyword)) score += 15;
// //         });

// //         return score;
// //     }

// //     // Recherche et tri des résultats
// //     const results = productCatalog
// //         .map(product => ({ product, score: calculateScore(product) }))
// //         .filter(item => item.score > 0)
// //         .sort((a, b) => b.score - a.score)
// //         .slice(0, limit)
// //         .map(item => item.product);

// //     return {
// //         success: true,
// //         products: results,
// //         count: results.length,
// //         totalProducts: productCatalog.length,
// //         lastUpdated: catalogLastUpdated
// //     };
// // }

// // // Vérifier si un produit est en stock basé sur son champ "Наличие"
// // function isProductInStock(product) {
// //     if (!product.hasOwnProperty('Наличие')) return false;

// //     const stockValue = product['Наличие'].toLowerCase();
// //     return stockValue.includes('да') ||
// //         stockValue.includes('есть') ||
// //         stockValue.includes('в наличии') ||
// //         stockValue === '1' ||
// //         stockValue === 'true';
// // }

// // // Fonction pour extraire une requête de recherche d'un message
// // function extractProductQuery(message) {
// //     // Pour les requêtes directes d'article
// //     const articleMatch = message.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) ||
// //         message.match(/товар[:\s]+([A-Za-z0-9-]+)/i) ||
// //         message.match(/код[:\s]+([A-Za-z0-9-]+)/i);
// //     if (articleMatch && articleMatch[1]) {
// //         return articleMatch[1].trim();
// //     }

// //     // Expressions courantes pour rechercher des produits
// //     const searchPatterns = [
// //         /найти (?:товар|продукт)[ы]? (.*?)(?:\?|$)/i,
// //         /найди (.*?) в каталоге/i,
// //         /поиск[ать]? (.*?)(?:\?|$)/i,
// //         /информация о (.*?)(?:\?|$)/i,
// //         /что такое (.*?)(?:\?|$)/i,
// //         /(?:стоимость|цена) (.*?)(?:\?|$)/i,
// //         /сколько стоит (.*?)(?:\?|$)/i
// //     ];

// //     for (const pattern of searchPatterns) {
// //         const match = message.match(pattern);
// //         if (match && match[1]) {
// //             return match[1].trim();
// //         }
// //     }

// //     // Si pas de pattern spécifique mais contient des mots clés de recherche
// //     const searchKeywords = ['найти', 'поиск', 'каталог', 'товар', 'продукт', 'артикул', 'цена', 'стоимость'];
// //     if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
// //         for (const keyword of searchKeywords) {
// //             const keywordIndex = message.toLowerCase().indexOf(keyword);
// //             if (keywordIndex !== -1) {
// //                 const potentialQuery = message.slice(keywordIndex + keyword.length).trim();
// //                 if (potentialQuery.length > 2) {
// //                     return potentialQuery.replace(/^\s*[:-]\s*/, '').replace(/[?!.,;]$/, '');
// //                 }
// //             }
// //         }
// //     }

// //     return null; // Pas une requête de recherche
// // }

// // // Fonction pour formatter les résultats de recherche en texte
// // function formatSearchResults(results, query) {
// //     if (!results.success) {
// //         return null;
// //     }

// //     if (results.products.length === 0) {
// //         return `К сожалению, по запросу "${query}" ничего не найдено в каталоге.`;
// //     }

// //     let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

// //     results.products.forEach((product, index) => {
// //         response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

// //         // Ajouter le prix s'il existe
// //         if (product['Цена']) {
// //             response += `💰 Цена: ${product['Цена']} руб.\n`;
// //         }

// //         // Ajouter la catégorie si elle existe
// //         if (product['Категория']) {
// //             response += `📂 Категория: ${product['Категория']}\n`;
// //         }

// //         // Ajouter l'article si disponible
// //         if (product['Артикул']) {
// //             response += `📝 Артикул: ${product['Артикул']}\n`;
// //         }

// //         // Ajouter une description courte
// //         if (product['Краткое описание']) {
// //             response += `📄 ${product['Краткое описание']}\n`;
// //         }

// //         // Ajouter la disponibilité si elle existe
// //         if (product.hasOwnProperty('Наличие')) {
// //             const isAvailable = isProductInStock(product);
// //             response += `${isAvailable ? '✅' : '❌'} ${isAvailable ? 'В наличии' : 'Нет в наличии'}\n`;
// //         }

// //         response += "\n";
// //     });

// //     return response;
// // }

// // // Route principale pour servir l'interface HTML
// // app.get('/', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// // });

// // // API pour obtenir tous les produits (avec pagination)
// // app.get('/api/products', (req, res) => {
// //     if (!productCatalog || productCatalog.length === 0) {
// //         return res.json({
// //             success: false,
// //             message: 'Catalogue non disponible'
// //         });
// //     }

// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 100;
// //     const search = req.query.search || '';

// //     let filteredProducts = productCatalog;

// //     // Filtre de recherche
// //     if (search) {
// //         const searchLower = search.toLowerCase();
// //         filteredProducts = productCatalog.filter(product => {
// //             const name = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
// //             const cat = product['Категория'] ? product['Категория'].toLowerCase() : '';
// //             const code = product['Артикул'] ? product['Артикул'].toLowerCase() : '';

// //             return name.includes(searchLower) ||
// //                 cat.includes(searchLower) ||
// //                 code.includes(searchLower);
// //         });
// //     }

// //     // Pagination
// //     const startIndex = (page - 1) * limit;
// //     const endIndex = page * limit;
// //     const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

// //     res.json({
// //         success: true,
// //         products: paginatedProducts,
// //         totalProducts: filteredProducts.length,
// //         totalPages: Math.ceil(filteredProducts.length / limit),
// //         currentPage: page,
// //         categories: getCategoryList(),
// //         lastUpdated: catalogLastUpdated
// //     });
// // });

// // // Obtenir la liste des catégories
// // function getCategoryList() {
// //     if (!productCatalog || productCatalog.length === 0) return [];

// //     const categories = {};

// //     productCatalog.forEach(product => {
// //         if (product['Категория']) {
// //             const category = product['Категория'];
// //             if (!categories[category]) {
// //                 categories[category] = 1;
// //             } else {
// //                 categories[category]++;
// //             }
// //         }
// //     });

// //     return Object.entries(categories)
// //         .map(([name, count]) => ({ name, count }))
// //         .sort((a, b) => b.count - a.count);
// // }

// // // API pour obtenir un produit spécifique par ID ou Артикул
// // app.get('/api/products/:id', (req, res) => {
// //     if (!productCatalog || productCatalog.length === 0) {
// //         return res.json({
// //             success: false,
// //             message: 'Catalogue non disponible'
// //         });
// //     }

// //     const id = req.params.id;

// //     // Recherche par index si c'est un nombre
// //     if (!isNaN(id) && parseInt(id) >= 0 && parseInt(id) < productCatalog.length) {
// //         return res.json({
// //             success: true,
// //             product: productCatalog[parseInt(id)]
// //         });
// //     }

// //     // Recherche par code article
// //     const product = productCatalog.find(p =>
// //         p['Артикул'] && p['Артикул'].toString().toLowerCase() === id.toLowerCase()
// //     );

// //     if (product) {
// //         return res.json({
// //             success: true,
// //             product: product
// //         });
// //     }

// //     res.json({
// //         success: false,
// //         message: 'Продукт не найден'
// //     });
// // });

// // // API pour obtenir les produits par catégorie
// // app.get('/api/categories/:category', (req, res) => {
// //     if (!productCatalog || productCatalog.length === 0) {
// //         return res.json({
// //             success: false,
// //             message: 'Catalogue non disponible'
// //         });
// //     }

// //     const category = req.params.category;
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = parseInt(req.query.limit) || 100;

// //     const filteredProducts = productCatalog.filter(product =>
// //         product['Категория'] && product['Категория'].toLowerCase() === category.toLowerCase()
// //     );

// //     // Pagination
// //     const startIndex = (page - 1) * limit;
// //     const endIndex = page * limit;
// //     const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

// //     res.json({
// //         success: true,
// //         category: category,
// //         products: paginatedProducts,
// //         totalProducts: filteredProducts.length,
// //         totalPages: Math.ceil(filteredProducts.length / limit),
// //         currentPage: page
// //     });
// // });

// // // API pour chercher des produits par mots-clés
// // app.get('/api/search', (req, res) => {
// //     const query = req.query.q;

// //     if (!query) {
// //         return res.json({
// //             success: false,
// //             message: 'Запрос поиска не предоставлен'
// //         });
// //     }

// //     const results = searchProductsInCatalog(query, 20); // Plus de résultats pour le frontend
// //     res.json(results);
// // });

// // // Route API pour envoyer des messages au modèle
// // app.post('/api/chat', async (req, res) => {
// //     try {
// //         const { message, conversation } = req.body;

// //         // Vérifier si le message contient une requête de recherche de produit
// //         const productQuery = extractProductQuery(message);
// //         let catalogInfo = null;

// //         if (productQuery) {
// //             const searchResults = searchProductsInCatalog(productQuery);
// //             if (searchResults.success && searchResults.products.length > 0) {
// //                 catalogInfo = formatSearchResults(searchResults, productQuery);
// //                 console.log(`Requête de catalogue détectée: "${productQuery}"`);
// //             }
// //         }

// //         // Messages système pour contrôler les réponses
// //         const systemMessage = {
// //             role: "system",
// //             content: `Ты Twowin AI, интеллектуальный помощник для компании Twowin (https://twowin.ru/), онлайн-магазина строительных материалов и инструментов в России. Отвечай на вопросы сотрудников о товарах, инструментах, строительных материалах, сантехнике, электротоварах и других товарах для ремонта и строительства. Используй соответствующую терминологию отрасли. Если не знаешь точного ответа о конкретном товаре, предложи сотруднику проверить онлайн-каталог. Отвечай на русском языке.${productCatalog.length > 0 ?
// //                 `\n\nУ тебя есть доступ к каталогу с ${productCatalog.length} товарами. Когда тебя спрашивают о конкретных товарах, рекомендуй проверить каталог.` :
// //                 ""
// //                 }`
// //         };

// //         // Si on a une info catalogue, on l'ajoute comme contexte
// //         const userMessageWithContext = catalogInfo ?
// //             { role: 'user', content: `${message}\n\nИнформация из каталога:\n${catalogInfo}` } :
// //             { role: 'user', content: message };

// //         // Préparer les messages pour l'API
// //         const messages = [
// //             systemMessage,
// //             ...conversation,
// //             userMessageWithContext
// //         ];

// //         // Configuration pour le streaming
// //         res.setHeader('Content-Type', 'text/event-stream');
// //         res.setHeader('Cache-Control', 'no-cache');
// //         res.setHeader('Connection', 'keep-alive');

// //         // Envoyer la requête à LM Studio avec streaming
// //         const response = await axios.post(LM_STUDIO_API, {
// //             model: MODEL_NAME,
// //             messages: messages,
// //             temperature: 0.7,
// //             max_tokens: 1000,
// //             stream: true
// //         }, {
// //             responseType: 'stream'
// //         });

// //         let fullResponse = "";

// //         // Ajouter les résultats du catalogue au début si disponibles
// //         if (catalogInfo) {
// //             fullResponse = catalogInfo + "\n\n";
// //             res.write(`data: ${JSON.stringify({ content: catalogInfo + "\n\n" })}\n\n`);
// //         }

// //         response.data.on('data', (chunk) => {
// //             try {
// //                 const lines = chunk.toString().split('\n');

// //                 for (const line of lines) {
// //                     if (line.startsWith('data: ') && line !== 'data: [DONE]') {
// //                         const jsonData = JSON.parse(line.substring(6));
// //                         if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
// //                             const content = jsonData.choices[0].delta.content;
// //                             fullResponse += content;
// //                             res.write(`data: ${JSON.stringify({ content })}\n\n`);
// //                         }
// //                     } else if (line === 'data: [DONE]') {
// //                         res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
// //                         res.end();
// //                     }
// //                 }
// //             } catch (error) {
// //                 console.error('Erreur lors du traitement du stream:', error);
// //             }
// //         });

// //         response.data.on('end', () => {
// //             if (!res.finished) {
// //                 res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
// //                 res.end();
// //             }
// //         });

// //         response.data.on('error', (err) => {
// //             console.error('Erreur de stream:', err);
// //             if (!res.finished) {
// //                 res.write(`data: ${JSON.stringify({ error: 'Erreur de streaming' })}\n\n`);
// //                 res.end();
// //             }
// //         });

// //     } catch (error) {
// //         console.error('Erreur lors de la communication avec LM Studio:', error.message);
// //         res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la communication avec le modèle' })}\n\n`);
// //         res.end();
// //     }
// // });

// // // Démarrer le serveur
// // const server = http.createServer(app);

// // // Initialiser le catalogue avant de démarrer le serveur
// // initCatalog().then(() => {
// //     server.listen(PORT, '0.0.0.0', () => {
// //         console.log(`Serveur chatbot démarré sur http://localhost:${PORT}`);
// //         console.log(`Connecté à LM Studio sur ${LM_STUDIO_API}`);
// //         if (productCatalog.length > 0) {
// //             console.log(`Catalogue chargé avec ${productCatalog.length} produits`);
// //         } else {
// //             console.log('Aucun catalogue chargé.');
// //         }
// //     });
// // }).catch(err => {
// //     console.error('Erreur lors de l\'initialisation du catalogue:', err);
// //     // Démarrer le serveur même en cas d'échec du chargement du catalogue
// //     server.listen(PORT, '0.0.0.0', () => {
// //         console.log(`Serveur chatbot démarré sur http://localhost:${PORT} (sans catalogue)`);
// //         console.log(`Connecté à LM Studio sur ${LM_STUDIO_API}`);
// //     });
// // });

// // // Fonction pour rafraîchir le catalogue périodiquement (toutes les 12 heures)
// // const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 heures en millisecondes
// // setInterval(async () => {
// //     console.log('Actualisation périodique du catalogue...');
// //     try {
// //         const newCatalog = await loadCatalogFromWebasyst();
// //         if (newCatalog && newCatalog.length > 0) {
// //             productCatalog = newCatalog;
// //             catalogLastUpdated = new Date();
// //             console.log(`Catalogue actualisé avec ${productCatalog.length} produits`);
// //         }
// //     } catch (error) {
// //         console.error('Échec de l\'actualisation périodique du catalogue:', error);
// //     }
// // }, REFRESH_INTERVAL);

// // Conversion en module ES
// import express from 'express';
// import cors from 'cors';
// import axios from 'axios';
// import http from 'http';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// // Configuration de l'environnement
// dotenv.config();

// // Conversion __dirname et __filename pour ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// const PORT = 3000;

// // Variables d'environnement pour l'API Webasyst
// const WEBASYST_TOKEN = process.env.WEBASYST_TOKEN || '88938af231cc0e5f365d552646ce51ad';
// const WEBASYST_ENDPOINT = process.env.WEBASYST_ENDPOINT || 'https://twowin.ru/api.php';

// // Configuration de l'API Gemini
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'VOTRE_CLÉ_API_GEMINI';
// const GEMINI_MODEL_NAME = 'gemini-1.5-flash'; // Utiliser le modèle gemini-1.5-flash

// // Initialisation de l'API Gemini
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

// // Variable globale pour stocker le catalogue
// let productCatalog = [];
// let catalogLastUpdated = null;

// // Configuration de base
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // Fonction de mappage des champs Webasyst vers notre format
// // function mapWebasystProductToOurFormat(webasystProduct) {
// //     // Pour le premier produit uniquement, afficher la structure complète pour debug
// //     if (!mapWebasystProductToOurFormat.hasLoggedExampleProduct) {
// //         console.log("Exemple complet d'un produit Webasyst:", JSON.stringify(webasystProduct, null, 2));
// //         mapWebasystProductToOurFormat.hasLoggedExampleProduct = true;
// //     }

// //     // Extraire le contenu HTML de la description (si besoin)
// //     let cleanDescription = webasystProduct.description || '';
// //     if (cleanDescription && cleanDescription.includes('<')) {
// //         // Option simple: supprimer toutes les balises HTML
// //         cleanDescription = cleanDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
// //     }

// //     // Récupérer le premier SKU pour obtenir l'article
// //     let articleSku = '';
// //     if (webasystProduct.skus && typeof webasystProduct.skus === 'object') {
// //         // Obtenir le premier SKU
// //         const firstSkuId = Object.keys(webasystProduct.skus)[0];
// //         if (firstSkuId && webasystProduct.skus[firstSkuId]) {
// //             articleSku = webasystProduct.skus[firstSkuId].sku || '';
// //         }
// //     }

// //     // Mappage des champs selon l'exemple fourni
// //     return {
// //         'Наименование': webasystProduct.name || 'Товар без названия',
// //         'Артикул': articleSku || webasystProduct.sku_id || webasystProduct.id?.toString() || '',
// //         'Цена': webasystProduct.price?.toString() || '',
// //         'Наличие': parseFloat(webasystProduct.count) > 0 ? 'да' : 'нет',
// //         'Категория': webasystProduct.category_id ? `Категория ${webasystProduct.category_id}` : '',
// //         'Описание': cleanDescription,
// //         'Краткое описание': webasystProduct.summary || '',
// //         // Ajouter des champs supplémentaires qui peuvent être utiles
// //         'Производитель': '',  // À compléter si disponible
// //         'ID товара': webasystProduct.id?.toString() || '',
// //         'Единица измерения': webasystProduct.stock_unit_id || '',
// //         'Валюта': webasystProduct.currency || 'RUB',
// //         'URL товара': webasystProduct.url ? `https://twowin.ru/product/${webasystProduct.url}` : '',
// //         'Статус': webasystProduct.status === '1' ? 'Активен' : 'Неактивен'
// //     };
// // }

// function mapWebasystProductToOurFormat(webasystProduct) {
//     // Pour le premier produit uniquement, afficher la structure complète pour debug
//     if (!mapWebasystProductToOurFormat.hasLoggedExampleProduct) {
//         console.log("Exemple complet d'un produit Webasyst:", JSON.stringify(webasystProduct, null, 2));
//         mapWebasystProductToOurFormat.hasLoggedExampleProduct = true;
//     }

//     // Extraire le contenu HTML de la description (si besoin)
//     let cleanDescription = webasystProduct.description || '';
//     if (cleanDescription && cleanDescription.includes('<')) {
//         // Option simple: supprimer toutes les balises HTML
//         cleanDescription = cleanDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
//     }

//     // Récupérer le numéro d'article (SKU) à partir de l'objet skus
//     let articleSku = '';
//     if (webasystProduct.skus && typeof webasystProduct.skus === 'object') {
//         // Obtenir le premier SKU
//         const firstSkuId = Object.keys(webasystProduct.skus)[0];
//         if (firstSkuId && webasystProduct.skus[firstSkuId]) {
//             // Récupérer directement la propriété "sku" de l'objet SKU
//             articleSku = webasystProduct.skus[firstSkuId].sku || '';
//         }
//     }

//     // Mappage des champs
//     return {
//         'Наименование': webasystProduct.name || 'Товар без названия',
//         'Артикул': articleSku || '', // Utiliser uniquement le SKU extrait de l'objet skus
//         'Цена': webasystProduct.price?.toString() || '',
//         'Наличие': parseFloat(webasystProduct.count) > 0 ? 'да' : 'нет',
//         'Категория': webasystProduct.category_id ? `Категория ${webasystProduct.category_id}` : '',
//         'Описание': cleanDescription,
//         'Краткое описание': webasystProduct.summary || '',
//         // Ajouter des champs supplémentaires qui peuvent être utiles
//         'Производитель': '',  // À compléter si disponible
//         'ID товара': webasystProduct.id?.toString() || '',
//         'Единица измерения': webasystProduct.stock_unit_id || '',
//         'Валюта': webasystProduct.currency || 'RUB',
//         'URL товара': webasystProduct.url ? `https://twowin.ru/product/${webasystProduct.url}` : '',
//         'Статус': webasystProduct.status === '1' ? 'Активен' : 'Неактивен'
//     };
// }

// // Chargement du catalogue depuis l'API Webasyst
// async function loadCatalogFromWebasyst() {
//     try {
//         console.log("Tentative de chargement du catalogue depuis l'API Webasyst...");

//         // Utiliser l'endpoint de recherche avec le paramètre fields pour inclure les skus
//         const apiUrl = `${WEBASYST_ENDPOINT}/shop.product.search`;

//         // Paramètres initiaux pour comprendre la pagination
//         const initialResponse = await axios.get(apiUrl, {
//             params: {
//                 access_token: WEBASYST_TOKEN,
//                 format: 'json',
//                 limit: 1,
//                 fields: '*,skus' // Inclure les skus dans la réponse
//             }
//         });

//         // Afficher la structure initiale pour debug
//         console.log("Structure de la réponse initiale de l'API:", JSON.stringify(initialResponse.data, null, 2));

//         // Déterminer le nombre total de produits à récupérer
//         const totalCount = initialResponse.data.count || 1000; // valeur par défaut si count n'est pas disponible
//         const pageSize = 100; // Nombre de produits par page
//         let mappedProducts = [];

//         // Récupérer tous les produits en plusieurs appels si nécessaire
//         for (let offset = 0; offset < totalCount; offset += pageSize) {
//             console.log(`Récupération des produits ${offset} à ${offset + pageSize}...`);

//             const response = await axios.get(apiUrl, {
//                 params: {
//                     access_token: WEBASYST_TOKEN,
//                     format: 'json',
//                     limit: pageSize,
//                     offset: offset,
//                     fields: '*,skus' // Inclure les skus dans la réponse
//                 }
//             });

//             // Afficher la structure du premier lot pour debug
//             if (offset === 0) {
//                 console.log("Exemple d'un produit:", JSON.stringify(response.data.products?.[0] || {}, null, 2));
//             }

//             // Récupérer les produits
//             const products = response.data.products || [];


//             if (Array.isArray(products) && products.length > 0) {
//                 console.log(`${products.length} produits récupérés dans ce lot`);

//                 // Mapper chaque produit au format attendu
//                 const mappedBatch = products.map(product => mapWebasystProductToOurFormat(product));
//                 mappedProducts = [...mappedProducts, ...mappedBatch];
//             } else {
//                 console.log("Pas de produits dans ce lot ou format de réponse inattendu.");
//                 if (!Array.isArray(products)) {
//                     console.error("Format de réponse inattendu:", response.data);
//                 }
//                 break;
//             }

//             // Si moins de produits que prévu sont retournés, nous avons terminé
//             if (products.length < pageSize) break;
//         }

//         console.log(`Catalogue chargé avec succès: ${mappedProducts.length} produits trouvés`);
//         return mappedProducts;

//     } catch (error) {
//         console.error("Erreur lors du chargement du catalogue depuis l'API Webasyst:", error.message);
//         if (error.response) {
//             console.error("Détails de l'erreur:", error.response.data);
//         }
//         return [];
//     }
// }

// // Charger le catalogue au démarrage
// async function initCatalog() {
//     try {
//         productCatalog = await loadCatalogFromWebasyst();
//         catalogLastUpdated = new Date();

//         // Afficher quelques informations utiles sur le catalogue
//         if (productCatalog && productCatalog.length > 0) {
//             console.log('Catalogue chargé avec succès au démarrage');
//             console.log(`Nombre total de produits: ${productCatalog.length}`);

//             // Compter les produits en stock
//             const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
//             console.log(`Produits en stock: ${inStockCount}`);

//             // Lister quelques catégories si disponibles
//             const categories = {};
//             productCatalog.forEach(p => {
//                 if (p['Категория'] && !categories[p['Категория']]) {
//                     categories[p['Категория']] = 1;
//                 } else if (p['Категория']) {
//                     categories[p['Категория']]++;
//                 }
//             });

//             const categoryCount = Object.keys(categories).length;
//             console.log(`Nombre de catégories: ${categoryCount}`);

//             if (categoryCount > 0) {
//                 console.log('Exemples de catégories:');
//                 Object.entries(categories)
//                     .sort((a, b) => b[1] - a[1])
//                     .slice(0, 5)
//                     .forEach(([cat, count]) => {
//                         console.log(`- ${cat}: ${count} produits`);
//                     });
//             }
//         } else {
//             console.log('Catalogue chargé, mais aucun produit trouvé');
//         }
//     } catch (err) {
//         console.error('Échec du chargement du catalogue:', err);
//         productCatalog = []; // Initialiser avec un tableau vide en cas d'échec
//     }
// }

// // Fonction pour rechercher des produits dans le catalogue
// function searchProductsInCatalog(query, limit = 3) {
//     if (!productCatalog || productCatalog.length === 0) {
//         return { success: false, message: 'Catalogue non disponible' };
//     }

//     const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);
//     if (keywords.length === 0) {
//         return { success: false, message: 'Requête trop courte' };
//     }

//     // Fonction de score pour la pertinence
//     function calculateScore(product) {
//         let score = 0;
//         const productName = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
//         const productDesc = product['Описание'] ? product['Описание'].toLowerCase() : '';
//         const productCat = product['Категория'] ? product['Категория'].toLowerCase() : '';
//         const productCode = product['Артикул'] ? product['Артикул'].toLowerCase() : '';

//         keywords.forEach(keyword => {
//             // Points pour le nom du produit (plus important)
//             if (productName.includes(keyword)) {
//                 score += 10;
//                 if (productName.startsWith(keyword)) score += 5;
//             }

//             // Points pour la description
//             if (productDesc && productDesc.includes(keyword)) score += 3;

//             // Points pour la catégorie
//             if (productCat && productCat.includes(keyword)) score += 5;

//             // Points pour l'article (référence exacte)
//             if (productCode && productCode.includes(keyword)) score += 15;
//         });

//         return score;
//     }

//     // Recherche et tri des résultats
//     const results = productCatalog
//         .map(product => ({ product, score: calculateScore(product) }))
//         .filter(item => item.score > 0)
//         .sort((a, b) => b.score - a.score)
//         .slice(0, limit)
//         .map(item => item.product);

//     return {
//         success: true,
//         products: results,
//         count: results.length,
//         totalProducts: productCatalog.length,
//         lastUpdated: catalogLastUpdated
//     };
// }

// // Vérifier si un produit est en stock basé sur son champ "Наличие"
// function isProductInStock(product) {
//     if (!product.hasOwnProperty('Наличие')) return false;

//     const stockValue = product['Наличие'].toLowerCase();
//     return stockValue.includes('да') ||
//         stockValue.includes('есть') ||
//         stockValue.includes('в наличии') ||
//         stockValue === '1' ||
//         stockValue === 'true';
// }

// // Fonction pour extraire une requête de recherche d'un message
// function extractProductQuery(message) {
//     // Pour les requêtes directes d'article
//     const articleMatch = message.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) ||
//         message.match(/товар[:\s]+([A-Za-z0-9-]+)/i) ||
//         message.match(/код[:\s]+([A-Za-z0-9-]+)/i);
//     if (articleMatch && articleMatch[1]) {
//         return articleMatch[1].trim();
//     }

//     // Expressions courantes pour rechercher des produits
//     const searchPatterns = [
//         /найти (?:товар|продукт)[ы]? (.*?)(?:\?|$)/i,
//         /найди (.*?) в каталоге/i,
//         /поиск[ать]? (.*?)(?:\?|$)/i,
//         /информация о (.*?)(?:\?|$)/i,
//         /что такое (.*?)(?:\?|$)/i,
//         /(?:стоимость|цена) (.*?)(?:\?|$)/i,
//         /сколько стоит (.*?)(?:\?|$)/i
//     ];

//     for (const pattern of searchPatterns) {
//         const match = message.match(pattern);
//         if (match && match[1]) {
//             return match[1].trim();
//         }
//     }

//     // Si pas de pattern spécifique mais contient des mots clés de recherche
//     const searchKeywords = ['найти', 'поиск', 'каталог', 'товар', 'продукт', 'артикул', 'цена', 'стоимость'];
//     if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
//         for (const keyword of searchKeywords) {
//             const keywordIndex = message.toLowerCase().indexOf(keyword);
//             if (keywordIndex !== -1) {
//                 const potentialQuery = message.slice(keywordIndex + keyword.length).trim();
//                 if (potentialQuery.length > 2) {
//                     return potentialQuery.replace(/^\s*[:-]\s*/, '').replace(/[?!.,;]$/, '');
//                 }
//             }
//         }
//     }

//     return null; // Pas une requête de recherche
// }

// // Fonction pour formatter les résultats de recherche en texte
// // function formatSearchResults(results, query) {
// //     if (!results.success) {
// //         return null;
// //     }

// //     if (results.products.length === 0) {
// //         return `К сожалению, по запросу "${query}" ничего не найдено в каталоге.`;
// //     }

// //     let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

// //     results.products.forEach((product, index) => {
// //         response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

// //         // Ajouter le prix s'il existe
// //         if (product['Цена']) {
// //             response += `💰 Цена: ${product['Цена']} руб.\n`;
// //         }

// //         // Ajouter la catégorie si elle existe
// //         if (product['Категория']) {
// //             response += `📂 Категория: ${product['Категория']}\n`;
// //         }

// //         // Ajouter l'article si disponible
// //         if (product['Артикул']) {
// //             response += `📝 Артикул: ${product['Артикул']}\n`;
// //         }

// //         // Ajouter une description courte
// //         if (product['Краткое описание']) {
// //             response += `📄 ${product['Краткое описание']}\n`;
// //         }

// //         // Ajouter la disponibilité si elle existe
// //         if (product.hasOwnProperty('Наличие')) {
// //             const isAvailable = isProductInStock(product);
// //             response += `${isAvailable ? '✅' : '❌'} ${isAvailable ? 'В наличии' : 'Нет в наличии'}\n`;
// //         }

// //         response += "\n";
// //     });

// //     return response;
// // }

// // function formatSearchResults(results, query) {
// //     if (!results.success) {
// //         return null;
// //     }

// //     if (results.products.length === 0) {
// //         return `К сожалению, по запросу "${query}" ничего не найдено в каталоге.`;
// //     }

// //     let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

// //     results.products.forEach((product, index) => {
// //         response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

// //         // Ajouter le prix s'il existe avec mise en forme spéciale 
// //         // Utiliser une balise HTML <span> avec style inline
// //         if (product['Цена']) {
// //             // Version HTML avec style inline pour le chat
// //             response += `💰 <span style="color: red; font-weight: bold;">Цена: ${product['Цена']} руб.</span>\n`;
// //         }

// //         // Ajouter la catégorie si elle existe
// //         if (product['Категория']) {
// //             response += `📂 Категория: ${product['Категория']}\n`;
// //         }

// //         // Ajouter l'article si disponible
// //         if (product['Артикул']) {
// //             response += `📝 Артикул: ${product['Артикул']}\n`;
// //         }

// //         // Ajouter une description courte
// //         if (product['Краткое описание']) {
// //             response += `📄 ${product['Краткое описание']}\n`;
// //         }

// //         // Ajouter la disponibilité si elle existe
// //         if (product.hasOwnProperty('Наличие')) {
// //             const isAvailable = isProductInStock(product);
// //             response += `${isAvailable ? '✅' : '❌'} ${isAvailable ? 'В наличии' : 'Нет в наличии'}\n`;
// //         }

// //         response += "\n";
// //     });

// //     return response;
// // }

// function formatSearchResults(results, query) {
//     if (!results.success) return null;

//     if (results.products.length === 0) {
//         return `К сожалению, по запросу "${query}" ничего не найдено в каталоге.`;
//     }

//     let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

//     results.products.forEach((product, index) => {
//         response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

//         // Prix (mise en évidence rouge)
//         if (product['Цена']) {
//             response += `💰 <span style="color:red;font-weight:bold;">Цена: ${product['Цена']} руб.</span>\n`;
//         }

//         // Catégorie
//         if (product['Категория']) {
//             response += `📂 Категория: ${product['Категория']}\n`;
//         }

//         // ---- Артикул cliquable ----
//         if (product['Артикул']) {
//             const art = product['Артикул'];
//             response += `📝 Артикул: <a href="#" class="insert-artikul" data-artikul="${art}">${art}</a>\n`;
//         }

//         // Description courte
//         if (product['Краткое описание']) {
//             response += `📄 ${product['Краткое описание']}\n`;
//         }

//         // Disponibilité
//         if (product.hasOwnProperty('Наличие')) {
//             const inStock = isProductInStock(product);
//             response += `${inStock ? '✅ В наличии' : '❌ Нет в наличии'}\n`;
//         }

//         response += '\n';
//     });

//     return response;
// }


// // Route principale pour servir l'interface HTML
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // API pour obtenir tous les produits (avec pagination)
// app.get('/api/products', (req, res) => {
//     if (!productCatalog || productCatalog.length === 0) {
//         return res.json({
//             success: false,
//             message: 'Catalogue non disponible'
//         });
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 1000000;
//     const search = req.query.search || '';

//     let filteredProducts = productCatalog;

//     // Filtre de recherche
//     if (search) {
//         const searchLower = search.toLowerCase();
//         filteredProducts = productCatalog.filter(product => {
//             const name = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
//             const cat = product['Категория'] ? product['Категория'].toLowerCase() : '';
//             const code = product['Артикул'] ? product['Артикул'].toLowerCase() : '';

//             return name.includes(searchLower) ||
//                 cat.includes(searchLower) ||
//                 code.includes(searchLower);
//         });
//     }

//     // Pagination
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

//     res.json({
//         success: true,
//         products: paginatedProducts,
//         totalProducts: filteredProducts.length,
//         totalPages: Math.ceil(filteredProducts.length / limit),
//         currentPage: page,
//         categories: getCategoryList(),
//         lastUpdated: catalogLastUpdated
//     });
// });

// // Obtenir la liste des catégories
// function getCategoryList() {
//     if (!productCatalog || productCatalog.length === 0) return [];

//     const categories = {};

//     productCatalog.forEach(product => {
//         if (product['Категория']) {
//             const category = product['Категория'];
//             if (!categories[category]) {
//                 categories[category] = 1;
//             } else {
//                 categories[category]++;
//             }
//         }
//     });

//     return Object.entries(categories)
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count);
// }

// // API pour obtenir un produit spécifique par ID ou Артикул
// app.get('/api/products/:id', (req, res) => {
//     if (!productCatalog || productCatalog.length === 0) {
//         return res.json({
//             success: false,
//             message: 'Catalogue non disponible'
//         });
//     }

//     const id = req.params.id;

//     // Recherche par index si c'est un nombre
//     if (!isNaN(id) && parseInt(id) >= 0 && parseInt(id) < productCatalog.length) {
//         return res.json({
//             success: true,
//             product: productCatalog[parseInt(id)]
//         });
//     }

//     // Recherche par code article
//     const product = productCatalog.find(p =>
//         p['Артикул'] && p['Артикул'].toString().toLowerCase() === id.toLowerCase()
//     );

//     if (product) {
//         return res.json({
//             success: true,
//             product: product
//         });
//     }

//     res.json({
//         success: false,
//         message: 'Продукт не найден'
//     });
// });

// // API pour obtenir les produits par catégorie
// app.get('/api/categories/:category', (req, res) => {
//     if (!productCatalog || productCatalog.length === 0) {
//         return res.json({
//             success: false,
//             message: 'Catalogue non disponible'
//         });
//     }

//     const category = req.params.category;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10000000;

//     const filteredProducts = productCatalog.filter(product =>
//         product['Категория'] && product['Категория'].toLowerCase() === category.toLowerCase()
//     );

//     // Pagination
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

//     res.json({
//         success: true,
//         category: category,
//         products: paginatedProducts,
//         totalProducts: filteredProducts.length,
//         totalPages: Math.ceil(filteredProducts.length / limit),
//         currentPage: page
//     });
// });

// // API pour chercher des produits par mots-clés
// app.get('/api/search', (req, res) => {
//     const query = req.query.q;

//     if (!query) {
//         return res.json({
//             success: false,
//             message: 'Запрос поиска не предоставлен'
//         });
//     }

//     const results = searchProductsInCatalog(query, 20); // Plus de résultats pour le frontend
//     res.json(results);
// });

// // Fonction pour appeler l'API Gemini avec la bibliothèque officielle
// async function callGeminiAPI(messages, temperature = 0.7) {
//     try {
//         // Préparer les messages pour Gemini
//         const geminiMessages = [];

//         // Convertir les messages au format Gemini
//         for (const msg of messages) {
//             if (msg.role === 'system') {
//                 // Ajouter le message système en tant que directive utilisateur
//                 geminiMessages.push({
//                     role: 'user',
//                     parts: [{ text: `[System Instruction] ${msg.content}` }]
//                 });

//                 // Ajouter une réponse modèle fictive confirmant la compréhension
//                 geminiMessages.push({
//                     role: 'model',
//                     parts: [{ text: 'Je comprends les instructions du système.' }]
//                 });
//             } else if (msg.role === 'user') {
//                 geminiMessages.push({
//                     role: 'user',
//                     parts: [{ text: msg.content }]
//                 });
//             } else if (msg.role === 'assistant') {
//                 geminiMessages.push({
//                     role: 'model',
//                     parts: [{ text: msg.content }]
//                 });
//             }
//         }

//         // Configuration du modèle
//         const generationConfig = {
//             temperature: temperature,
//             maxOutputTokens: 2048,
//         };

//         // Créer une instance de chat
//         const chat = geminiModel.startChat({
//             generationConfig,
//             history: geminiMessages.slice(0, -1) // Exclure le dernier message utilisateur pour l'envoyer séparément
//         });

//         // Envoyer le dernier message utilisateur et obtenir la réponse
//         const lastUserMessage = geminiMessages[geminiMessages.length - 1];
//         const result = await chat.sendMessage(lastUserMessage.parts[0].text);

//         // Retourner le texte de la réponse
//         return result.response.text();
//     } catch (error) {
//         console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
//         throw error;
//     }
// }

// // Fonction pour simuler le streaming d'une réponse
// function simulateStreamResponse(text) {
//     // Découper la réponse en petits morceaux pour simuler un streaming
//     const tokens = text.split(/(\s+|\.|,|!|\?|:)/g).filter(Boolean);
//     const chunks = [];
//     let currentChunk = '';

//     for (const token of tokens) {
//         currentChunk += token;
//         // Envoyer des chunks de taille variable (1-5 tokens)
//         if (currentChunk.length > 0 && Math.random() < 0.2) {
//             chunks.push(currentChunk);
//             currentChunk = '';
//         }
//     }

//     // Ajouter le dernier chunk s'il reste du texte
//     if (currentChunk.length > 0) {
//         chunks.push(currentChunk);
//     }

//     return chunks;
// }

// // Route API pour envoyer des messages avec streaming simulé pour Gemini
// app.post('/api/chat', async (req, res) => {
//     try {
//         const { message, conversation } = req.body;

//         // Vérifier si le message contient une requête de recherche de produit
//         const productQuery = extractProductQuery(message);
//         let catalogInfo = null;

//         if (productQuery) {
//             const searchResults = searchProductsInCatalog(productQuery);
//             if (searchResults.success && searchResults.products.length > 0) {
//                 catalogInfo = formatSearchResults(searchResults, productQuery);
//                 console.log(`Requête de catalogue détectée: "${productQuery}"`);
//             }
//         }

//         // Messages système pour contrôler les réponses
//         const systemMessage = {
//             role: "system",
//             content: `Ты Twowin AI, интеллектуальный помощник для компании Twowin (https://twowin.ru/), онлайн-магазина строительных материалов и инструментов в России. Отвечай на вопросы сотрудников о товарах, инструментах, строительных материалах, сантехнике, электротоварах и других товарах для ремонта и строительства. Используй соответствующую терминологию отрасли. Если не знаешь точного ответа о конкретном товаре, предложи сотруднику проверить онлайн-каталог. Отвечай на русском языке.${productCatalog.length > 0 ?
//                 `\n\nУ тебя есть доступ к каталогу с ${productCatalog.length} товарами. Когда тебя спрашивают о конкретных товарах, рекомендуй проверить каталог.` :
//                 ""
//                 }`
//         };

//         // Si on a une info catalogue, on l'ajoute comme contexte
//         const userMessageWithContext = catalogInfo ?
//             { role: 'user', content: `${message}\n\nИнформация из каталога:\n${catalogInfo}` } :
//             { role: 'user', content: message };

//         // Préparer les messages pour l'API
//         const messages = [
//             systemMessage,
//             ...conversation,
//             userMessageWithContext
//         ];

//         // Configuration pour le streaming
//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');

//         // Ajouter les résultats du catalogue au début si disponibles
//         let fullResponse = "";
//         if (catalogInfo) {
//             fullResponse = catalogInfo + "\n\n";
//             res.write(`data: ${JSON.stringify({ content: catalogInfo + "\n\n" })}\n\n`);
//         }

//         try {
//             // Appel à l'API Gemini
//             const geminiResponse = await callGeminiAPI(messages);

//             // Simuler le streaming de la réponse
//             const chunks = simulateStreamResponse(geminiResponse);

//             // Envoyer les chunks un par un avec un délai pour simuler un streaming
//             for (const chunk of chunks) {
//                 fullResponse += chunk;
//                 res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
//                 // Petit délai entre les chunks pour simuler un streaming (optionnel)
//                 await new Promise(resolve => setTimeout(resolve, 50));
//             }

//             // Envoyer l'événement de fin
//             res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
//             res.end();

//         } catch (error) {
//             console.error('Erreur lors de la communication avec l\'API Gemini:', error.message);
//             res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la communication avec le modèle' })}\n\n`);
//             res.end();
//         }

//     } catch (error) {
//         console.error('Erreur lors du traitement de la requête:', error.message);
//         res.write(`data: ${JSON.stringify({ error: 'Erreur lors du traitement de la requête' })}\n\n`);
//         res.end();
//     }
// });

// // Démarrer le serveur
// const server = http.createServer(app);

// // Initialiser le catalogue avant de démarrer le serveur
// initCatalog().then(() => {
//     server.listen(PORT, '0.0.0.0', () => {
//         console.log(`Serveur chatbot démarré sur http://localhost:${PORT}`);
//         console.log(`Utilisation du modèle Gemini: ${GEMINI_MODEL_NAME}`);
//         if (productCatalog.length > 0) {
//             console.log(`Catalogue chargé avec ${productCatalog.length} produits`);
//         } else {
//             console.log('Aucun catalogue chargé.');
//         }
//     });
// }).catch(err => {
//     console.error('Erreur lors de l\'initialisation du catalogue:', err);
//     // Démarrer le serveur même en cas d'échec du chargement du catalogue
//     server.listen(PORT, '0.0.0.0', () => {
//         console.log(`Serveur chatbot démarré sur http://localhost:${PORT} (sans catalogue)`);
//         console.log(`Utilisation du modèle Gemini: ${GEMINI_MODEL_NAME}`);
//     });
// });

// // Fonction pour rafraîchir le catalogue périodiquement (toutes les 12 heures)
// const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 heures en millisecondes
// setInterval(async () => {
//     console.log('Actualisation périodique du catalogue...');
//     try {
//         const newCatalog = await loadCatalogFromWebasyst();
//         if (newCatalog && newCatalog.length > 0) {
//             productCatalog = newCatalog;
//             catalogLastUpdated = new Date();
//             console.log(`Catalogue actualisé avec ${productCatalog.length} produits`);
//         }
//     } catch (error) {
//         console.error('Échec de l\'actualisation périodique du catalogue:', error);
//     }
// }, REFRESH_INTERVAL);


// server.js - Code serveur complet amélioré

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration de l'environnement
dotenv.config();

// Conversion __dirname et __filename pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Variables d'environnement pour l'API Webasyst
const WEBASYST_TOKEN = process.env.WEBASYST_TOKEN || '88938af231cc0e5f365d552646ce51ad';
const WEBASYST_ENDPOINT = process.env.WEBASYST_ENDPOINT || 'https://twowin.ru/api.php';

// Configuration de l'API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'VOTRE_CLÉ_API_GEMINI';
const GEMINI_MODEL_NAME = 'gemini-1.5-flash'; // Utiliser le modèle gemini-1.5-flash

// Initialisation de l'API Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

// Variable globale pour stocker le catalogue
let productCatalog = [];
let catalogLastUpdated = null;

// Configuration de base
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fonction de mappage des champs Webasyst vers notre format
function mapWebasystProductToOurFormat(webasystProduct) {
    // Pour le premier produit uniquement, afficher la structure complète pour debug
    if (!mapWebasystProductToOurFormat.hasLoggedExampleProduct) {
        console.log("Exemple complet d'un produit Webasyst:", JSON.stringify(webasystProduct, null, 2));
        mapWebasystProductToOurFormat.hasLoggedExampleProduct = true;
    }

    // Extraire le contenu HTML de la description (si besoin)
    let cleanDescription = webasystProduct.description || '';
    if (cleanDescription && cleanDescription.includes('<')) {
        // Option simple: supprimer toutes les balises HTML
        cleanDescription = cleanDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Récupérer le numéro d'article (SKU) à partir de l'objet skus
    let articleSku = '';
    if (webasystProduct.skus && typeof webasystProduct.skus === 'object') {
        // Obtenir le premier SKU
        const firstSkuId = Object.keys(webasystProduct.skus)[0];
        if (firstSkuId && webasystProduct.skus[firstSkuId]) {
            // Récupérer directement la propriété "sku" de l'objet SKU
            articleSku = webasystProduct.skus[firstSkuId].sku || '';
        }
    }

    // Mappage des champs
    return {
        'Наименование': webasystProduct.name || 'Товар без названия',
        'Артикул': articleSku || '', // Utiliser uniquement le SKU extrait de l'objet skus
        'Цена': webasystProduct.price?.toString() || '',
        'Наличие': parseFloat(webasystProduct.count) > 0 ? 'да' : 'нет',
        'Категория': webasystProduct.category_id ? `Категория ${webasystProduct.category_id}` : '',
        'Описание': cleanDescription,
        'Краткое описание': webasystProduct.summary || '',
        // Ajouter des champs supplémentaires qui peuvent être utiles
        'Производитель': webasystProduct.vendor || '',  // Ajout du champ fabricant s'il existe
        'ID товара': webasystProduct.id?.toString() || '',
        'Единица измерения': webasystProduct.stock_unit_id || '',
        'Валюта': webasystProduct.currency || 'RUB',
        'URL товара': webasystProduct.url ? `https://twowin.ru/product/${webasystProduct.url}` : '',
        'Статус': webasystProduct.status === '1' ? 'Активен' : 'Неактивен'
    };
}

// Chargement du catalogue depuis l'API Webasyst
async function loadCatalogFromWebasyst() {
    try {
        console.log("Tentative de chargement du catalogue depuis l'API Webasyst...");

        // Utiliser l'endpoint de recherche avec le paramètre fields pour inclure les skus
        const apiUrl = `${WEBASYST_ENDPOINT}/shop.product.search`;

        // Paramètres initiaux pour comprendre la pagination
        const initialResponse = await axios.get(apiUrl, {
            params: {
                access_token: WEBASYST_TOKEN,
                format: 'json',
                limit: 1,
                fields: '*,skus' // Inclure les skus dans la réponse
            }
        });

        // Afficher la structure initiale pour debug
        console.log("Structure de la réponse initiale de l'API:", JSON.stringify(initialResponse.data, null, 2));

        // Déterminer le nombre total de produits à récupérer
        const totalCount = initialResponse.data.count || 1000; // valeur par défaut si count n'est pas disponible
        const pageSize = 100; // Nombre de produits par page
        let mappedProducts = [];

        // Récupérer tous les produits en plusieurs appels si nécessaire
        for (let offset = 0; offset < totalCount; offset += pageSize) {
            console.log(`Récupération des produits ${offset} à ${offset + pageSize}...`);

            const response = await axios.get(apiUrl, {
                params: {
                    access_token: WEBASYST_TOKEN,
                    format: 'json',
                    limit: pageSize,
                    offset: offset,
                    fields: '*,skus' // Inclure les skus dans la réponse
                }
            });

            // Afficher la structure du premier lot pour debug
            if (offset === 0) {
                console.log("Exemple d'un produit:", JSON.stringify(response.data.products?.[0] || {}, null, 2));
            }

            // Récupérer les produits
            const products = response.data.products || [];


            if (Array.isArray(products) && products.length > 0) {
                console.log(`${products.length} produits récupérés dans ce lot`);

                // Mapper chaque produit au format attendu
                const mappedBatch = products.map(product => mapWebasystProductToOurFormat(product));
                mappedProducts = [...mappedProducts, ...mappedBatch];
            } else {
                console.log("Pas de produits dans ce lot ou format de réponse inattendu.");
                if (!Array.isArray(products)) {
                    console.error("Format de réponse inattendu:", response.data);
                }
                break;
            }

            // Si moins de produits que prévu sont retournés, nous avons terminé
            if (products.length < pageSize) break;
        }

        console.log(`Catalogue chargé avec succès: ${mappedProducts.length} produits trouvés`);
        return mappedProducts;

    } catch (error) {
        console.error("Erreur lors du chargement du catalogue depuis l'API Webasyst:", error.message);
        if (error.response) {
            console.error("Détails de l'erreur:", error.response.data);
        }
        return [];
    }
}

// Charger le catalogue au démarrage
async function initCatalog() {
    try {
        productCatalog = await loadCatalogFromWebasyst();
        catalogLastUpdated = new Date();

        // Afficher quelques informations utiles sur le catalogue
        if (productCatalog && productCatalog.length > 0) {
            console.log('Catalogue chargé avec succès au démarrage');
            console.log(`Nombre total de produits: ${productCatalog.length}`);

            // Compter les produits en stock
            const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
            console.log(`Produits en stock: ${inStockCount}`);

            // Lister quelques catégories si disponibles
            const categories = {};
            productCatalog.forEach(p => {
                if (p['Категория'] && !categories[p['Категория']]) {
                    categories[p['Категория']] = 1;
                } else if (p['Категория']) {
                    categories[p['Категория']]++;
                }
            });

            const categoryCount = Object.keys(categories).length;
            console.log(`Nombre de catégories: ${categoryCount}`);

            if (categoryCount > 0) {
                console.log('Exemples de catégories:');
                Object.entries(categories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .forEach(([cat, count]) => {
                        console.log(`- ${cat}: ${count} produits`);
                    });
            }
        } else {
            console.log('Catalogue chargé, mais aucun produit trouvé');
        }
    } catch (err) {
        console.error('Échec du chargement du catalogue:', err);
        productCatalog = []; // Initialiser avec un tableau vide en cas d'échec
    }
}

// Fonction pour rechercher des produits dans le catalogue
function searchProductsInCatalog(query, limit = 3) {
    if (!productCatalog || productCatalog.length === 0) {
        return { success: false, message: 'Catalogue non disponible' };
    }

    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);
    if (keywords.length === 0) {
        return { success: false, message: 'Requête trop courte' };
    }

    // Fonction de score pour la pertinence
    function calculateScore(product) {
        let score = 0;
        const productName = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
        const productDesc = product['Описание'] ? product['Описание'].toLowerCase() : '';
        const productCat = product['Категория'] ? product['Категория'].toLowerCase() : '';
        const productCode = product['Артикул'] ? product['Артикул'].toLowerCase() : '';
        const vendor = product['Производитель'] ? product['Производитель'].toLowerCase() : '';

        keywords.forEach(keyword => {
            // Points pour le nom du produit (plus important)
            if (productName.includes(keyword)) {
                score += 10;
                if (productName.startsWith(keyword)) score += 5;
            }

            // Points pour la description
            if (productDesc && productDesc.includes(keyword)) score += 3;

            // Points pour la catégorie
            if (productCat && productCat.includes(keyword)) score += 5;

            // Points pour l'article (référence exacte)
            if (productCode && productCode.includes(keyword)) score += 15;

            // Points pour le fabricant
            if (vendor && vendor.includes(keyword)) score += 8;
        });

        return score;
    }

    // Recherche et tri des résultats
    const results = productCatalog
        .map(product => ({ product, score: calculateScore(product) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product);

    return {
        success: true,
        products: results,
        count: results.length,
        totalProducts: productCatalog.length,
        lastUpdated: catalogLastUpdated
    };
}

// Vérifier si un produit est en stock basé sur son champ "Наличие"
function isProductInStock(product) {
    if (!product.hasOwnProperty('Наличие')) return false;

    const stockValue = product['Наличие'].toLowerCase();
    return stockValue.includes('да') ||
        stockValue.includes('есть') ||
        stockValue.includes('в наличии') ||
        stockValue === '1' ||
        stockValue === 'true';
}

// Fonction pour extraire une requête de recherche d'un message
function extractProductQuery(message) {
    // Pour les requêtes directes d'article
    const articleMatch = message.match(/артикул[:\s]+([A-Za-z0-9-]+)/i) ||
        message.match(/товар[:\s]+([A-Za-z0-9-]+)/i) ||
        message.match(/код[:\s]+([A-Za-z0-9-]+)/i);
    if (articleMatch && articleMatch[1]) {
        return articleMatch[1].trim();
    }

    // Expressions courantes pour rechercher des produits
    const searchPatterns = [
        /найти (?:товар|продукт)[ы]? (.*?)(?:\?|$)/i,
        /найди (.*?) в каталоге/i,
        /поиск[ать]? (.*?)(?:\?|$)/i,
        /информация о (.*?)(?:\?|$)/i,
        /что такое (.*?)(?:\?|$)/i,
        /(?:стоимость|цена) (.*?)(?:\?|$)/i,
        /сколько стоит (.*?)(?:\?|$)/i
    ];
    for (const pattern of searchPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    // Si pas de pattern spécifique mais contient des mots clés de recherche
    const searchKeywords = ['найти', 'поиск', 'каталог', 'товар', 'продукт', 'артикул', 'цена', 'стоимость'];
    if (searchKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        for (const keyword of searchKeywords) {
            const keywordIndex = message.toLowerCase().indexOf(keyword);
            if (keywordIndex !== -1) {
                const potentialQuery = message.slice(keywordIndex + keyword.length).trim();
                if (potentialQuery.length > 2) {
                    return potentialQuery.replace(/^\s*[:-]\s*/, '').replace(/[?!.,;]$/, '');
                }
            }
        }
    }

    return null; // Pas une requête de recherche
}

// Fonction pour formatter les résultats de recherche en texte
function formatSearchResults(results, query) {
    if (!results.success) return null;

    if (results.products.length === 0) {
        return `К сожалению, по запросу "${query}" ничего не найдено в каталоге.`;
    }

    let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

    results.products.forEach((product, index) => {
        response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

        // Prix (mise en évidence rouge)
        if (product['Цена']) {
            response += `💰 <span style="color:red;font-weight:bold;">Цена: ${product['Цена']} руб.</span>\n`;
        }

        // Catégorie
        if (product['Категория']) {
            response += `📂 Категория: ${product['Категория']}\n`;
        }

        // ---- Артикул cliquable ----
        if (product['Артикул']) {
            const art = product['Артикул'];
            response += `📝 Артикул: <a href="#" class="insert-artikul" data-artikul="${art}">${art}</a>\n`;
        }

        // Fabricant s'il existe
        if (product['Производитель']) {
            response += `🏭 Производитель: ${product['Производитель']}\n`;
        }

        // Description courte
        if (product['Краткое описание']) {
            response += `📄 ${product['Краткое описание']}\n`;
        }

        // Disponibilité
        if (product.hasOwnProperty('Наличие')) {
            const inStock = isProductInStock(product);
            response += `${inStock ? '✅ В наличии' : '❌ Нет в наличии'}\n`;
        }

        response += '\n';
    });

    return response;
}

// Route principale pour servir l'interface HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API pour obtenir tous les produits (avec pagination)
app.get('/api/products', (req, res) => {
    if (!productCatalog || productCatalog.length === 0) {
        return res.json({
            success: false,
            message: 'Catalogue non disponible'
        });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000000;
    const search = req.query.search || '';

    let filteredProducts = productCatalog;

    // Filtre de recherche
    if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = productCatalog.filter(product => {
            const name = product['Наименование'] ? product['Наименование'].toLowerCase() : '';
            const cat = product['Категория'] ? product['Категория'].toLowerCase() : '';
            const code = product['Артикул'] ? product['Артикул'].toLowerCase() : '';
            const vendor = product['Производитель'] ? product['Производитель'].toLowerCase() : '';

            return name.includes(searchLower) ||
                cat.includes(searchLower) ||
                code.includes(searchLower) ||
                vendor.includes(searchLower);
        });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
        success: true,
        products: paginatedProducts,
        totalProducts: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        currentPage: page,
        categories: getCategoryList(),
        lastUpdated: catalogLastUpdated
    });
});

// Obtenir la liste des catégories
function getCategoryList() {
    if (!productCatalog || productCatalog.length === 0) return [];

    const categories = {};

    productCatalog.forEach(product => {
        if (product['Категория']) {
            const category = product['Категория'];
            if (!categories[category]) {
                categories[category] = 1;
            } else {
                categories[category]++;
            }
        }
    });

    return Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

// API pour obtenir un produit spécifique par ID ou Артикул
app.get('/api/products/:id', (req, res) => {
    if (!productCatalog || productCatalog.length === 0) {
        return res.json({
            success: false,
            message: 'Catalogue non disponible'
        });
    }

    const id = req.params.id;

    // Recherche par index si c'est un nombre
    if (!isNaN(id) && parseInt(id) >= 0 && parseInt(id) < productCatalog.length) {
        return res.json({
            success: true,
            product: productCatalog[parseInt(id)]
        });
    }

    // Recherche par code article
    const product = productCatalog.find(p =>
        p['Артикул'] && p['Артикул'].toString().toLowerCase() === id.toLowerCase()
    );

    if (product) {
        return res.json({
            success: true,
            product: product
        });
    }

    res.json({
        success: false,
        message: 'Продукт не найден'
    });
});

// API pour obtenir les produits par catégorie
app.get('/api/categories/:category', (req, res) => {
    if (!productCatalog || productCatalog.length === 0) {
        return res.json({
            success: false,
            message: 'Catalogue non disponible'
        });
    }

    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000000;

    const filteredProducts = productCatalog.filter(product =>
        product['Категория'] && product['Категория'].toLowerCase() === category.toLowerCase()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
        success: true,
        category: category,
        products: paginatedProducts,
        totalProducts: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        currentPage: page
    });
});

// API pour obtenir les produits par fabricant
app.get('/api/manufacturers/:vendor', (req, res) => {
    if (!productCatalog || productCatalog.length === 0) {
        return res.json({
            success: false,
            message: 'Catalogue non disponible'
        });
    }

    const vendor = req.params.vendor;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000000;

    const filteredProducts = productCatalog.filter(product =>
        product['Производитель'] && product['Производитель'].toLowerCase() === vendor.toLowerCase()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
        success: true,
        vendor: vendor,
        products: paginatedProducts,
        totalProducts: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        currentPage: page
    });
});

// API pour chercher des produits par mots-clés
app.get('/api/search', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.json({
            success: false,
            message: 'Запрос поиска не предоставлен'
        });
    }

    const results = searchProductsInCatalog(query, 20); // Plus de résultats pour le frontend
    res.json(results);
});

// Fonction pour appeler l'API Gemini avec la bibliothèque officielle
async function callGeminiAPI(messages, temperature = 0.7) {
    try {
        // Préparer les messages pour Gemini
        const geminiMessages = [];

        // Convertir les messages au format Gemini
        for (const msg of messages) {
            if (msg.role === 'system') {
                // Ajouter le message système en tant que directive utilisateur
                geminiMessages.push({
                    role: 'user',
                    parts: [{ text: `[System Instruction] ${msg.content}` }]
                });

                // Ajouter une réponse modèle fictive confirmant la compréhension
                geminiMessages.push({
                    role: 'model',
                    parts: [{ text: 'Je comprends les instructions du système.' }]
                });
            } else if (msg.role === 'user') {
                geminiMessages.push({
                    role: 'user',
                    parts: [{ text: msg.content }]
                });
            } else if (msg.role === 'assistant') {
                geminiMessages.push({
                    role: 'model',
                    parts: [{ text: msg.content }]
                });
            }
        }

        // Configuration du modèle
        const generationConfig = {
            temperature: temperature,
            maxOutputTokens: 2048,
        };

        // Créer une instance de chat
        const chat = geminiModel.startChat({
            generationConfig,
            history: geminiMessages.slice(0, -1) // Exclure le dernier message utilisateur pour l'envoyer séparément
        });

        // Envoyer le dernier message utilisateur et obtenir la réponse
        const lastUserMessage = geminiMessages[geminiMessages.length - 1];
        const result = await chat.sendMessage(lastUserMessage.parts[0].text);

        // Retourner le texte de la réponse
        return result.response.text();
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
        throw error;
    }
}

// Fonction pour simuler le streaming d'une réponse
function simulateStreamResponse(text) {
    // Découper la réponse en petits morceaux pour simuler un streaming
    const tokens = text.split(/(\s+|\.|,|!|\?|:)/g).filter(Boolean);
    const chunks = [];
    let currentChunk = '';

    for (const token of tokens) {
        currentChunk += token;
        // Envoyer des chunks de taille variable (1-5 tokens)
        if (currentChunk.length > 0 && Math.random() < 0.2) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
    }

    // Ajouter le dernier chunk s'il reste du texte
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

// Route API pour envoyer des messages avec streaming simulé pour Gemini
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversation } = req.body;

        // Vérifier si le message contient une requête de recherche de produit
        const productQuery = extractProductQuery(message);
        let catalogInfo = null;

        // Si le message commence par @, ne pas traiter avec Gemini
        if (message.startsWith('@')) {
            return res.status(400).json({
                success: false,
                message: 'Les messages commençant par @ doivent être traités côté client'
            });
        }

        if (productQuery) {
            const searchResults = searchProductsInCatalog(productQuery);
            if (searchResults.success && searchResults.products.length > 0) {
                catalogInfo = formatSearchResults(searchResults, productQuery);
                console.log(`Requête de catalogue détectée: "${productQuery}"`);
            }
        }

        // Messages système pour contrôler les réponses
        const systemMessage = {
            role: "system",
            content: `Ты Twowin AI, интеллектуальный помощник для компании Twowin (https://twowin.ru/), онлайн-магазина строительных материалов и инструментов в России. Отвечай на вопросы сотрудников о товарах, инструментах, строительных материалах, сантехнике, электротоварах и других товарах для ремонта и строительства. Используй соответствующую терминологию отрасли. Если не знаешь точного ответа о конкретном товаре, предложи сотруднику проверить онлайн-каталог. ОБЯЗАТЕЛЬНО УКАЖИ ЦЕНУ ТОВАРА И ДЕЛАЙ АКЦЕНТ НА ЦЕНАх. Отвечай на русском языке.${productCatalog.length > 0 ?
                `\n\nУ тебя есть доступ к каталогу с ${productCatalog.length} товарами. Когда тебя спрашивают о конкретных товарах, рекомендуй проверить каталог. Если знаешь цену товара, обязательно укажи ее в ответе.` :
                ""
                }`
        };

        // Si on a une info catalogue, on l'ajoute comme contexte
        const userMessageWithContext = catalogInfo ?
            { role: 'user', content: `${message}\n\nИнформация из каталога:\n${catalogInfo}` } :
            { role: 'user', content: message };

        // Préparer les messages pour l'API
        const messages = [
            systemMessage,
            ...conversation,
            userMessageWithContext
        ];

        // Configuration pour le streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Ajouter les résultats du catalogue au début si disponibles
        let fullResponse = "";
        if (catalogInfo) {
            fullResponse = catalogInfo + "\n\n";
            res.write(`data: ${JSON.stringify({ content: catalogInfo + "\n\n" })}\n\n`);
        }

        try {
            // Appel à l'API Gemini
            const geminiResponse = await callGeminiAPI(messages);

            // Simuler le streaming de la réponse
            const chunks = simulateStreamResponse(geminiResponse);

            // Envoyer les chunks un par un avec un délai pour simuler un streaming
            for (const chunk of chunks) {
                fullResponse += chunk;
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                // Petit délai entre les chunks pour simuler un streaming (optionnel)
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Envoyer l'événement de fin
            res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
            res.end();

        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API Gemini:', error.message);
            res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la communication avec le modèle' })}\n\n`);
            res.end();
        }

    } catch (error) {
        console.error('Erreur lors du traitement de la requête:', error.message);
        res.write(`data: ${JSON.stringify({ error: 'Erreur lors du traitement de la requête' })}\n\n`);
        res.end();
    }
});

// Démarrer le serveur
const server = http.createServer(app);

// Initialiser le catalogue avant de démarrer le serveur
initCatalog().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Serveur chatbot démarré sur http://localhost:${PORT}`);
        console.log(`Utilisation du modèle Gemini: ${GEMINI_MODEL_NAME}`);
        if (productCatalog.length > 0) {
            console.log(`Catalogue chargé avec ${productCatalog.length} produits`);
        } else {
            console.log('Aucun catalogue chargé.');
        }
    });
}).catch(err => {
    console.error('Erreur lors de l\'initialisation du catalogue:', err);
    // Démarrer le serveur même en cas d'échec du chargement du catalogue
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Serveur chatbot démarré sur http://localhost:${PORT} (sans catalogue)`);
        console.log(`Utilisation du modèle Gemini: ${GEMINI_MODEL_NAME}`);
    });
});

// Fonction pour rafraîchir le catalogue périodiquement (toutes les 12 heures)
const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 heures en millisecondes
setInterval(async () => {
    console.log('Actualisation périodique du catalogue...');
    try {
        const newCatalog = await loadCatalogFromWebasyst();
        if (newCatalog && newCatalog.length > 0) {
            productCatalog = newCatalog;
            catalogLastUpdated = new Date();
            console.log(`Catalogue actualisé avec ${productCatalog.length} produits`);
        }
    } catch (error) {
        console.error('Échec de l\'actualisation périodique du catalogue:', error);
    }
}, REFRESH_INTERVAL);