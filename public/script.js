// // document.addEventListener('DOMContentLoaded', function () {
// //     // Éléments du DOM - Chat
// //     const chatMessages = document.getElementById('chat-messages');
// //     const userInput = document.getElementById('user-input');
// //     const sendButton = document.getElementById('send-button');
// //     const typingIndicator = document.getElementById('typing-indicator');
// //     const suggestionChips = document.querySelectorAll('.suggestion-chip');

// //     // Éléments du DOM - Catalogue
// //     const catalogSidebar = document.getElementById('catalog-sidebar');
// //     const showCatalogBtn = document.getElementById('show-catalog-btn');
// //     const closeSidebarBtn = document.getElementById('close-sidebar');
// //     const catalogSearch = document.getElementById('catalog-search');
// //     const productList = document.getElementById('product-list');
// //     const catalogPagination = document.getElementById('catalog-pagination');
// //     const catalogStats = document.getElementById('catalog-stats');
// //     const resizeHandle = document.getElementById('resize-handle');

// //     // Éléments du DOM - Détail produit
// //     const productDetailModal = document.getElementById('product-detail-modal');
// //     const closeProductDetailBtn = document.getElementById('close-product-detail');
// //     const productDetailTitle = document.getElementById('product-detail-title');
// //     const productDetailPrice = document.getElementById('product-detail-price');
// //     const productDetailStock = document.getElementById('product-detail-stock');
// //     const productDetailCode = document.getElementById('product-detail-code');
// //     const productDetailCategory = document.getElementById('product-detail-category');
// //     const productDetailDescription = document.getElementById('product-detail-description');
// //     const addProductToChatBtn = document.getElementById('add-product-to-chat');

// //     // Variables globales
// //     let conversation = [
// //         { role: "assistant", content: "Добро пожаловать! Я Twowin AI - ваш интеллектуальный помощник по вопросам строительства, ремонта и выбора инструментов. Задайте мне вопрос о товарах из нашего каталога, и я постараюсь помочь вам." }
// //     ];
// //     let productCatalog = [];
// //     let filteredProducts = [];
// //     let currentPage = 1;
// //     let itemsPerPage = 8;
// //     let selectedProduct = null;
// //     let searchTimeout = null;

// //     // Initialisation
// //     fetchCatalog();

// //     // ---------- FONCTIONS DE CHAT ----------

// //     // Fonction pour ajouter un message à l'interface
// //     function addMessage(content, isUser = false) {
// //         const messageDiv = document.createElement('div');
// //         messageDiv.classList.add('message');

// //         if (isUser) {
// //             messageDiv.classList.add('user-message');
// //             const roleDiv = document.createElement('div');
// //             roleDiv.classList.add('message-role');
// //             roleDiv.textContent = 'Вы';
// //             messageDiv.appendChild(roleDiv);
// //             conversation.push({ role: "user", content: content });
// //         } else {
// //             messageDiv.classList.add('bot-message');
// //             const roleDiv = document.createElement('div');
// //             roleDiv.classList.add('message-role');
// //             roleDiv.textContent = 'Twowin AI';
// //             messageDiv.appendChild(roleDiv);

// //             // Ne pas ajouter à la conversation ici - on le fait ailleurs
// //         }

// //         const contentDiv = document.createElement('div');
// //         contentDiv.classList.add('message-content');

// //         // Formatage du contenu
// //         let formattedContent = content;

// //         // Détection des informations de catalogue (commence par "По запросу" suivi d'un résultat)
// //         if (!isUser && formattedContent.includes('По запросу') && formattedContent.includes('найдено')) {
// //             const catalogParts = formattedContent.split(/\n\n(.+)$/s);
// //             if (catalogParts.length > 1) {
// //                 // Séparer les infos catalogue et la réponse
// //                 const catalogInfo = catalogParts[0];
// //                 const restOfResponse = catalogParts[1];

// //                 // Créer une div pour les infos catalogue
// //                 const catalogDiv = document.createElement('div');
// //                 catalogDiv.className = 'catalog-info';
// //                 catalogDiv.innerHTML = formatCatalogInfo(catalogInfo);
// //                 messageDiv.appendChild(catalogDiv);

// //                 // Mettre à jour le contenu formaté avec le reste de la réponse
// //                 formattedContent = restOfResponse;
// //             }
// //         }

// //         // Format général du markdown et des codes
// //         formattedContent = formatMarkdown(formattedContent);

// //         contentDiv.innerHTML = formattedContent;
// //         messageDiv.appendChild(contentDiv);

// //         // Ajouter des suggestions si c'est un message du bot
// //         if (!isUser) {
// //             // Ajouter la conversation après avoir traité le message
// //             conversation.push({ role: "assistant", content: content });

// //             // Ajouter des suggestions pertinentes
// //             addSuggestions(messageDiv, content);
// //         }

// //         chatMessages.appendChild(messageDiv);
// //         chatMessages.scrollTop = chatMessages.scrollHeight;
// //     }

// //     // Fonction pour formater le texte markdown
// //     function formatMarkdown(text) {
// //         // Convertir les blocs de code
// //         text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, function (match, language, code) {
// //             return `<pre><code>${code}</code></pre>`;
// //         });

// //         // Convertir les titres
// //         text = text.replace(/### (.*)/g, '<h3>$1</h3>');
// //         text = text.replace(/## (.*)/g, '<h2>$1</h2>');
// //         text = text.replace(/# (.*)/g, '<h1>$1</h1>');

// //         // Convertir les listes
// //         text = text.replace(/^\* (.*)/gm, '<li>$1</li>');
// //         text = text.replace(/^\d+\. (.*)/gm, '<li>$1</li>');

// //         // Convertir les gras et italiques
// //         text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
// //         text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
// //         text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
// //         text = text.replace(/_(.*?)_/g, '<em>$1</em>');

// //         // Convertir les liens
// //         text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

// //         // Convertir les sauts de ligne
// //         text = text.replace(/\n/g, '<br>');

// //         return text;
// //     }

// //     // Fonction pour formater les informations de catalogue
// //     function formatCatalogInfo(text) {
// //         // Ajouter un badge "Из каталога"
// //         let formatted = '<div class="catalog-badge">Из каталога</div>';

// //         // Remplacer le titre initial
// //         formatted += text.replace(/По запросу "(.*?)" найдено (.*?) товаров:/g, '<strong>По запросу "$1" найдено $2 товаров:</strong>');

// //         // Formater les produits trouvés
// //         const productRegex = /\*\*([\d]+\. .*?)\*\*([\s\S]*?)(?=\*\*[\d]+\.|$)/g;
// //         formatted = formatted.replace(productRegex, function (match, productName, details) {
// //             return `<div class="product-card">
// //                 <div class="product-name">${productName.replace(/\*\*/g, '')}</div>
// //                 <div class="product-details">${details}</div>
// //             </div>`;
// //         });

// //         return formatted;
// //     }

// //     // Fonction pour ajouter des suggestions basées sur le contenu
// //     function addSuggestions(messageElement, content) {
// //         // Analyse du contenu pour déterminer les suggestions pertinentes
// //         const suggestionsDiv = document.createElement('div');
// //         suggestionsDiv.className = 'suggestion-chips';

// //         // Suggestions basées sur le contenu du message
// //         let suggestions = [];

// //         // Si on a des informations de catalogue
// //         if (content.includes('По запросу') && content.includes('найдено')) {
// //             // Suggérer des questions de suivi sur le produit
// //             suggestions.push({
// //                 text: 'Подробнее о первом товаре',
// //                 query: 'Расскажи подробнее о первом товаре в результатах'
// //             });

// //             // Suggérer une recherche similaire
// //             const queryMatch = content.match(/По запросу "(.*?)"/);
// //             if (queryMatch && queryMatch[1]) {
// //                 const originalQuery = queryMatch[1];
// //                 suggestions.push({
// //                     text: 'Похожие товары',
// //                     query: `Найди похожие товары на ${originalQuery}`
// //                 });
// //             }
// //         }

// //         // Ajouter des suggestions générales si on n'a pas assez de suggestions spécifiques
// //         if (suggestions.length < 2) {
// //             if (!content.includes('цен')) {
// //                 suggestions.push({
// //                     text: 'Узнать цены',
// //                     query: 'Какие цены на самые популярные товары?'
// //                 });
// //             }

// //             if (!content.includes('катал')) {
// //                 suggestions.push({
// //                     text: 'Каталог товаров',
// //                     query: 'Покажи категории товаров в каталоге'
// //                 });
// //             }

// //             if (!content.includes('акци')) {
// //                 suggestions.push({
// //                     text: 'Текущие акции',
// //                     query: 'Какие акции сейчас действуют?'
// //                 });
// //             }
// //         }

// //         // Limiter à 3 suggestions
// //         suggestions = suggestions.slice(0, 3);

// //         // N'ajouter la div de suggestions que si on a des suggestions
// //         if (suggestions.length > 0) {
// //             suggestions.forEach(suggestion => {
// //                 const chip = document.createElement('div');
// //                 chip.className = 'suggestion-chip';
// //                 chip.textContent = suggestion.text;
// //                 chip.dataset.query = suggestion.query;
// //                 chip.addEventListener('click', function () {
// //                     userInput.value = this.dataset.query;
// //                     sendButton.click();
// //                 });
// //                 suggestionsDiv.appendChild(chip);
// //             });

// //             messageElement.appendChild(suggestionsDiv);
// //         }
// //     }

// //     // Créer un nouvel élément de message bot pour le streaming
// //     function createBotMessageElement() {
// //         const messageDiv = document.createElement('div');
// //         messageDiv.classList.add('message', 'bot-message');

// //         const roleDiv = document.createElement('div');
// //         roleDiv.classList.add('message-role');
// //         roleDiv.textContent = 'Twowin AI';
// //         messageDiv.appendChild(roleDiv);

// //         const contentDiv = document.createElement('div');
// //         contentDiv.classList.add('message-content');
// //         messageDiv.appendChild(contentDiv);

// //         chatMessages.appendChild(messageDiv);
// //         return { messageDiv, contentDiv };
// //     }

// //     // Fonction pour envoyer le message avec fetch et SSE
// //     async function sendMessageWithSSE(message) {
// //         typingIndicator.style.display = 'block';

// //         try {
// //             const response = await fetch('/api/chat', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({
// //                     message: message,
// //                     conversation: conversation
// //                 })
// //             });

// //             if (!response.ok) {
// //                 throw new Error(`Ошибка HTTP: ${response.status}`);
// //             }

// //             const reader = response.body.getReader();
// //             const decoder = new TextDecoder();
// //             let buffer = '';
// //             let responseContent = '';
// //             let catalogInfo = null;
// //             let botContent = null;
// //             let messageElements = null;

// //             typingIndicator.style.display = 'none';
// //             messageElements = createBotMessageElement();

// //             while (true) {
// //                 const { done, value } = await reader.read();

// //                 if (done) {
// //                     break;
// //                 }

// //                 buffer += decoder.decode(value, { stream: true });

// //                 const lines = buffer.split('\n\n');
// //                 buffer = lines.pop() || '';

// //                 for (const line of lines) {
// //                     if (line.startsWith('data: ')) {
// //                         try {
// //                             const data = JSON.parse(line.substring(6));

// //                             if (data.content) {
// //                                 // Si c'est le début et qu'il semble contenir des infos de catalogue
// //                                 if (responseContent === '' && data.content.includes('По запросу') && data.content.includes('найдено')) {
// //                                     catalogInfo = data.content;

// //                                     // Créer un div spécial pour les infos catalogue
// //                                     const catalogDiv = document.createElement('div');
// //                                     catalogDiv.className = 'catalog-info';
// //                                     catalogDiv.innerHTML = formatCatalogInfo(catalogInfo);
// //                                     messageElements.messageDiv.insertBefore(catalogDiv, messageElements.contentDiv);
// //                                 }
// //                                 // Si on a déjà détecté des infos catalogue, c'est la suite du message
// //                                 else if (catalogInfo && !botContent) {
// //                                     botContent = data.content;
// //                                     messageElements.contentDiv.innerHTML = formatMarkdown(botContent);
// //                                 }
// //                                 // Continuer à ajouter au contenu du bot
// //                                 else if (botContent) {
// //                                     botContent += data.content;
// //                                     messageElements.contentDiv.innerHTML = formatMarkdown(botContent);
// //                                 }
// //                                 // Sinon, c'est un message normal
// //                                 else {
// //                                     responseContent += data.content;
// //                                     messageElements.contentDiv.innerHTML = formatMarkdown(responseContent);
// //                                 }

// //                                 chatMessages.scrollTop = chatMessages.scrollHeight;
// //                             }

// //                             if (data.done) {
// //                                 // Construire le message complet pour l'historique
// //                                 let fullMessage = '';
// //                                 if (catalogInfo) {
// //                                     fullMessage = catalogInfo + "\n\n";
// //                                     if (botContent) {
// //                                         fullMessage += botContent;
// //                                     }
// //                                 } else {
// //                                     fullMessage = responseContent;
// //                                 }

// //                                 // Ajouter à la conversation
// //                                 conversation.push({ role: "assistant", content: fullMessage });

// //                                 // Ajouter des suggestions
// //                                 addSuggestions(messageElements.messageDiv, fullMessage);
// //                             }
// //                         } catch (error) {
// //                             console.error('Ошибка разбора JSON:', error, line);
// //                         }
// //                     }
// //                 }
// //             }

// //         } catch (error) {
// //             typingIndicator.style.display = 'none';
// //             addMessage("Извините, произошла ошибка при связи с сервером. Убедитесь, что LM Studio запущен.", false);
// //             console.error('Ошибка при коммуникации с сервером:', error);
// //         }
// //     }

// //     // ---------- FONCTIONS DE CATALOGUE ----------

// //     // Fonction pour charger le catalogue
// //     async function fetchCatalog() {
// //         try {
// //             productList.innerHTML = '<div class="product-item"><div class="product-item-name">Загрузка каталога...</div></div>';

// //             const response = await fetch('/api/products');

// //             if (!response.ok) {
// //                 throw new Error('Ошибка загрузки каталога');
// //             }

// //             const data = await response.json();

// //             if (data.success && data.products) {
// //                 productCatalog = data.products;
// //                 filteredProducts = [...productCatalog];
// //                 renderProductList();
// //                 updateCatalogStats();
// //             } else {
// //                 productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
// //             }
// //         } catch (error) {
// //             console.error('Ошибка загрузки каталога:', error);
// //             productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
// //             catalogStats.textContent = 'Не удалось загрузить каталог';
// //         }
// //     }

// //     // Fonction pour afficher les produits
// //     function renderProductList() {
// //         const startIndex = (currentPage - 1) * itemsPerPage;
// //         const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

// //         // Vider la liste
// //         productList.innerHTML = '';

// //         // Si aucun produit
// //         if (filteredProducts.length === 0) {
// //             productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ничего не найдено</div></div>';
// //             renderPagination();
// //             return;
// //         }

// //         // Ajouter les produits
// //         for (let i = startIndex; i < endIndex; i++) {
// //             const product = filteredProducts[i];
// //             const inStock = isProductInStock(product);

// //             const productElement = document.createElement('div');
// //             productElement.className = 'product-item';
// //             productElement.dataset.index = i;

// //             productElement.innerHTML = `
// //                 <div class="product-item-name">${product['Наименование'] || 'Без названия'}</div>
// //                 <div class="product-item-meta">
// //                     <div class="product-item-price">${product['Цена'] ? product['Цена'] + ' ₽' : 'Цена не указана'}</div>
// //                     <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
// //                 </div>
// //             `;

// //             productElement.addEventListener('click', function () {
// //                 showProductDetail(product);
// //             });

// //             productList.appendChild(productElement);
// //         }

// //         renderPagination();
// //     }

// //     // Fonction pour afficher la pagination
// //     function renderPagination() {
// //         catalogPagination.innerHTML = '';

// //         if (filteredProducts.length <= itemsPerPage) {
// //             return;
// //         }

// //         const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

// //         // Bouton page précédente
// //         const prevBtn = document.createElement('button');
// //         prevBtn.className = 'pagination-btn';
// //         prevBtn.textContent = '←';
// //         prevBtn.disabled = currentPage === 1;
// //         prevBtn.addEventListener('click', function () {
// //             if (currentPage > 1) {
// //                 currentPage--;
// //                 renderProductList();
// //             }
// //         });
// //         catalogPagination.appendChild(prevBtn);

// //         // Limiter le nombre de boutons de page
// //         let startPage = Math.max(1, currentPage - 2);
// //         let endPage = Math.min(totalPages, startPage + 4);

// //         if (endPage - startPage < 4) {
// //             startPage = Math.max(1, endPage - 4);
// //         }

// //         // Boutons des pages
// //         for (let i = startPage; i <= endPage; i++) {
// //             const pageBtn = document.createElement('button');
// //             pageBtn.className = 'pagination-btn';
// //             if (i === currentPage) {
// //                 pageBtn.classList.add('active');
// //             }
// //             pageBtn.textContent = i;
// //             pageBtn.addEventListener('click', function () {
// //                 currentPage = i;
// //                 renderProductList();
// //             });
// //             catalogPagination.appendChild(pageBtn);
// //         }

// //         // Bouton page suivante
// //         const nextBtn = document.createElement('button');
// //         nextBtn.className = 'pagination-btn';
// //         nextBtn.textContent = '→';
// //         nextBtn.disabled = currentPage === totalPages;
// //         nextBtn.addEventListener('click', function () {
// //             if (currentPage < totalPages) {
// //                 currentPage++;
// //                 renderProductList();
// //             }
// //         });
// //         catalogPagination.appendChild(nextBtn);
// //     }

// //     // Mettre à jour les statistiques du catalogue
// //     function updateCatalogStats() {
// //         if (productCatalog.length === 0) {
// //             catalogStats.textContent = 'Каталог пуст';
// //             return;
// //         }

// //         // Nombre de produits
// //         const totalProducts = productCatalog.length;

// //         // Nombre de produits en stock
// //         const inStockProducts = productCatalog.filter(product => isProductInStock(product)).length;

// //         // Catégories
// //         const categories = {};
// //         productCatalog.forEach(product => {
// //             if (product['Категория']) {
// //                 categories[product['Категория']] = (categories[product['Категория']] || 0) + 1;
// //             }
// //         });

// //         const categoriesCount = Object.keys(categories).length;

// //         catalogStats.textContent = `Всего товаров: ${totalProducts} | В наличии: ${inStockProducts} | Категорий: ${categoriesCount}`;
// //     }

// //     // Vérifier si un produit est en stock
// //     function isProductInStock(product) {
// //         if (!product.hasOwnProperty('Наличие')) return false;

// //         const stockValue = String(product['Наличие']).toLowerCase();
// //         return stockValue.includes('да') ||
// //             stockValue.includes('есть') ||
// //             stockValue.includes('в наличии') ||
// //             stockValue === '1' ||
// //             stockValue === 'true';
// //     }

// //     // Fonction pour montrer les détails d'un produit
// //     function showProductDetail(product) {
// //         selectedProduct = product;

// //         // Définir les données du produit
// //         productDetailTitle.textContent = product['Наименование'] || 'Название неизвестно';
// //         productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';

// //         // Stock
// //         const inStock = isProductInStock(product);
// //         productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
// //         productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';

// //         // Informations détaillées
// //         productDetailCode.textContent = product['Артикул'] || '-';
// //         productDetailCategory.textContent = product['Категория'] || '-';

// //         // Description
// //         if (product['Описание'] || product['Краткое описание']) {
// //             productDetailDescription.textContent = product['Описание'] || product['Краткое описание'];
// //             document.getElementById('product-detail-description-section').style.display = 'block';
// //         } else {
// //             document.getElementById('product-detail-description-section').style.display = 'none';
// //         }

// //         // Construire la table de détails dynamique
// //         const detailTable = document.getElementById('product-detail-table');

// //         // Vider et ajouter les bases (toujours garder Артикул et Категория)
// //         detailTable.innerHTML = `
// //             <tr>
// //                 <th>Артикул</th>
// //                 <td id="product-detail-code">${product['Артикул'] || '-'}</td>
// //             </tr>
// //             <tr>
// //                 <th>Категория</th>
// //                 <td id="product-detail-category">${product['Категория'] || '-'}</td>
// //             </tr>
// //         `;

// //         // Ajouter d'autres détails du produit si disponibles
// //         const excludeFields = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие'];

// //         Object.entries(product).forEach(([key, value]) => {
// //             if (!excludeFields.includes(key) && value) {
// //                 const row = document.createElement('tr');
// //                 row.innerHTML = `
// //                     <th>${key}</th>
// //                     <td>${value}</td>
// //                 `;
// //                 detailTable.appendChild(row);
// //             }
// //         });

// //         // Afficher le modal
// //         productDetailModal.style.display = 'flex';
// //     }

// //     // Fermer le modal de détail produit
// //     function closeProductDetail() {
// //         productDetailModal.style.display = 'none';
// //         selectedProduct = null;
// //     }

// //     // Ajouter le produit sélectionné au chat
// //     function addProductToChat() {
// //         if (!selectedProduct) return;

// //         const inStock = isProductInStock(selectedProduct);

// //         // Construire un message avec les détails du produit
// //         const productMessage = `Вот информация о товаре "${selectedProduct['Наименование']}":
// // - Артикул: ${selectedProduct['Артикул'] || 'не указан'}
// // - Цена: ${selectedProduct['Цена'] ? selectedProduct['Цена'] + ' ₽' : 'не указана'}
// // - Наличие: ${inStock ? 'В наличии' : 'Нет в наличии'}
// // - Категория: ${selectedProduct['Категория'] || 'не указана'}`;

// //         // Ajouter le message à la conversation
// //         addMessage(productMessage, false);

// //         // Fermer la modal
// //         closeProductDetail();

// //         // Fermer également le sidebar
// //         closeCatalogSidebar();
// //     }

// //     // Recherche de produits
// //     function searchProducts(query) {
// //         if (!query) {
// //             filteredProducts = [...productCatalog];
// //         } else {
// //             const searchTerm = query.toLowerCase();
// //             filteredProducts = productCatalog.filter(product => {
// //                 const name = (product['Наименование'] || '').toLowerCase();
// //                 const code = (product['Артикул'] || '').toLowerCase();
// //                 const category = (product['Категория'] || '').toLowerCase();
// //                 const description = (product['Описание'] || '').toLowerCase();

// //                 return name.includes(searchTerm) ||
// //                     code.includes(searchTerm) ||
// //                     category.includes(searchTerm) ||
// //                     description.includes(searchTerm);
// //             });
// //         }

// //         currentPage = 1;
// //         renderProductList();
// //     }

// //     // Ouvrir le sidebar du catalogue
// //     function openCatalogSidebar() {
// //         catalogSidebar.style.display = 'flex';

// //         // Assurez-vous que la liste des produits est à jour
// //         fetchCatalog();
// //     }

// //     // Fermer le sidebar du catalogue
// //     function closeCatalogSidebar() {
// //         catalogSidebar.style.display = 'none';
// //     }

// //     // ---------- EVENT LISTENERS ----------

// //     // Envoi de message
// //     sendButton.addEventListener('click', function () {
// //         if (userInput.value.trim() !== '') {
// //             const message = userInput.value;
// //             addMessage(message, true);
// //             userInput.value = '';
// //             sendMessageWithSSE(message);
// //         }
// //     });

// //     // Touche Entrée pour envoyer un message
// //     userInput.addEventListener('keypress', function (e) {
// //         if (e.key === 'Enter' && userInput.value.trim() !== '') {
// //             const message = userInput.value;
// //             addMessage(message, true);
// //             userInput.value = '';
// //             sendMessageWithSSE(message);
// //         }
// //     });

// //     // Chips de suggestion
// //     suggestionChips.forEach(chip => {
// //         chip.addEventListener('click', function () {
// //             userInput.value = this.dataset.query;
// //             sendButton.click();
// //         });
// //     });

// //     // Bouton pour afficher le catalogue
// //     showCatalogBtn.addEventListener('click', openCatalogSidebar);

// //     // Bouton pour fermer le catalogue
// //     closeSidebarBtn.addEventListener('click', closeCatalogSidebar);

// //     // Recherche dans le catalogue
// //     catalogSearch.addEventListener('input', function () {
// //         // Utiliser un timeout pour éviter trop de recherches rapprochées
// //         clearTimeout(searchTimeout);
// //         searchTimeout = setTimeout(() => {
// //             searchProducts(this.value);
// //         }, 300);
// //     });

// //     // Modal de détail produit
// //     closeProductDetailBtn.addEventListener('click', closeProductDetail);

// //     // Cliquer en dehors du modal pour le fermer
// //     productDetailModal.addEventListener('click', function (e) {
// //         if (e.target === productDetailModal) {
// //             closeProductDetail();
// //         }
// //     });

// //     // Ajouter le produit au chat
// //     addProductToChatBtn.addEventListener('click', addProductToChat);
// // });

//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr

// document.addEventListener('DOMContentLoaded', function () {
//     // ---------------------
//     // Éléments du DOM
//     // ---------------------
//     // Chat
//     const chatMessages = document.getElementById('chat-messages');
//     const userInput = document.getElementById('user-input');
//     const sendButton = document.getElementById('send-button');
//     const typingIndicator = document.getElementById('typing-indicator');
//     const suggestionChips = document.querySelectorAll('.suggestion-chip');

//     // Catalogue
//     const catalogSidebar = document.getElementById('catalog-sidebar');
//     const showCatalogBtn = document.getElementById('show-catalog-btn');
//     const closeSidebarBtn = document.getElementById('close-sidebar');
//     const catalogSearch = document.getElementById('catalog-search');
//     const productList = document.getElementById('product-list');
//     const catalogPagination = document.getElementById('catalog-pagination');
//     const catalogStats = document.getElementById('catalog-stats');
//     const resizeHandle = document.getElementById('resize-handle');

//     // Détail produit
//     const productDetailModal = document.getElementById('product-detail-modal');
//     const closeProductDetailBtn = document.getElementById('close-product-detail');
//     const productDetailTitle = document.getElementById('product-detail-title');
//     const productDetailPrice = document.getElementById('product-detail-price');
//     const productDetailStock = document.getElementById('product-detail-stock');
//     const productDetailCode = document.getElementById('product-detail-code');
//     const productDetailCategory = document.getElementById('product-detail-category');
//     const productDetailDescription = document.getElementById('product-detail-description');
//     const productDetailTable = document.getElementById('product-detail-table');
//     const addProductToChatBtn = document.getElementById('add-product-to-chat');
//     const prevProductBtn = document.getElementById('prev-product');
//     const nextProductBtn = document.getElementById('next-product');

//     // ---------------------
//     // Variables globales
//     // ---------------------
//     let conversation = [
//         { role: "assistant", content: "Добро пожаловать! Я Twowin AI - ваш интеллектуальный помощник по вопросам строительства, ремонта и выбора инструментов. Задайте мне вопрос о товарах из нашего каталога, и я постараюсь помочь вам." }
//     ];
//     let productCatalog = [];
//     let filteredProducts = [];
//     let currentPage = 1;
//     let itemsPerPage = 8;
//     let selectedProduct = null;
//     let searchTimeout = null;

//     // ---------------------
//     // Historique de produits
//     // ---------------------
//     let productHistory = [];
//     const MAX_HISTORY_ITEMS = 5;

//     function saveProductHistory() {
//         const simplified = productHistory.map(p => ({
//             'Наименование': p['Наименование'],
//             'Артикул': p['Артикул'],
//             'Цена': p['Цена'],
//             'Категория': p['Категория']
//         }));
//         localStorage.setItem('productHistory', JSON.stringify(simplified));
//     }

//     function loadProductHistory() {
//         const saved = localStorage.getItem('productHistory');
//         if (saved) {
//             try {
//                 productHistory = JSON.parse(saved);
//             } catch (e) {
//                 console.error('Erreur lors du chargement de l\'historique des produits', e);
//                 productHistory = [];
//             }
//         }
//     }

//     function addToProductHistory(product) {
//         const idx = productHistory.findIndex(p =>
//             (p['Артикул'] && product['Артикул'] === p['Артикул']) ||
//             (p['Наименование'] && product['Наименование'] === p['Наименование'])
//         );
//         if (idx !== -1) productHistory.splice(idx, 1);
//         productHistory.unshift(product);
//         if (productHistory.length > MAX_HISTORY_ITEMS) productHistory.pop();
//         saveProductHistory();
//     }

//     // ---------------------
//     // Initialisation
//     // ---------------------
//     loadProductHistory();
//     fetchCatalog();

//     // ---------------------
//     // Écouteurs d'événements
//     // ---------------------
//     // Chat: envoi
//     function handleSend() {
//         if (userInput.value.trim() === '') return;
//         const msg = userInput.value;
//         addMessage(msg, true);
//         userInput.value = '';
//         sendMessageWithSSE(msg);
//     }
//     sendButton.addEventListener('click', handleSend);
//     userInput.addEventListener('keypress', e => {
//         if (e.key === 'Enter') handleSend();
//     });

//     // Suggestions interactives
//     suggestionChips.forEach(chip => {
//         chip.addEventListener('click', () => {
//             userInput.value = chip.dataset.query;
//             handleSend();
//         });
//     });

//     // Catalogue: ouvrir/fermer
//     showCatalogBtn.addEventListener('click', openCatalogSidebar);
//     closeSidebarBtn.addEventListener('click', closeCatalogSidebar);
//     catalogSearch.addEventListener('input', () => {
//         clearTimeout(searchTimeout);
//         searchTimeout = setTimeout(() => searchProducts(catalogSearch.value), 300);
//     });

//     // Détail produit: fermer
//     closeProductDetailBtn.addEventListener('click', () => productDetailModal.style.display = 'none');
//     productDetailModal.addEventListener('click', e => {
//         if (e.target === productDetailModal) productDetailModal.style.display = 'none';
//     });

//     // Ajouter au chat
//     addProductToChatBtn.addEventListener('click', () => {
//         if (!selectedProduct) return;
//         const inStock = isProductInStock(selectedProduct);
//         const msg = `Вот информация о товаре "${selectedProduct['Наименование']}":\n- Артикул: ${selectedProduct['Артикул'] || 'не указан'}\n- Цена: ${selectedProduct['Цена'] ? selectedProduct['Цена'] + ' ₽' : 'не указана'}\n- Наличие: ${inStock ? 'В наличии' : 'Нет в наличии'}\n- Категория: ${selectedProduct['Категория'] || 'не указана'}`;
//         addMessage(msg, false);
//         productDetailModal.style.display = 'none';
//         catalogSidebar.style.display = 'none';
//     });

//     // Navigation histoire / navigation produit
//     prevProductBtn.addEventListener('click', () => navigateToProduct('prev'));
//     nextProductBtn.addEventListener('click', () => navigateToProduct('next'));
//     document.querySelectorAll('.quick-question-btn').forEach(btn => {
//         btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
//     });

//     // ---------------------
//     // Fonctions de chat
//     // ---------------------
//     function addMessage(content, isUser = false) {
//         const msgDiv = document.createElement('div');
//         msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
//         const roleDiv = document.createElement('div');
//         roleDiv.classList.add('message-role');
//         roleDiv.textContent = isUser ? 'Вы' : 'Twowin AI';
//         msgDiv.appendChild(roleDiv);

//         let formatted = content;
//         if (!isUser && formatted.includes('По запросу') && formatted.includes('найдено')) {
//             const parts = formatted.split(/\n\n(.+)$/s);
//             if (parts.length > 1) {
//                 const catalogInfo = parts[0];
//                 const rest = parts[1];
//                 const catalogDiv = document.createElement('div');
//                 catalogDiv.className = 'catalog-info';
//                 catalogDiv.innerHTML = formatCatalogInfo(catalogInfo);
//                 msgDiv.appendChild(catalogDiv);
//                 formatted = rest;
//             }
//         }
//         const contentDiv = document.createElement('div');
//         contentDiv.classList.add('message-content');
//         contentDiv.innerHTML = formatMarkdown(formatted);
//         msgDiv.appendChild(contentDiv);

//         if (!isUser) conversation.push({ role: 'assistant', content });
//         else conversation.push({ role: 'user', content });

//         if (!isUser) addSuggestions(msgDiv, content);

//         chatMessages.appendChild(msgDiv);
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     function formatMarkdown(text) {
//         text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code}</code></pre>`);
//         text = text.replace(/### (.*)/g, '<h3>$1</h3>')
//             .replace(/## (.*)/g, '<h2>$1</h2>')
//             .replace(/# (.*)/g, '<h1>$1</h1>')
//             .replace(/^\* (.*)/gm, '<li>$1</li>')
//             .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
//             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//             .replace(/\*(.*?)\*/g, '<em>$1</em>')
//             .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
//             .replace(/\n/g, '<br>');
//         return text;
//     }

//     function formatCatalogInfo(text) {
//         let fmt = '<div class="catalog-badge">Из каталога</div>';
//         fmt += text.replace(/По запросу "(.*?)" найдено (.*?) товаров:/g,
//             '<strong>По запросу "$1" найдено $2 товаров:</strong>');
//         const regex = /\*\*(\d+\. .*?)\*\*([\s\S]*?)(?=\*\*\d+\.|$)/g;
//         return fmt.replace(regex, (m, name, details) =>
//             `<div class="product-card"><div class="product-name">${name}</div><div class="product-details">${details}</div></div>`
//         );
//     }

//     function addSuggestions(elem, content) {
//         const suggestionsDiv = document.createElement('div');
//         suggestionsDiv.className = 'suggestion-chips';
//         const suggestions = [];
//         if (content.includes('По запросу') && content.includes('найдено')) {
//             suggestions.push({ text: 'Подробнее о первом товаре', query: 'Расскажи подробнее о первом товаре в результатах' });
//             const m = content.match(/По запросу "(.*?)"/);
//             if (m) suggestions.push({ text: 'Похожие товары', query: `Найди похожие товары на ${m[1]}` });
//         }
//         if (suggestions.length < 2) {
//             if (!content.includes('цен')) suggestions.push({ text: 'Узнать цены', query: 'Какие цены на самые популярные товары?' });
//             if (!content.includes('катал')) suggestions.push({ text: 'Каталог товаров', query: 'Покажи категории товаров в каталоге' });
//             if (!content.includes('акци')) suggestions.push({ text: 'Текущие акции', query: 'Какие акции сейчас действуют?' });
//         }
//         suggestions.slice(0, 3).forEach(s => {
//             const chip = document.createElement('div');
//             chip.className = 'suggestion-chip'; chip.textContent = s.text; chip.dataset.query = s.query;
//             chip.addEventListener('click', () => { userInput.value = s.query; handleSend(); });
//             suggestionsDiv.appendChild(chip);
//         });
//         if (suggestionsDiv.childElementCount) elem.appendChild(suggestionsDiv);
//     }

//     async function sendMessageWithSSE(message) {
//         typingIndicator.style.display = 'block';
//         try {
//             const resp = await fetch('/api/chat', {
//                 method: 'POST', headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ message, conversation })
//             });
//             if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
//             const reader = resp.body.getReader();
//             const dec = new TextDecoder(); let buf = '';
//             typingIndicator.style.display = 'none';
//             const { messageDiv, contentDiv } = createBotMessageElement();
//             let catalogInfo = null, botText = '', normalText = '';
//             while (true) {
//                 const { done, value } = await reader.read();
//                 if (done) break;
//                 buf += dec.decode(value, { stream: true });
//                 const parts = buf.split('\n\n'); buf = parts.pop() || '';
//                 for (const line of parts) {
//                     if (!line.startsWith('data: ')) continue;
//                     const data = JSON.parse(line.slice(6));
//                     if (data.content) {
//                         if (!normalText && data.content.includes('По запросу') && data.content.includes('найдено')) {
//                             catalogInfo = data.content;
//                             const cDiv = document.createElement('div');
//                             cDiv.className = 'catalog-info'; cDiv.innerHTML = formatCatalogInfo(catalogInfo);
//                             messageDiv.insertBefore(cDiv, contentDiv);
//                         } else if (catalogInfo && !botText) {
//                             botText = data.content; contentDiv.innerHTML = formatMarkdown(botText);
//                         } else if (botText) {
//                             botText += data.content; contentDiv.innerHTML = formatMarkdown(botText);
//                         } else {
//                             normalText += data.content; contentDiv.innerHTML = formatMarkdown(normalText);
//                         }
//                         chatMessages.scrollTop = chatMessages.scrollHeight;
//                     }
//                     if (data.done) {
//                         let full = catalogInfo ? catalogInfo + '\n\n' + botText : normalText;
//                         conversation.push({ role: 'assistant', content: full });
//                         addSuggestions(messageDiv, full);
//                     }
//                 }
//             }
//         } catch (err) {
//             typingIndicator.style.display = 'none';
//             addMessage('Извините, произошла ошибка при связи с сервером. Убедитесь, что LM Studio запущен.', false);
//             console.error('Communication error:', err);
//         }
//     }

//     function createBotMessageElement() {
//         const div = document.createElement('div'); div.classList.add('message', 'bot-message');
//         const role = document.createElement('div'); role.classList.add('message-role'); role.textContent = 'Twowin AI'; div.appendChild(role);
//         const content = document.createElement('div'); content.classList.add('message-content'); div.appendChild(content);
//         chatMessages.appendChild(div);
//         return { messageDiv: div, contentDiv: content };
//     }

//     // ---------------------
//     // Fonctions de catalogue
//     // ---------------------
//     async function fetchCatalog() {
//         productList.innerHTML = '<div class="product-item"><div class="product-item-name">Загрузка каталога...</div></div>';
//         try {
//             const resp = await fetch('/api/products'); if (!resp.ok) throw new Error('Erreur');
//             const data = await resp.json();
//             if (data.success && data.products) {
//                 productCatalog = data.products; filteredProducts = [...productCatalog];
//                 renderProductList(); updateCatalogStats();
//             } else productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
//         } catch (e) {
//             console.error('Erreur:', e);
//             productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
//             catalogStats.textContent = 'Не удалось загрузить каталог';
//         }
//     }

//     function renderProductList() {
//         const start = (currentPage - 1) * itemsPerPage;
//         const end = Math.min(start + itemsPerPage, filteredProducts.length);
//         productList.innerHTML = '';
//         if (!filteredProducts.length) {
//             productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ничего не найдено</div></div>';
//             renderPagination(); return;
//         }
//         for (let i = start; i < end; i++) {
//             const p = filteredProducts[i]; const inStock = isProductInStock(p);
//             const elem = document.createElement('div'); elem.className = 'product-item'; elem.dataset.index = i;
//             elem.innerHTML = `<div class="product-item-name">${p['Наименование'] || 'Без названия'}</div>
//                 <div class="product-item-meta">
//                     <div class="product-item-price">${p['Цена'] ? p['Цена'] + ' ₽' : 'Цена не указана'}</div>
//                     <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
//                 </div>`;
//             elem.addEventListener('click', () => showProductDetail(p));
//             productList.appendChild(elem);
//         }
//         renderPagination();
//     }

//     function renderPagination() {
//         catalogPagination.innerHTML = '';
//         if (filteredProducts.length <= itemsPerPage) return;
//         const total = Math.ceil(filteredProducts.length / itemsPerPage);
//         const prev = document.createElement('button'); prev.className = 'pagination-btn'; prev.textContent = '←'; prev.disabled = currentPage === 1;
//         prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderProductList(); } });
//         catalogPagination.appendChild(prev);
//         let startPage = Math.max(1, currentPage - 2), endPage = Math.min(total, startPage + 4);
//         if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
//         for (let i = startPage; i <= endPage; i++) {
//             const btn = document.createElement('button'); btn.className = 'pagination-btn'; btn.textContent = i;
//             if (i === currentPage) btn.classList.add('active');
//             btn.addEventListener('click', () => { currentPage = i; renderProductList(); });
//             catalogPagination.appendChild(btn);
//         }
//         const next = document.createElement('button'); next.className = 'pagination-btn'; next.textContent = '→'; next.disabled = currentPage === total;
//         next.addEventListener('click', () => { if (currentPage < total) { currentPage++; renderProductList(); } });
//         catalogPagination.appendChild(next);
//     }

//     function updateCatalogStats() {
//         if (!productCatalog.length) { catalogStats.textContent = 'Каталог пуст'; return; }
//         const total = productCatalog.length;
//         const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
//         const categories = new Set(productCatalog.map(p => p['Категория']).filter(Boolean)).size;
//         catalogStats.textContent = `Всего товаров: ${total} | В наличии: ${inStockCount} | Категорий: ${categories}`;
//     }

//     function isProductInStock(product) {
//         if (!product.hasOwnProperty('Наличие')) return false;
//         const val = String(product['Наличие']).toLowerCase();
//         return ['да', 'есть', 'в наличии', '1', 'true'].some(k => val.includes(k));
//     }

//     // ---------------------
//     // Détail produit amélioré + historique + navigation
//     // ---------------------
//     function showProductDetail(product) {
//         selectedProduct = product;
//         productDetailTitle.textContent = product['Наименование'] || 'Название неизвестно';
//         productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';
//         const inStock = isProductInStock(product);
//         productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
//         productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';
//         productDetailCode.textContent = product['Артикул'] || '-';
//         productDetailCategory.textContent = product['Категория'] || '-';
//         if (product['Описание'] || product['Краткое описание']) {
//             productDetailDescription.textContent = product['Описание'] || product['Краткое описание'];
//             document.getElementById('product-detail-description-section').style.display = 'block';
//         } else document.getElementById('product-detail-description-section').style.display = 'none';
//         // Table détails
//         productDetailTable.innerHTML = `<tr><th>Артикул</th><td>${product['Артикул'] || '-'}</td></tr><tr><th>Категория</th><td>${product['Категория'] || '-'}</td></tr>`;
//         const exclude = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие'];
//         Object.entries(product).forEach(([k, v]) => {
//             if (!exclude.includes(k) && v) {
//                 const row = document.createElement('tr'); row.innerHTML = `<th>${k}</th><td>${v}</td>`; productDetailTable.appendChild(row);
//             }
//         });
//         // Boutons questions rapides
//         const name = product['Наименование'] || 'этот товар';
//         document.querySelectorAll('.quick-question-btn').forEach(btn => {
//             btn.dataset.question = btn.dataset.question.replace('[PRODUCT_NAME]', name);
//         });
//         addToProductHistory(product);
//         productDetailModal.style.display = 'flex';
//     }

//     function askProductQuestion(question) {
//         addMessage(question, true);
//         productDetailModal.style.display = 'none';
//         sendMessageWithSSE(question);
//     }

//     function areProductsEqual(p1, p2) {
//         if (!p1 || !p2) return false;
//         if (p1['Артикул'] && p2['Артикул']) return p1['Артикул'] === p2['Артикул'];
//         return p1['Наименование'] === p2['Наименование'];
//     }

//     function navigateToProduct(direction) {
//         if (!selectedProduct) return;
//         const idx = filteredProducts.findIndex(p => (areProductsEqual(p, selectedProduct)));
//         if (idx === -1) return;
//         let newIndex = direction === 'next' ? idx + 1 : idx - 1;
//         if (newIndex < 0 || newIndex >= filteredProducts.length) return;
//         showProductDetail(filteredProducts[newIndex]);
//     }

//     // ---------------------
//     // Fonctions de navigation du catalogue
//     // ---------------------
//     function openCatalogSidebar() {
//         catalogSidebar.style.display = 'flex'; fetchCatalog();
//     }
//     function closeCatalogSidebar() {
//         catalogSidebar.style.display = 'none';
//     }

//     // ---------------------
//     // Recherche
//     // ---------------------
//     function searchProducts(query) {
//         if (!query) filteredProducts = [...productCatalog];
//         else {
//             const term = query.toLowerCase();
//             filteredProducts = productCatalog.filter(p => {
//                 return [p['Наименование'], p['Артикул'], p['Категория'], p['Описание']]
//                     .some(f => f && (f.toLowerCase().includes(term)));
//             });
//         }
//         currentPage = 1; renderProductList();
//     }
// });






//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr

// document.addEventListener('DOMContentLoaded', function () {
//     // ---------------------
//     // Éléments du DOM
//     // ---------------------
//     const chatMessages = document.getElementById('chat-messages');
//     const userInput = document.getElementById('user-input');
//     const sendButton = document.getElementById('send-button');
//     const typingIndicator = document.getElementById('typing-indicator');
//     const suggestionChips = document.querySelectorAll('.suggestion-chip');

//     const catalogSidebar = document.getElementById('catalog-sidebar');
//     const showCatalogBtn = document.getElementById('show-catalog-btn');
//     const closeSidebarBtn = document.getElementById('close-sidebar');
//     const catalogSearch = document.getElementById('catalog-search');
//     const productList = document.getElementById('product-list');
//     const catalogPagination = document.getElementById('catalog-pagination');
//     const catalogStats = document.getElementById('catalog-stats');

//     const productDetailModal = document.getElementById('product-detail-modal');
//     const closeProductDetailBtn = document.getElementById('close-product-detail');
//     const productDetailTitle = document.getElementById('product-detail-title');
//     const productDetailPrice = document.getElementById('product-detail-price');
//     const productDetailStock = document.getElementById('product-detail-stock');
//     const productDetailCode = document.getElementById('product-detail-code');
//     const productDetailCategory = document.getElementById('product-detail-category');
//     const productDetailDescription = document.getElementById('product-detail-description');
//     const productDetailTable = document.getElementById('product-detail-table');
//     const addProductToChatBtn = document.getElementById('add-product-to-chat');

//     let conversation = [
//         { role: "assistant", content: "Добро пожаловать! Я Twowin AI - ваш интеллектуальный помощник по вопросам строительства, ремонта и выбора инструментов. Задайте мне вопрос о товарах из нашего каталога, и я постараюсь помочь вам." }
//     ];
//     let productCatalog = [], filteredProducts = [], currentPage = 1, itemsPerPage = 8;
//     let selectedProduct = null, searchTimeout = null;
//     let productHistory = [];
//     const MAX_HISTORY_ITEMS = 5;

//     function saveProductHistory() {
//         const simplified = productHistory.map(p => ({
//             'Наименование': p['Наименование'],
//             'Артикул': p['Артикул'],
//             'Цена': p['Цена'],
//             'Категория': p['Категория']
//         }));
//         localStorage.setItem('productHistory', JSON.stringify(simplified));
//     }

//     function loadProductHistory() {
//         const saved = localStorage.getItem('productHistory');
//         if (saved) {
//             try {
//                 productHistory = JSON.parse(saved);
//             } catch (e) {
//                 console.error('Ошибка загрузки истории', e);
//                 productHistory = [];
//             }
//         }
//     }

//     function addToProductHistory(product) {
//         const idx = productHistory.findIndex(p =>
//             (p['Артикул'] && product['Артикул'] === p['Артикул']) ||
//             (p['Наименование'] && product['Наименование'] === p['Наименование'])
//         );
//         if (idx !== -1) productHistory.splice(idx, 1);
//         productHistory.unshift(product);
//         if (productHistory.length > MAX_HISTORY_ITEMS) productHistory.pop();
//         saveProductHistory();
//     }

//     loadProductHistory();
//     fetchCatalog();

//     function handleSend() {
//         if (userInput.value.trim() === '') return;
//         const msg = userInput.value;
//         addMessage(msg, true);
//         userInput.value = '';
//         sendMessageWithSSE(msg);
//     }

//     sendButton.addEventListener('click', handleSend);
//     userInput.addEventListener('keypress', e => {
//         if (e.key === 'Enter') handleSend();
//     });

//     suggestionChips.forEach(chip => {
//         chip.addEventListener('click', () => {
//             userInput.value = chip.dataset.query;
//             handleSend();
//         });
//     });

//     showCatalogBtn.addEventListener('click', () => {
//         catalogSidebar.style.display = 'flex';
//         fetchCatalog();
//     });

//     closeSidebarBtn.addEventListener('click', () => {
//         catalogSidebar.style.display = 'none';
//     });

//     catalogSearch.addEventListener('input', () => {
//         clearTimeout(searchTimeout);
//         searchTimeout = setTimeout(() => searchProducts(catalogSearch.value), 300);
//     });

//     closeProductDetailBtn.addEventListener('click', () => {
//         productDetailModal.style.display = 'none';
//     });

//     productDetailModal.addEventListener('click', e => {
//         if (e.target === productDetailModal) productDetailModal.style.display = 'none';
//     });

//     addProductToChatBtn.addEventListener('click', () => {
//         if (!selectedProduct) return;
//         const inStock = isProductInStock(selectedProduct);
//         const msg = `Вот информация о товаре "${selectedProduct['Наименование']}":\n- Артикул: ${selectedProduct['Артикул'] || 'не указан'}\n- Цена: ${selectedProduct['Цена'] ? selectedProduct['Цена'] + ' ₽' : 'не указана'}\n- Наличие: ${inStock ? 'В наличии' : 'Нет в наличии'}\n- Категория: ${selectedProduct['Категория'] || 'не указана'}`;
//         addMessage(msg, false);
//         productDetailModal.style.display = 'none';
//         catalogSidebar.style.display = 'none';
//     });

//     // ✅ Ajout de la délégation d’événement ici
//     productDetailModal.addEventListener('click', function (e) {
//         if (e.target.classList.contains('quick-question-btn')) {
//             const question = e.target.dataset.question;
//             if (question) askProductQuestion(question);
//         }
//     });

//     function addMessage(content, isUser = false) {
//         const msgDiv = document.createElement('div');
//         msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
//         const roleDiv = document.createElement('div');
//         roleDiv.classList.add('message-role');
//         roleDiv.textContent = isUser ? 'Вы' : 'Twowin AI';
//         msgDiv.appendChild(roleDiv);
//         const contentDiv = document.createElement('div');
//         contentDiv.classList.add('message-content');
//         contentDiv.innerHTML = formatMarkdown(content);
//         msgDiv.appendChild(contentDiv);
//         chatMessages.appendChild(msgDiv);
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     function formatMarkdown(text) {
//         return text
//             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//             .replace(/\*(.*?)\*/g, '<em>$1</em>')
//             .replace(/\n/g, '<br>');
//     }

//     async function sendMessageWithSSE(message) {
//         typingIndicator.style.display = 'block';
//         try {
//             const resp = await fetch('/api/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ message, conversation })
//             });
//             const reader = resp.body.getReader();
//             const decoder = new TextDecoder();
//             let result = '', buf = '';

//             const { messageDiv, contentDiv } = createBotMessageElement();
//             while (true) {
//                 const { done, value } = await reader.read();
//                 if (done) break;
//                 buf += decoder.decode(value, { stream: true });
//                 const parts = buf.split('\n\n');
//                 buf = parts.pop();
//                 for (const line of parts) {
//                     if (!line.startsWith('data: ')) continue;
//                     const json = JSON.parse(line.slice(6));
//                     if (json.content) {
//                         result += json.content;
//                         contentDiv.innerHTML = formatMarkdown(result);
//                         chatMessages.scrollTop = chatMessages.scrollHeight;
//                     }
//                 }
//             }

//             typingIndicator.style.display = 'none';
//             conversation.push({ role: 'assistant', content: result });

//         } catch (err) {
//             typingIndicator.style.display = 'none';
//             console.error('Ошибка SSE:', err);
//             addMessage('Произошла ошибка при связи с сервером.', false);
//         }
//     }

//     function createBotMessageElement() {
//         const div = document.createElement('div');
//         div.classList.add('message', 'bot-message');
//         const role = document.createElement('div');
//         role.classList.add('message-role');
//         role.textContent = 'Twowin AI';
//         div.appendChild(role);
//         const content = document.createElement('div');
//         content.classList.add('message-content');
//         div.appendChild(content);
//         chatMessages.appendChild(div);
//         return { messageDiv: div, contentDiv: content };
//     }

//     async function fetchCatalog() {
//         try {
//             const resp = await fetch('/api/products');
//             const data = await resp.json();
//             productCatalog = data.products || [];
//             filteredProducts = [...productCatalog];
//             renderProductList();
//         } catch (e) {
//             console.error('Erreur de chargement du catalogue', e);
//         }
//     }

//     function renderProductList() {
//         productList.innerHTML = '';
//         const start = (currentPage - 1) * itemsPerPage;
//         const end = start + itemsPerPage;
//         filteredProducts.slice(start, end).forEach(product => {
//             const div = document.createElement('div');
//             div.className = 'product-item';
//             div.innerHTML = `<div class="product-item-name">${product['Наименование']}</div>`;
//             div.addEventListener('click', () => showProductDetail(product));
//             productList.appendChild(div);
//         });
//     }

//     function isProductInStock(product) {
//         const val = (product['Наличие'] || '').toLowerCase();
//         return ['да', 'есть', 'в наличии', '1', 'true'].some(k => val.includes(k));
//     }

//     function showProductDetail(product) {
//         selectedProduct = product;
//         productDetailTitle.textContent = product['Наименование'] || '-';
//         productDetailPrice.textContent = product['Цена'] ? product['Цена'] + ' ₽' : 'Цена не указана';
//         const inStock = isProductInStock(product);
//         productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
//         productDetailCode.textContent = product['Артикул'] || '-';
//         productDetailCategory.textContent = product['Категория'] || '-';
//         productDetailDescription.textContent = product['Описание'] || product['Краткое описание'] || '-';
//         productDetailModal.style.display = 'flex';

//         document.querySelectorAll('.quick-question-btn').forEach(btn => {
//             btn.dataset.question = btn.dataset.question.replace('[PRODUCT_NAME]', product['Наименование'] || 'этот товар');
//         });

//         addToProductHistory(product);
//     }

//     function askProductQuestion(question) {
//         addMessage(question, true);
//         productDetailModal.style.display = 'none';
//         sendMessageWithSSE(question);
//     }

//     function searchProducts(query) {
//         const term = query.toLowerCase();
//         filteredProducts = productCatalog.filter(p =>
//             ['Наименование', 'Артикул', 'Категория', 'Описание']
//                 .some(field => p[field] && p[field].toLowerCase().includes(term))
//         );
//         currentPage = 1;
//         renderProductList();
//     }
// });
//







//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr

document.addEventListener('DOMContentLoaded', function () {
    // ---------------------
    // Éléments du DOM
    // ---------------------
    // Chat
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    // Catalogue
    const catalogSidebar = document.getElementById('catalog-sidebar');
    const showCatalogBtn = document.getElementById('show-catalog-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const catalogSearch = document.getElementById('catalog-search');
    const productList = document.getElementById('product-list');
    const catalogPagination = document.getElementById('catalog-pagination');
    const catalogStats = document.getElementById('catalog-stats');
    const resizeHandle = document.getElementById('resize-handle');

    // Détail produit
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductDetailBtn = document.getElementById('close-product-detail');
    const productDetailTitle = document.getElementById('product-detail-title');
    const productDetailPrice = document.getElementById('product-detail-price');
    const productDetailStock = document.getElementById('product-detail-stock');
    const productDetailCode = document.getElementById('product-detail-code');
    const productDetailCategory = document.getElementById('product-detail-category');
    const productDetailDescription = document.getElementById('product-detail-description');
    const productDetailTable = document.getElementById('product-detail-table');
    const addProductToChatBtn = document.getElementById('add-product-to-chat');

    // ---------------------
    // Variables globales
    // ---------------------
    let conversation = [
        { role: "assistant", content: "Добро пожаловать! Я Twowin AI - ваш интеллектуальный помощник по вопросам строительства, ремонта и выбора инструментов. Задайте мне вопрос о товарах из нашего каталога, и я постараюсь помочь вам." }
    ];
    let productCatalog = [];
    let filteredProducts = [];
    let currentPage = 1;
    let itemsPerPage = 8;
    let selectedProduct = null;
    let searchTimeout = null;

    // ---------------------
    // Historique de produits
    // ---------------------
    let productHistory = [];
    const MAX_HISTORY_ITEMS = 5;

    function saveProductHistory() {
        const simplified = productHistory.map(p => ({
            'Наименование': p['Наименование'],
            'Артикул': p['Артикул'],
            'Цена': p['Цена'],
            'Категория': p['Категория']
        }));
        localStorage.setItem('productHistory', JSON.stringify(simplified));
    }

    function loadProductHistory() {
        const saved = localStorage.getItem('productHistory');
        if (saved) {
            try {
                productHistory = JSON.parse(saved);
            } catch (e) {
                console.error('Ошибка при загрузке истории товаров', e);
                productHistory = [];
            }
        }
    }

    function addToProductHistory(product) {
        const idx = productHistory.findIndex(p =>
            (p['Артикул'] && product['Артикул'] === p['Артикул']) ||
            (p['Наименование'] && product['Наименование'] === p['Наименование'])
        );
        if (idx !== -1) productHistory.splice(idx, 1);
        productHistory.unshift(product);
        if (productHistory.length > MAX_HISTORY_ITEMS) productHistory.pop();
        saveProductHistory();
    }

    // ---------------------
    // Initialisation
    // ---------------------
    loadProductHistory();
    fetchCatalog();

    // ---------------------
    // Écouteurs d'événements
    // ---------------------
    // Chat: envoi
    function handleSend() {
        if (userInput.value.trim() === '') return;
        const msg = userInput.value;
        addMessage(msg, true);
        userInput.value = '';
        sendMessageWithSSE(msg);
    }
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSend();
    });

    // Suggestions interactives
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.dataset.query;
            handleSend();
        });
    });

    // Catalogue: ouvrir/fermer
    showCatalogBtn.addEventListener('click', openCatalogSidebar);
    closeSidebarBtn.addEventListener('click', closeCatalogSidebar);
    catalogSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchProducts(catalogSearch.value), 300);
    });

    // Détail produit: fermer
    closeProductDetailBtn.addEventListener('click', () => productDetailModal.style.display = 'none');
    productDetailModal.addEventListener('click', e => {
        if (e.target === productDetailModal) productDetailModal.style.display = 'none';
    });

    // Ajouter au chat
    addProductToChatBtn.addEventListener('click', () => {
        if (!selectedProduct) return;
        const inStock = isProductInStock(selectedProduct);
        const msg = `Вот информация о товаре "${selectedProduct['Наименование']}":\n- Артикул: ${selectedProduct['Артикул'] || 'не указан'}\n- Цена: ${selectedProduct['Цена'] ? selectedProduct['Цена'] + ' ₽' : 'не указана'}\n- Наличие: ${inStock ? 'В наличии' : 'Нет в наличии'}\n- Категория: ${selectedProduct['Категория'] || 'не указана'}`;
        addMessage(msg, false);
        productDetailModal.style.display = 'none';
        catalogSidebar.style.display = 'none';
    });

    // Questions rapides pour produits
    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
    });

    // Resize handle
    if (resizeHandle) {
        let isResizing = false;
        let lastX = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            lastX = e.clientX;
            document.body.style.cursor = 'ew-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const delta = e.clientX - lastX;
            lastX = e.clientX;
            const newWidth = catalogSidebar.offsetWidth + delta;
            catalogSidebar.style.width = Math.max(200, Math.min(600, newWidth)) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = '';
        });
    }

    // ---------------------
    // Fonctions de chat
    // ---------------------
    function addMessage(content, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
        const roleDiv = document.createElement('div');
        roleDiv.classList.add('message-role');
        roleDiv.textContent = isUser ? 'Вы' : 'Twowin AI';
        msgDiv.appendChild(roleDiv);

        let formatted = content;
        if (!isUser && formatted.includes('По запросу') && formatted.includes('найдено')) {
            const parts = formatted.split(/\n\n(.+)$/s);
            if (parts.length > 1) {
                const catalogInfo = parts[0];
                const rest = parts[1];
                const catalogDiv = document.createElement('div');
                catalogDiv.className = 'catalog-info';
                catalogDiv.innerHTML = formatCatalogInfo(catalogInfo);
                msgDiv.appendChild(catalogDiv);
                formatted = rest;
            }
        }
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = formatMarkdown(formatted);
        msgDiv.appendChild(contentDiv);

        if (!isUser) conversation.push({ role: 'assistant', content });
        else conversation.push({ role: 'user', content });

        if (!isUser) addSuggestions(msgDiv, content);

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMarkdown(text) {
        text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code}</code></pre>`);
        text = text.replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/^\* (.*)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
        return text;
    }

    function formatCatalogInfo(text) {
        let fmt = '<div class="catalog-badge">Из каталога</div>';
        fmt += text.replace(/По запросу "(.*?)" найдено (.*?) товаров:/g,
            '<strong>По запросу "$1" найдено $2 товаров:</strong>');
        const regex = /\*\*(\d+\. .*?)\*\*([\s\S]*?)(?=\*\*\d+\.|$)/g;
        return fmt.replace(regex, (m, name, details) =>
            `<div class="product-card"><div class="product-name">${name}</div><div class="product-details">${details}</div></div>`
        );
    }

    function addSuggestions(elem, content) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestion-chips';
        const suggestions = [];
        if (content.includes('По запросу') && content.includes('найдено')) {
            suggestions.push({ text: 'Подробнее о первом товаре', query: 'Расскажи подробнее о первом товаре в результатах' });
            const m = content.match(/По запросу "(.*?)"/);
            if (m) suggestions.push({ text: 'Похожие товары', query: `Найди похожие товары на ${m[1]}` });
        }
        if (suggestions.length < 2) {
            if (!content.includes('цен')) suggestions.push({ text: 'Узнать цены', query: 'Какие цены на самые популярные товары?' });
            if (!content.includes('катал')) suggestions.push({ text: 'Каталог товаров', query: 'Покажи категории товаров в каталоге' });
            if (!content.includes('акци')) suggestions.push({ text: 'Текущие акции', query: 'Какие акции сейчас действуют?' });
        }
        suggestions.slice(0, 3).forEach(s => {
            const chip = document.createElement('div');
            chip.className = 'suggestion-chip'; chip.textContent = s.text; chip.dataset.query = s.query;
            chip.addEventListener('click', () => { userInput.value = s.query; handleSend(); });
            suggestionsDiv.appendChild(chip);
        });
        if (suggestionsDiv.childElementCount) elem.appendChild(suggestionsDiv);
    }

    async function sendMessageWithSSE(message) {
        typingIndicator.style.display = 'block';
        try {
            const resp = await fetch('/api/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, conversation })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const reader = resp.body.getReader();
            const dec = new TextDecoder(); let buf = '';
            typingIndicator.style.display = 'none';
            const { messageDiv, contentDiv } = createBotMessageElement();
            let catalogInfo = null, botText = '', normalText = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const parts = buf.split('\n\n'); buf = parts.pop() || '';
                for (const line of parts) {
                    if (!line.startsWith('data: ')) continue;
                    const data = JSON.parse(line.slice(6));
                    if (data.content) {
                        if (!normalText && data.content.includes('По запросу') && data.content.includes('найдено')) {
                            catalogInfo = data.content;
                            const cDiv = document.createElement('div');
                            cDiv.className = 'catalog-info'; cDiv.innerHTML = formatCatalogInfo(catalogInfo);
                            messageDiv.insertBefore(cDiv, contentDiv);
                        } else if (catalogInfo && !botText) {
                            botText = data.content; contentDiv.innerHTML = formatMarkdown(botText);
                        } else if (botText) {
                            botText += data.content; contentDiv.innerHTML = formatMarkdown(botText);
                        } else {
                            normalText += data.content; contentDiv.innerHTML = formatMarkdown(normalText);
                        }
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                    if (data.done) {
                        let full = catalogInfo ? catalogInfo + '\n\n' + botText : normalText;
                        conversation.push({ role: 'assistant', content: full });
                        addSuggestions(messageDiv, full);
                    }
                }
            }
        } catch (err) {
            typingIndicator.style.display = 'none';
            addMessage('Извините, произошла ошибка при связи с сервером. Убедитесь, что LM Studio запущен.', false);
            console.error('Communication error:', err);
        }
    }

    function createBotMessageElement() {
        const div = document.createElement('div'); div.classList.add('message', 'bot-message');
        const role = document.createElement('div'); role.classList.add('message-role'); role.textContent = 'Twowin AI'; div.appendChild(role);
        const content = document.createElement('div'); content.classList.add('message-content'); div.appendChild(content);
        chatMessages.appendChild(div);
        return { messageDiv: div, contentDiv: content };
    }

    // ---------------------
    // Fonctions de catalogue
    // ---------------------
    async function fetchCatalog() {
        productList.innerHTML = '<div class="product-item"><div class="product-item-name">Загрузка каталога...</div></div>';
        try {
            const resp = await fetch('/api/products'); if (!resp.ok) throw new Error('Erreur');
            const data = await resp.json();
            if (data.success && data.products) {
                productCatalog = data.products; filteredProducts = [...productCatalog];
                renderProductList(); updateCatalogStats();
            } else productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
        } catch (e) {
            console.error('Erreur:', e);
            productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
            catalogStats.textContent = 'Не удалось загрузить каталог';
        }
    }

    function renderProductList() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredProducts.length);
        productList.innerHTML = '';
        if (!filteredProducts.length) {
            productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ничего не найдено</div></div>';
            renderPagination(); return;
        }
        for (let i = start; i < end; i++) {
            const p = filteredProducts[i]; const inStock = isProductInStock(p);
            const elem = document.createElement('div'); elem.className = 'product-item'; elem.dataset.index = i;
            elem.innerHTML = `<div class="product-item-name">${p['Наименование'] || 'Без названия'}</div>
                <div class="product-item-meta">
                    <div class="product-item-price">${p['Цена'] ? p['Цена'] + ' ₽' : 'Цена не указана'}</div>
                    <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
                </div>`;
            elem.addEventListener('click', () => showProductDetail(p));
            productList.appendChild(elem);
        }
        renderPagination();
    }

    function renderPagination() {
        catalogPagination.innerHTML = '';
        if (filteredProducts.length <= itemsPerPage) return;
        const total = Math.ceil(filteredProducts.length / itemsPerPage);
        const prev = document.createElement('button'); prev.className = 'pagination-btn'; prev.textContent = '←'; prev.disabled = currentPage === 1;
        prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderProductList(); } });
        catalogPagination.appendChild(prev);
        let startPage = Math.max(1, currentPage - 2), endPage = Math.min(total, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button'); btn.className = 'pagination-btn'; btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => { currentPage = i; renderProductList(); });
            catalogPagination.appendChild(btn);
        }
        const next = document.createElement('button'); next.className = 'pagination-btn'; next.textContent = '→'; next.disabled = currentPage === total;
        next.addEventListener('click', () => { if (currentPage < total) { currentPage++; renderProductList(); } });
        catalogPagination.appendChild(next);
    }

    function updateCatalogStats() {
        if (!productCatalog.length) { catalogStats.textContent = 'Каталог пуст'; return; }
        const total = productCatalog.length;
        const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
        const categories = new Set(productCatalog.map(p => p['Категория']).filter(Boolean)).size;
        catalogStats.textContent = `Всего товаров: ${total} | В наличии: ${inStockCount} | Категорий: ${categories}`;
    }

    function isProductInStock(product) {
        if (!product.hasOwnProperty('Наличие')) return false;
        const val = String(product['Наличие']).toLowerCase();
        return ['да', 'есть', 'в наличии', '1', 'true'].some(k => val.includes(k));
    }

    // ---------------------
    // Détail produit amélioré
    // ---------------------
    function showProductDetail(product) {
        selectedProduct = product;
        productDetailTitle.textContent = product['Наименование'] || 'Название неизвестно';
        productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';
        const inStock = isProductInStock(product);
        productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
        productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';
        productDetailCode.textContent = product['Артикул'] || '-';
        productDetailCategory.textContent = product['Категория'] || '-';
        if (product['Описание'] || product['Краткое описание']) {
            productDetailDescription.textContent = product['Описание'] || product['Краткое описание'];
            document.getElementById('product-detail-description-section').style.display = 'block';
        } else document.getElementById('product-detail-description-section').style.display = 'none';
        // Table détails
        productDetailTable.innerHTML = `<tr><th>Артикул</th><td>${product['Артикул'] || '-'}</td></tr><tr><th>Категория</th><td>${product['Категория'] || '-'}</td></tr>`;
        const exclude = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие'];
        Object.entries(product).forEach(([k, v]) => {
            if (!exclude.includes(k) && v) {
                const row = document.createElement('tr'); row.innerHTML = `<th>${k}</th><td>${v}</td>`; productDetailTable.appendChild(row);
            }
        });
        // Boutons questions rapides
        const name = product['Наименование'] || 'этот товар';
        document.querySelectorAll('.quick-question-btn').forEach(btn => {
            btn.dataset.question = btn.dataset.question.replace('[PRODUCT_NAME]', name);
        });
        addToProductHistory(product);
        productDetailModal.style.display = 'flex';
    }

    function askProductQuestion(question) {
        addMessage(question, true);
        productDetailModal.style.display = 'none';
        sendMessageWithSSE(question);
    }

    function areProductsEqual(p1, p2) {
        if (!p1 || !p2) return false;
        if (p1['Артикул'] && p2['Артикул']) return p1['Артикул'] === p2['Артикул'];
        return p1['Наименование'] === p2['Наименование'];
    }

    function navigateToProduct(direction) {
        if (!selectedProduct) return;
        const idx = filteredProducts.findIndex(p => (areProductsEqual(p, selectedProduct)));
        if (idx === -1) return;
        let newIndex = direction === 'next' ? idx + 1 : idx - 1;
        if (newIndex < 0 || newIndex >= filteredProducts.length) return;
        showProductDetail(filteredProducts[newIndex]);
    }

    // ---------------------
    // Fonctions de navigation du catalogue
    // ---------------------
    function openCatalogSidebar() {
        catalogSidebar.style.display = 'flex'; fetchCatalog();
    }
    function closeCatalogSidebar() {
        catalogSidebar.style.display = 'none';
    }

    // ---------------------
    // Recherche
    // ---------------------
    function searchProducts(query) {
        if (!query) filteredProducts = [...productCatalog];
        else {
            const term = query.toLowerCase();
            filteredProducts = productCatalog.filter(p => {
                return ['Наименование', 'Артикул', 'Категория', 'Описание']
                    .some(f => f && String(p[f]).toLowerCase().includes(term));
            });
        }
        currentPage = 1; renderProductList();
    }
});