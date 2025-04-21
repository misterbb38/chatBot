

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
//                 console.error('Ошибка при загрузке истории товаров', e);
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

//     // Questions rapides pour produits
//     document.querySelectorAll('.quick-question-btn').forEach(btn => {
//         btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
//     });

//     // Resize handle
//     if (resizeHandle) {
//         let isResizing = false;
//         let lastX = 0;

//         resizeHandle.addEventListener('mousedown', (e) => {
//             isResizing = true;
//             lastX = e.clientX;
//             document.body.style.cursor = 'ew-resize';
//         });

//         document.addEventListener('mousemove', (e) => {
//             if (!isResizing) return;
//             const delta = e.clientX - lastX;
//             lastX = e.clientX;
//             const newWidth = catalogSidebar.offsetWidth + delta;
//             catalogSidebar.style.width = Math.max(200, Math.min(600, newWidth)) + 'px';
//         });

//         document.addEventListener('mouseup', () => {
//             isResizing = false;
//             document.body.style.cursor = '';
//         });
//     }

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
//     // Détail produit amélioré
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
//                 return ['Наименование', 'Артикул', 'Категория', 'Описание', 'Код артикула']
//                     .some(f => f && String(p[f]).toLowerCase().includes(term));
//             });
//         }
//         currentPage = 1; renderProductList();
//     }
// });

//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr

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
//                 console.error('Ошибка при загрузке истории товаров', e);
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

//     // Questions rapides pour produits
//     document.querySelectorAll('.quick-question-btn').forEach(btn => {
//         btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
//     });

//     // Resize handle
//     if (resizeHandle) {
//         let isResizing = false;
//         let lastX = 0;

//         resizeHandle.addEventListener('mousedown', (e) => {
//             isResizing = true;
//             lastX = e.clientX;
//             document.body.style.cursor = 'ew-resize';
//         });

//         document.addEventListener('mousemove', (e) => {
//             if (!isResizing) return;
//             const delta = e.clientX - lastX;
//             lastX = e.clientX;
//             const newWidth = catalogSidebar.offsetWidth + delta;
//             catalogSidebar.style.width = Math.max(200, Math.min(600, newWidth)) + 'px';
//         });

//         document.addEventListener('mouseup', () => {
//             isResizing = false;
//             document.body.style.cursor = '';
//         });
//     }

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
//             addMessage('Извините, произошла ошибка при связи с сервером.', false);
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
//             const p = filteredProducts[i];
//             const inStock = isProductInStock(p);

//             // Créer les infos additionnelles (artикул et stock) à afficher entre parenthèses
//             const articleCode = p['Артикул'] ? `<strong>Арт. ${p['Артикул']}</strong>` : '';
//             const stockInfo = inStock ? 'в наличии' : 'нет в наличии';
//             const additionalInfo = [articleCode].filter(Boolean).join(', ');

//             const elem = document.createElement('div');
//             elem.className = 'product-item';
//             elem.dataset.index = i;

//             elem.innerHTML = `
//                 <div class="product-item-name">
//                     ${p['Наименование'] || 'Без названия'} 
//                     ${additionalInfo ? `<span class="product-item-info">(${additionalInfo})</span>` : ''}
//                 </div>
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
//     // Détail produit amélioré
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
//             btn.dataset.question = btn.dataset.origQuestion
//                 ? btn.dataset.origQuestion.replace('[PRODUCT_NAME]', name)
//                 : btn.dataset.question.replace('[PRODUCT_NAME]', name);

//             // Sauvegarder la question originale si pas déjà fait
//             if (!btn.dataset.origQuestion) {
//                 btn.dataset.origQuestion = btn.dataset.question;
//             }
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
//                 return ['Наименование', 'Артикул', 'Категория', 'Описание', 'Код артикула']
//                     .some(f => p[f] && String(p[f]).toLowerCase().includes(term));
//             });
//         }
//         currentPage = 1; renderProductList();
//     }
// });




//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr

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
    const productQuickQuestions = document.getElementById('product-quick-questions');

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
            addMessage('Извините, произошла ошибка при связи с сервером.', false);
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
            const p = filteredProducts[i];
            const inStock = isProductInStock(p);

            // Créer les infos additionnelles (artикул et stock) à afficher entre parenthèses
            const articleCode = p['Артикул'] ? `<strong>Арт. ${p['Артикул']}</strong>` : '';
            const stockInfo = inStock ? 'в наличии' : 'нет в наличии';
            const additionalInfo = [articleCode].filter(Boolean).join(', ');

            // Récupérer l'URL du produit s'il existe, sinon utiliser #
            const productUrl = p['URL товара'] ? p['URL товара'] : '#';

            const elem = document.createElement('div');
            elem.className = 'product-item';
            elem.dataset.index = i;

            elem.innerHTML = `
                <div class="product-item-name">
                    <a href="${productUrl}" target="_blank" class="product-link">
                        ${p['Наименование'] || 'Без названия'}
                    </a>
                    ${additionalInfo ? `<span class="product-item-info">(${additionalInfo})</span>` : ''}
                </div>
                <div class="product-item-meta">
                    <div class="product-item-price">${p['Цена'] ? p['Цена'] + ' ₽' : 'Цена не указана'}</div>
                    <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
                </div>`;

            elem.addEventListener('click', (e) => {
                // Si le clic est sur le lien, ne pas déclencher l'affichage du détail
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    e.stopPropagation();
                    return;
                }
                showProductDetail(p);
            });
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

        // Récupérer l'URL du produit s'il existe, sinon utiliser #
        const productUrl = product['URL товара'] ? product['URL товара'] : '#';

        // Titre avec lien
        productDetailTitle.innerHTML = `<a href="${productUrl}" target="_blank" class="product-link">${product['Наименование'] || 'Название неизвестно'}</a>`;

        productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';
        const inStock = isProductInStock(product);
        productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
        productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';
        productDetailCode.textContent = product['Артикул'] || '-';
        productDetailCategory.textContent = product['Категория'] || '-';

        // Repositionner la section des questions rapides après le prix et le stock
        if (productQuickQuestions) {
            const infoSection = document.querySelector('.product-detail-info');
            infoSection.insertBefore(productQuickQuestions, infoSection.firstChild.nextSibling.nextSibling);
        }

        if (product['Описание'] || product['Краткое описание']) {
            productDetailDescription.textContent = product['Описание'] || product['Краткое описание'];
            document.getElementById('product-detail-description-section').style.display = 'block';
        } else document.getElementById('product-detail-description-section').style.display = 'none';

        // Table détails
        productDetailTable.innerHTML = `<tr><th>Артикул</th><td>${product['Артикул'] || '-'}</td></tr><tr><th>Категория</th><td>${product['Категория'] || '-'}</td></tr>`;
        const exclude = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие', 'URL товара'];
        Object.entries(product).forEach(([k, v]) => {
            if (!exclude.includes(k) && v) {
                const row = document.createElement('tr'); row.innerHTML = `<th>${k}</th><td>${v}</td>`; productDetailTable.appendChild(row);
            }
        });

        // Boutons questions rapides
        const name = product['Наименование'] || 'этот товар';
        document.querySelectorAll('.quick-question-btn').forEach(btn => {
            btn.dataset.question = btn.dataset.origQuestion
                ? btn.dataset.origQuestion.replace('[PRODUCT_NAME]', name)
                : btn.dataset.question.replace('[PRODUCT_NAME]', name);

            // Sauvegarder la question originale si pas déjà fait
            if (!btn.dataset.origQuestion) {
                btn.dataset.origQuestion = btn.dataset.question;
            }
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
                return ['Наименование', 'Артикул', 'Категория', 'Описание', 'Код артикула']
                    .some(f => p[f] && String(p[f]).toLowerCase().includes(term));
            });
        }
        currentPage = 1; renderProductList();
    }
});

//rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr


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
//     const productQuickQuestions = document.getElementById('product-quick-questions');

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
//                 console.error('Ошибка при загрузке истории товаров', e);
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

//     // Questions rapides pour produits
//     document.querySelectorAll('.quick-question-btn').forEach(btn => {
//         btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
//     });

//     // Resize handle
//     if (resizeHandle) {
//         let isResizing = false;
//         let lastX = 0;

//         resizeHandle.addEventListener('mousedown', (e) => {
//             isResizing = true;
//             lastX = e.clientX;
//             document.body.style.cursor = 'ew-resize';
//         });

//         document.addEventListener('mousemove', (e) => {
//             if (!isResizing) return;
//             const delta = e.clientX - lastX;
//             lastX = e.clientX;
//             const newWidth = catalogSidebar.offsetWidth + delta;
//             catalogSidebar.style.width = Math.max(200, Math.min(600, newWidth)) + 'px';
//         });

//         document.addEventListener('mouseup', () => {
//             isResizing = false;
//             document.body.style.cursor = '';
//         });
//     }

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

//     // Fonction améliorée pour trouver un produit par son nom ou par son code article
//     function findProductByNameOrCode(name, code) {
//         if (!productCatalog || productCatalog.length === 0) return null;

//         // Nettoyer le nom (enlever numéros, etc.)
//         const cleanName = name ? name.replace(/^\d+\.\s+/, '').trim() : '';

//         // D'abord chercher par code article car plus précis
//         if (code) {
//             const productByCode = productCatalog.find(p =>
//                 p['Артикул'] && p['Артикул'].toLowerCase() === code.toLowerCase()
//             );
//             if (productByCode) return productByCode;
//         }

//         // Ensuite chercher par nom exact
//         if (cleanName) {
//             const productByExactName = productCatalog.find(p =>
//                 p['Наименование'] && p['Наименование'].toLowerCase() === cleanName.toLowerCase()
//             );
//             if (productByExactName) return productByExactName;

//             // Puis chercher par nom partiel
//             const productByPartialName = productCatalog.find(p =>
//                 p['Наименование'] && p['Наименование'].toLowerCase().includes(cleanName.toLowerCase())
//             );
//             if (productByPartialName) return productByPartialName;
//         }

//         return null;
//     }

//     // Fonction modifiée pour formater le texte et ajouter des liens aux noms de produits
//     function formatMarkdown(text) {
//         // Traitement d'abord des sections de code et des titres
//         text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code}</code></pre>`);
//         text = text.replace(/### (.*)/g, '<h3>$1</h3>')
//             .replace(/## (.*)/g, '<h2>$1</h2>')
//             .replace(/# (.*)/g, '<h1>$1</h1>')
//             .replace(/^\* (.*)/gm, '<li>$1</li>')
//             .replace(/^\d+\. (.*)/gm, '<li>$1</li>');

//         // Transformer des produits en gras en liens quand possible
//         text = text.replace(/\*\*(.*?)\*\*/g, (match, content) => {
//             // Tenter de trouver si le contenu est un nom de produit
//             let productCode = null;

//             // Si le contenu contient "артикул", on extrait le code
//             const codeMatch = content.match(/артикул[:\s]+([A-Za-z0-9-]+)/i);
//             if (codeMatch && codeMatch[1]) {
//                 productCode = codeMatch[1];
//             }

//             const product = findProductByNameOrCode(content, productCode);

//             if (product && product['URL товара']) {
//                 return `<strong><a href="${product['URL товара']}" target="_blank" class="product-link">${content}</a></strong>`;
//             }

//             return `<strong>${content}</strong>`;
//         });

//         // Rechercher spécifiquement les mentions de produits avec leur article
//         text = text.replace(/(["«])(.*?)(["»])(\s*)\(артикул[:\s]+([\w\d-]+)\)/gi, (match, openQuote, productName, closeQuote, space, articleCode) => {
//             const product = findProductByNameOrCode(productName, articleCode);

//             if (product && product['URL товара']) {
//                 return `${openQuote}<a href="${product['URL товара']}" target="_blank" class="product-link">${productName}</a>${closeQuote}${space}(артикул: ${articleCode})`;
//             }

//             return match;
//         });

//         // Continuer avec le formatage standard
//         text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
//             .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
//             .replace(/\n/g, '<br>');

//         return text;
//     }

//     // Fonction améliorée pour formatter les informations de catalogue
//     function formatCatalogInfo(text) {
//         let fmt = '<div class="catalog-badge">Из каталога</div>';
//         fmt += text.replace(/По запросу "(.*?)" найдено (.*?) товаров:/g,
//             '<strong>По запросу "$1" найдено $2 товаров:</strong>');

//         // Regex améliorée pour capturer chaque bloc de produit
//         const regex = /\*\*(\d+\. .*?)\*\*([\s\S]*?)(?=\*\*\d+\.|$)/g;

//         return fmt.replace(regex, (m, name, details) => {
//             let productUrl = '#';

//             // Extraire le code article des détails
//             const articleMatch = details.match(/Артикул: ([\w\d-]+)/);
//             if (articleMatch && articleMatch[1]) {
//                 const articleCode = articleMatch[1];

//                 // Trouver le produit correspondant dans le catalogue
//                 const matchedProduct = productCatalog.find(p => p['Артикул'] === articleCode);
//                 if (matchedProduct && matchedProduct['URL товара']) {
//                     productUrl = matchedProduct['URL товара'];
//                 }
//             } else {
//                 // Si pas d'article, essayer de trouver par le nom
//                 const cleanName = name.replace(/^\d+\.\s+/, '').trim();
//                 const matchedProduct = productCatalog.find(p =>
//                     p['Наименование'] && p['Наименование'].toLowerCase() === cleanName.toLowerCase()
//                 );
//                 if (matchedProduct && matchedProduct['URL товара']) {
//                     productUrl = matchedProduct['URL товара'];
//                 }
//             }

//             // Créer le nom avec lien
//             const nameWithLink = `<a href="${productUrl}" target="_blank" class="product-link">${name}</a>`;

//             return `<div class="product-card">
//                 <div class="product-name">${nameWithLink}</div>
//                 <div class="product-details">${details}</div>
//             </div>`;
//         });
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
//             addMessage('Извините, произошла ошибка при связи с сервером.', false);
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
//             const p = filteredProducts[i];
//             const inStock = isProductInStock(p);

//             // Créer les infos additionnelles (artикул et stock) à afficher entre parenthèses
//             const articleCode = p['Артикул'] ? `<strong>Арт. ${p['Артикул']}</strong>` : '';
//             const stockInfo = inStock ? 'в наличии' : 'нет в наличии';
//             const additionalInfo = [articleCode].filter(Boolean).join(', ');

//             // Récupérer l'URL du produit s'il existe, sinon utiliser #
//             const productUrl = p['URL товара'] ? p['URL товара'] : '#';

//             const elem = document.createElement('div');
//             elem.className = 'product-item';
//             elem.dataset.index = i;

//             elem.innerHTML = `
//                 <div class="product-item-name">
//                     <a href="${productUrl}" target="_blank" class="product-link">
//                         ${p['Наименование'] || 'Без названия'}
//                     </a>
//                     ${additionalInfo ? `<span class="product-item-info">(${additionalInfo})</span>` : ''}
//                 </div>
//                 <div class="product-item-meta">
//                     <div class="product-item-price">${p['Цена'] ? p['Цена'] + ' ₽' : 'Цена не указана'}</div>
//                     <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
//                 </div>`;

//             elem.addEventListener('click', (e) => {
//                 // Si le clic est sur le lien, ne pas déclencher l'affichage du détail
//                 if (e.target.tagName === 'A' || e.target.closest('a')) {
//                     e.stopPropagation();
//                     return;
//                 }
//                 showProductDetail(p);
//             });
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
//     // Détail produit amélioré
//     // ---------------------
//     function showProductDetail(product) {
//         selectedProduct = product;

//         // Récupérer l'URL du produit s'il existe, sinon utiliser #
//         const productUrl = product['URL товара'] ? product['URL товара'] : '#';

//         // Titre avec lien
//         productDetailTitle.innerHTML = `<a href="${productUrl}" target="_blank" class="product-link">${product['Наименование'] || 'Название неизвестно'}</a>`;

//         productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';
//         const inStock = isProductInStock(product);
//         productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
//         productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';
//         productDetailCode.textContent = product['Артикул'] || '-';
//         productDetailCategory.textContent = product['Категория'] || '-';

//         // Repositionner la section des questions rapides après le prix et le stock
//         if (productQuickQuestions) {
//             const infoSection = document.querySelector('.product-detail-info');
//             infoSection.insertBefore(productQuickQuestions, infoSection.firstChild.nextSibling.nextSibling);
//         }

//         if (product['Описание'] || product['Краткое описание']) {
//             productDetailDescription.textContent = product['Описание'] || product['Краткое описание'];
//             document.getElementById('product-detail-description-section').style.display = 'block';
//         } else document.getElementById('product-detail-description-section').style.display = 'none';

//         // Table détails
//         productDetailTable.innerHTML = `<tr><th>Артикул</th><td>${product['Артикул'] || '-'}</td></tr><tr><th>Категория</th><td>${product['Категория'] || '-'}</td></tr>`;
//         const exclude = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие', 'URL товара'];
//         Object.entries(product).forEach(([k, v]) => {
//             if (!exclude.includes(k) && v) {
//                 const row = document.createElement('tr'); row.innerHTML = `<th>${k}</th><td>${v}</td>`; productDetailTable.appendChild(row);
//             }
//         });

//         // Boutons questions rapides
//         const name = product['Наименование'] || 'этот товар';
//         document.querySelectorAll('.quick-question-btn').forEach(btn => {
//             btn.dataset.question = btn.dataset.origQuestion
//                 ? btn.dataset.origQuestion.replace('[PRODUCT_NAME]', name)
//                 : btn.dataset.question.replace('[PRODUCT_NAME]', name);

//             // Sauvegarder la question originale si pas déjà fait
//             if (!btn.dataset.origQuestion) {
//                 btn.dataset.origQuestion = btn.dataset.question;
//             }
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
//                 return ['Наименование', 'Артикул', 'Категория', 'Описание', 'Код артикула']
//                     .some(f => p[f] && String(p[f]).toLowerCase().includes(term));
//             });
//         }
//         currentPage = 1; renderProductList();
//     }
// });