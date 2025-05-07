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
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    const searchHelper = document.getElementById('search-helper');
    const autocompleteResults = document.getElementById('autocomplete-results') || createAutocompleteContainer();

    // Catalogue
    const catalogSidebar = document.getElementById('catalog-sidebar');
    const showCatalogBtn = document.getElementById('show-catalog-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const catalogSearch = document.getElementById('catalog-search');
    const productList = document.getElementById('product-list');
    const catalogPagination = document.getElementById('catalog-pagination');
    const catalogStats = document.getElementById('catalog-stats');
    const resizeHandle = document.getElementById('resize-handle');
    const directSearchBtn = document.getElementById('direct-search-btn');

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
    const historyBtn = document.getElementById('history-btn');

    // Créer le conteneur d'autocomplétion s'il n'existe pas
    function createAutocompleteContainer() {
        const container = document.createElement('div');
        container.id = 'autocomplete-results';
        container.className = 'autocomplete-results';
        document.querySelector('.chat-input')?.appendChild(container);
        return container;
    }

    // Créer le helper de recherche s'il n'existe pas
    if (!searchHelper) {
        const helperDiv = document.createElement('div');
        helperDiv.id = 'search-helper';
        helperDiv.className = 'search-helper';
        helperDiv.style.display = 'none';
        helperDiv.textContent = 'Используйте @ для прямого поиска по каталогу, например: @перфоратор';
        document.querySelector('.chat-container')?.appendChild(helperDiv);
    }

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
    let autocompleteTimeout = null;

    // Préfixe pour la recherche directe
    const SEARCH_PREFIX = '@';
    let isDirectSearchMode = false;

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
        const inputText = userInput.value.trim();
        if (inputText === '') return;

        // Vérifier si c'est une recherche directe (commencant par @)
        if (inputText.startsWith(SEARCH_PREFIX)) {
            const searchQuery = inputText.substring(1).trim(); // Enlever le préfixe @

            if (searchQuery.length < 2) {
                // Requête trop courte
                addMessage("Запрос слишком короткий. Введите минимум 2 символа после @", false);
                return;
            }

            // Afficher le message de recherche de l'utilisateur
            addMessage(inputText, true);

            // Effectuer la recherche directement dans le catalogue
            performDirectSearch(searchQuery);

            // Réinitialiser l'input
            userInput.value = '';
            return;
        }

        // Comportement normal pour les messages réguliers (non recherche)
        const msg = inputText;
        addMessage(msg, true);
        userInput.value = '';
        sendMessageWithSSE(msg);
    }

    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSend();
    });

    // Défilement vers le bas
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Suggestions interactives
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.dataset.query;
            handleSend();
        });
    });

    // Catalogue: ouvrir/fermer
    if (showCatalogBtn) {
        showCatalogBtn.addEventListener('click', openCatalogSidebar);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeCatalogSidebar);
    }

    if (catalogSearch) {
        catalogSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchProducts(catalogSearch.value), 300);
        });
    }

    // Recherche directe: activer le mode
    if (directSearchBtn) {
        directSearchBtn.addEventListener('click', () => {
            userInput.value = SEARCH_PREFIX;
            userInput.focus();
            userInput.classList.add('direct-search-mode');

            // Afficher l'aide à la recherche si elle existe
            if (searchHelper) {
                searchHelper.style.display = 'block';
                setTimeout(() => {
                    searchHelper.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Historique des produits
    if (historyBtn) {
        historyBtn.addEventListener('click', showProductHistory);
    }

    // Détail produit: fermer
    if (closeProductDetailBtn) {
        closeProductDetailBtn.addEventListener('click', () => productDetailModal.style.display = 'none');
    }

    if (productDetailModal) {
        productDetailModal.addEventListener('click', e => {
            if (e.target === productDetailModal) productDetailModal.style.display = 'none';
        });
    }

    // Ajouter au chat
    if (addProductToChatBtn) {
        addProductToChatBtn.addEventListener('click', () => {
            if (!selectedProduct) return;
            const inStock = isProductInStock(selectedProduct);
            const msg = `Вот информация о товаре "${selectedProduct['Наименование']}":\n- Артикул: ${selectedProduct['Артикул'] || 'не указан'}\n- Цена: ${selectedProduct['Цена'] ? selectedProduct['Цена'] + ' ₽' : 'не указана'}\n- Наличие: ${inStock ? 'В наличии' : 'Нет в наличии'}\n- Категория: ${selectedProduct['Категория'] || 'не указана'}`;
            addMessage(msg, false);
            productDetailModal.style.display = 'none';
            catalogSidebar.style.display = 'none';
        });
    }

    // Questions rapides pour produits
    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', () => askProductQuestion(btn.dataset.question));
    });

    // Mise en évidence du mode recherche directe
    userInput.addEventListener('input', function () {
        const value = this.value;

        // Masquer le helper d'autocomplétion si nécessaire
        if (autocompleteResults) {
            autocompleteResults.innerHTML = '';
            autocompleteResults.style.display = 'none';
        }

        // Si l'input commence par @, activer le mode recherche directe
        if (value.startsWith(SEARCH_PREFIX)) {
            this.classList.add('direct-search-mode');
            isDirectSearchMode = true;

            // Si seulement @ est présent, afficher l'aide
            if (value === SEARCH_PREFIX && searchHelper) {
                searchHelper.style.display = 'block';
            } else if (searchHelper) {
                searchHelper.style.display = 'none';

                // Démarrer l'autocomplétion si suffisamment de caractères
                if (value.length > 2 && autocompleteResults) {
                    clearTimeout(autocompleteTimeout);
                    autocompleteTimeout = setTimeout(() => {
                        showAutocompleteResults(value.substring(1));
                    }, 300);
                }
            }
        } else {
            this.classList.remove('direct-search-mode');
            isDirectSearchMode = false;
            if (searchHelper) searchHelper.style.display = 'none';
        }
    });

    // Click pour masquer l'autocomplétion
    document.addEventListener('click', function (e) {
        if (autocompleteResults && !autocompleteResults.contains(e.target) && e.target !== userInput) {
            autocompleteResults.innerHTML = '';
            autocompleteResults.style.display = 'none';
        }
    });

    // Resize handle
    if (resizeHandle && catalogSidebar) {
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

    // Numéros d'article cliquables
    document.addEventListener('click', function (e) {
        if (e.target.matches('.insert-artikul')) {
            e.preventDefault();
            const num = e.target.dataset.artikul;

            // Ouvrir le panneau catalogue
            if (catalogSidebar &&
                (catalogSidebar.style.display === 'none' ||
                    getComputedStyle(catalogSidebar).display === 'none')) {
                openCatalogSidebar();
            }

            // Remplir le champ de recherche
            if (catalogSearch) {
                catalogSearch.value = num;
                const evt = new Event('input', { bubbles: true });
                catalogSearch.dispatchEvent(evt);
            }
        }
    });

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
        // Vérifier si text est défini et est une chaîne
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Formatage Markdown de base
        let formattedText = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code}</code></pre>`);
        formattedText = formattedText.replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/^\* (.*)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Capture tous les cas de prix dans différents formats
        // 1. Format emoji + Цена
        formattedText = formattedText.replace(/(💰\s*)(Цена|цена|Стоимость|стоимость):\s*(\d+[\s\d]*[\.,]?\d*)\s*(₽|руб\.?|RUB)/g,
            '$1<span style="color: red; font-weight: bold;">$2: $3 $4</span>');

        // 2. Format standard Цена sans emoji
        formattedText = formattedText.replace(/(?<!💰\s*)(Цена|цена|Стоимость|стоимость):\s*(\d+[\s\d]*[\.,]?\d*)\s*(₽|руб\.?|RUB)/g,
            '<span style="color: red; font-weight: bold;">$1: $2 $3</span>');

        // 3. Format avec le prix au milieu d'une phrase
        formattedText = formattedText.replace(/(цена которого составляет)\s+(\d+[\s\d]*[\.,]?\d*)\s*(₽|руб\.?|рубл[а-я]+|RUB)/g,
            '<span style="color: red; font-weight: bold;">$1 $2 $3</span>');

        // 4. Format dans les listes avec tiret
        formattedText = formattedText.replace(/(-\s*)(Цена|цена|Стоимость|стоимость):\s*(\d+[\s\d]*[\.,]?\d*)\s*(₽|руб\.?|RUB)/g,
            '$1<span style="color: red; font-weight: bold;">$2: $3 $4</span>');

        // 5. Capture simple du prix en chiffres suivis de руб ou ₽ (version simplifiée pour éviter l'erreur)
        formattedText = formattedText.replace(/(\d+[\s\d]*[\.,]?\d*)\s*(₽|руб\.?|рубл[а-я]+|RUB)/g,
            '<span style="color: red; font-weight: bold;">$1 $2</span>');

        // Numéro Артикул cliquable
        formattedText = formattedText.replace(/Артикул:\s*([0-9A-Za-z-]+)/g,
            'Артикул: <a href="#" class="insert-artikul" data-artikul="$1">$1</a>');
        formattedText = formattedText.replace(/Арт.\s*([0-9A-Za-z-]+)/g,
            'Арт. <a href="#" class="insert-artikul" data-artikul="$1">$1</a>');

        // Sauts de ligne
        formattedText = formattedText.replace(/\n/g, '<br>');

        return formattedText;
    }

    function formatCatalogInfo(text) {
        if (!text) return '';

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
                    try {
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
                    } catch (e) {
                        console.error('Erreur lors du parsing JSON:', e, 'Ligne:', line);
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
    // Fonctions pour la recherche directe
    // ---------------------
    function performDirectSearch(query) {
        // Vérifier que le catalogue est chargé
        if (!productCatalog || productCatalog.length === 0) {
            addMessage("Каталог не загружен. Пожалуйста, подождите и попробуйте снова.", false);
            return;
        }

        // Rechercher dans le catalogue
        const results = searchCatalogDirectly(query);

        // Afficher les résultats dans le chat
        displaySearchResults(results, query);
    }

    function searchCatalogDirectly(query, limit = 5) {
        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);

        if (keywords.length === 0) {
            // Si pas assez de mots-clés longs, utiliser tous les mots
            keywords.push(...query.toLowerCase().split(' ').filter(k => k.length > 0));

            if (keywords.length === 0) {
                return {
                    success: false,
                    message: 'Запрос слишком короткий'
                };
            }
        }

        // Fonction de score pour la pertinence (similaire à celle du backend)
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
            totalProducts: productCatalog.length
        };
    }

    function displaySearchResults(results, query) {
        if (!results.success) {
            addMessage(`Не удалось выполнить поиск: ${results.message || 'Неизвестная ошибка'}`, false);
            return;
        }

        if (results.products.length === 0) {
            addMessage(`По запросу "${query}" ничего не найдено в каталоге.`, false);
            return;
        }

        // Formater les résultats comme message du bot
        let response = `По запросу "${query}" найдено ${results.products.length} товаров:\n\n`;

        results.products.forEach((product, index) => {
            response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

            // Ajouter le prix s'il existe avec mise en forme spéciale
            if (product['Цена']) {
                response += `💰 <span style="color:red;font-weight:bold;">Цена: ${product['Цена']} руб.</span>\n`;
            }

            // Ajouter la catégorie si elle existe
            if (product['Категория']) {
                response += `📂 Категория: ${product['Категория']}\n`;
            }

            // Ajouter l'article si disponible, avec le format cliquable
            if (product['Артикул']) {
                const art = product['Артикул'];
                response += `📝 Артикул: <a href="#" class="insert-artikul" data-artikul="${art}">${art}</a>\n`;
            }

            // Ajouter le fabricant si disponible
            if (product['Производитель']) {
                response += `🏭 Производитель: ${product['Производитель']}\n`;
            }

            // Ajouter une description courte
            if (product['Краткое описание']) {
                response += `📄 ${product['Краткое описание']}\n`;
            }

            // Ajouter la disponibilité si elle existe
            if (product.hasOwnProperty('Наличие')) {
                const inStock = isProductInStock(product);
                response += `${inStock ? '✅ В наличии' : '❌ Нет в наличии'}\n`;
            }

            response += '\n';
        });

        // Ajouter une ligne pour indiquer que c'est une recherche directe 
        response += `_Результаты прямого поиска каталога (без использования AI)_`;

        // Ajouter le message formaté au chat
        addMessage(response, false);
    } function showAutocompleteResults(query) {
        if (!productCatalog || productCatalog.length === 0 || query.length < 2) return;

        const searchTerm = query.toLowerCase();

        // Chercher dans le catalogue
        const matches = productCatalog
            .filter(p => {
                const name = p['Наименование'] ? p['Наименование'].toLowerCase() : '';
                const cat = p['Категория'] ? p['Категория'].toLowerCase() : '';
                const code = p['Артикул'] ? p['Артикул'].toLowerCase() : '';
                const vendor = p['Производитель'] ? p['Производитель'].toLowerCase() : '';

                return name.includes(searchTerm) ||
                    cat.includes(searchTerm) ||
                    code.includes(searchTerm) ||
                    vendor.includes(searchTerm);
            })
            .slice(0, 5);

        // Afficher les résultats
        if (!autocompleteResults) return;
        autocompleteResults.innerHTML = '';

        if (matches.length > 0) {
            matches.forEach(product => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = `
                    <strong>${product['Наименование'] || 'Без названия'}</strong>
                    ${product['Артикул'] ? `<span class="autocomplete-code">Арт. ${product['Артикул']}</span>` : ''}
                    ${product['Цена'] ? `<span class="autocomplete-price">${product['Цена']} ₽</span>` : ''}
                `;

                div.addEventListener('click', () => {
                    userInput.value = `@${product['Наименование']}`;
                    autocompleteResults.innerHTML = '';
                    autocompleteResults.style.display = 'none';
                });

                autocompleteResults.appendChild(div);
            });

            autocompleteResults.style.display = 'block';
        } else {
            autocompleteResults.style.display = 'none';
        }
    }

    function showProductHistory() {
        if (!productHistory || productHistory.length === 0) {
            addMessage("У вас пока нет истории просмотра товаров.", false);
            return;
        }

        let response = "**История просмотренных товаров:**\n\n";

        productHistory.forEach((product, index) => {
            response += `**${index + 1}. ${product['Наименование'] || 'Товар без названия'}**\n`;

            if (product['Цена']) {
                response += `💰 <span style="color:red;font-weight:bold;">Цена: ${product['Цена']} руб.</span>\n`;
            }

            if (product['Категория']) {
                response += `📂 Категория: ${product['Категория']}\n`;
            }

            if (product['Артикул']) {
                const art = product['Артикул'];
                response += `📝 Артикул: <a href="#" class="insert-artikul" data-artikul="${art}">${art}</a>\n`;
            }

            response += '\n';
        });

        addMessage(response, false);
    }

    // ---------------------
    // Fonctions de catalogue
    // ---------------------
    async function fetchCatalog() {
        if (!productList) return;

        productList.innerHTML = '<div class="product-item"><div class="product-item-name">Загрузка каталога...</div></div>';
        try {
            const resp = await fetch('/api/products');
            if (!resp.ok) throw new Error('Erreur de chargement du catalogue');
            const data = await resp.json();
            if (data.success && data.products) {
                productCatalog = data.products;
                filteredProducts = [...productCatalog];
                renderProductList();
                updateCatalogStats();
            } else {
                productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
            }
        } catch (e) {
            console.error('Erreur de chargement du catalogue:', e);
            productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ошибка загрузки каталога</div></div>';
            if (catalogStats) {
                catalogStats.textContent = 'Не удалось загрузить каталог';
            }
        }
    }

    function renderProductList() {
        if (!productList) return;

        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredProducts.length);
        productList.innerHTML = '';
        if (!filteredProducts.length) {
            productList.innerHTML = '<div class="product-item"><div class="product-item-name">Ничего не найдено</div></div>';
            renderPagination();
            return;
        }

        for (let i = start; i < end; i++) {
            const p = filteredProducts[i];
            const inStock = isProductInStock(p);

            // Infos additionnelles
            const articleCode = p['Артикул'] ? `<strong>Арт. ${p['Артикул']}</strong>` : '';
            const additionalInfo = [articleCode].filter(Boolean).join(', ');

            // URL du produit
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
                    <a href="#" class="product-link-button product-detail-trigger" data-index="${i}">Просмотр</a>
                    <div class="product-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет в наличии'}</div>
                </div>`;

            productList.appendChild(elem);
        }

        // Ajouter les écouteurs d'événements après avoir construit la liste
        document.querySelectorAll('.product-detail-trigger').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                if (!isNaN(index) && index >= 0 && index < filteredProducts.length) {
                    const product = filteredProducts[index];
                    showProductDetail(product);
                }
            });
        });

        renderPagination();
    }

    function renderPagination() {
        if (!catalogPagination) return;

        catalogPagination.innerHTML = '';
        if (filteredProducts.length <= itemsPerPage) return;

        const total = Math.ceil(filteredProducts.length / itemsPerPage);

        const prev = document.createElement('button');
        prev.className = 'pagination-btn';
        prev.textContent = '←';
        prev.disabled = currentPage === 1;
        prev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProductList();
            }
        });
        catalogPagination.appendChild(prev);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(total, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn';
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => {
                currentPage = i;
                renderProductList();
            });
            catalogPagination.appendChild(btn);
        }

        const next = document.createElement('button');
        next.className = 'pagination-btn';
        next.textContent = '→';
        next.disabled = currentPage === total;
        next.addEventListener('click', () => {
            if (currentPage < total) {
                currentPage++;
                renderProductList();
            }
        });
        catalogPagination.appendChild(next);
    }

    function updateCatalogStats() {
        if (!catalogStats) return;

        if (!productCatalog.length) {
            catalogStats.textContent = 'Каталог пуст';
            return;
        }

        const total = productCatalog.length;
        const inStockCount = productCatalog.filter(p => isProductInStock(p)).length;
        const categories = new Set(productCatalog.map(p => p['Категория']).filter(Boolean)).size;

        catalogStats.textContent = `Всего товаров: ${total} | В наличии: ${inStockCount} | Категорий: ${categories}`;
    }

    function isProductInStock(product) {
        if (!product || !product.hasOwnProperty('Наличие')) return false;

        const val = String(product['Наличие']).toLowerCase();
        return ['да', 'есть', 'в наличии', '1', 'true'].some(k => val.includes(k));
    }

    // ---------------------
    // Détail produit amélioré
    // ---------------------
    function showProductDetail(product) {
        if (!product || !productDetailModal) return;

        selectedProduct = product;

        // URL du produit
        const productUrl = product['URL товара'] ? product['URL товара'] : '#';

        // Titre avec lien
        if (productDetailTitle) {
            productDetailTitle.innerHTML = `<a href="${productUrl}" target="_blank" class="product-link">${product['Наименование'] || 'Название неизвестно'}</a>`;
        }

        // Afficher le prix
        if (productDetailPrice) {
            productDetailPrice.textContent = product['Цена'] ? `${product['Цена']} ₽` : 'Цена не указана';
        }

        // Détermine si le produit est en stock
        const inStock = isProductInStock(product);
        if (productDetailStock) {
            productDetailStock.textContent = inStock ? 'В наличии' : 'Нет в наличии';
            productDetailStock.className = inStock ? 'product-detail-stock stock-available' : 'product-detail-stock stock-unavailable';
        }

        // Afficher les informations de base
        if (productDetailCode) {
            productDetailCode.textContent = product['Артикул'] || '-';
        }

        if (productDetailCategory) {
            productDetailCategory.textContent = product['Категория'] || '-';
        }

        // Repositionner la section des questions rapides après le prix et le stock
        if (productQuickQuestions) {
            const infoSection = document.querySelector('.product-detail-info');
            if (infoSection) {
                infoSection.insertBefore(productQuickQuestions, infoSection.firstChild.nextSibling.nextSibling);
            }
        }

        // Afficher la description si disponible
        if (productDetailDescription) {
            productDetailDescription.textContent = product['Описание'] || product['Краткое описание'] || '-';
            const descSection = document.getElementById('product-detail-description-section');
            if (descSection) {
                descSection.style.display = product['Описание'] || product['Краткое описание'] ? 'block' : 'none';
            }
        }

        // Table détails
        if (productDetailTable) {
            productDetailTable.innerHTML = `<tr><th>Артикул</th><td>${product['Артикул'] || '-'}</td></tr><tr><th>Категория</th><td>${product['Категория'] || '-'}</td></tr>`;
            const exclude = ['Наименование', 'Артикул', 'Категория', 'Цена', 'Описание', 'Краткое описание', 'Наличие', 'URL товара'];
            Object.entries(product).forEach(([k, v]) => {
                if (!exclude.includes(k) && v) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<th>${k}</th><td>${v}</td>`;
                    productDetailTable.appendChild(row);
                }
            });
        }

        // Mise à jour des questions rapides avec le nom du produit courant
        const name = product['Наименование'] || 'этот товар';
        document.querySelectorAll('.quick-question-btn').forEach(btn => {
            // Conserver une seule fois le gabarit d'origine
            if (!btn.dataset.origQuestion) {
                btn.dataset.origQuestion = btn.dataset.question;
            }
            // Générer la question spécifique au produit affiché
            btn.dataset.question = btn.dataset.origQuestion.replace('[PRODUCT_NAME]', name);
        });

        // Ajouter à l'historique et afficher la modal
        addToProductHistory(product);
        productDetailModal.style.display = 'flex';
    }

    function askProductQuestion(question) {
        if (!question) return;

        // S'assurer d'inclure le prix dans les questions pertinentes
        if (question.includes('характеристик') ||
            question.includes('аналог') ||
            question.includes('комплектующ')) {

            if (!question.includes('цен') && !question.includes('стоим')) {
                question = question + ' (включая информацию о цене)';
            }
        }

        addMessage(question, true);
        if (productDetailModal) {
            productDetailModal.style.display = 'none';
        }
        sendMessageWithSSE(question);
    }

    function areProductsEqual(p1, p2) {
        if (!p1 || !p2) return false;
        if (p1['Артикул'] && p2['Артикул']) return p1['Артикул'] === p2['Артикул'];
        return p1['Наименование'] === p2['Наименование'];
    }

    // ---------------------
    // Fonctions de navigation du catalogue
    // ---------------------
    function openCatalogSidebar() {
        if (!catalogSidebar) return;

        catalogSidebar.style.display = 'flex';
        fetchCatalog();
    }

    function closeCatalogSidebar() {
        if (!catalogSidebar) return;

        catalogSidebar.style.display = 'none';
    }

    // ---------------------
    // Recherche
    // ---------------------
    function searchProducts(query) {
        if (!query) {
            filteredProducts = [...productCatalog];
        } else {
            const term = query.toLowerCase();
            filteredProducts = productCatalog.filter(p => {
                // Vérifier que le produit existe avant d'accéder à ses propriétés
                if (!p) return false;

                return ['Наименование', 'Артикул', 'Категория', 'Описание', 'Производитель']
                    .some(f => p[f] && String(p[f]).toLowerCase().includes(term));
            });
        }
        currentPage = 1;
        renderProductList();
    }
});