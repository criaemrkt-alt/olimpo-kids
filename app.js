/* app.js */

// Utilitário de navegação simples
async function navigate(route) {
  const appDiv = document.getElementById('app');
  window.scrollTo(0, 0);

  if (route === 'home') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-olympus');
    appDiv.innerHTML = renderHome();
  } else if (route === 'login' || route === 'register') {
    document.body.classList.remove('theme-olympus');
    document.body.classList.add('theme-dark');
    appDiv.innerHTML = renderAuth(route);
  } else if (route === 'catalog') {
    document.body.classList.remove('theme-olympus');
    document.body.classList.add('theme-dark');
    if (!currentUser) {
      navigate('login'); // Protege rota
      return;
    }
    
    // Fetch real data
    if (ALL_PRODUCTS.length === 0) {
      const { data: products } = await supabaseClient.from('products').select('*').order('id');
      if (products) ALL_PRODUCTS = products;
    }
    await fetchUserData();

    appDiv.innerHTML = renderCatalog();
    lucide.createIcons();
  } else {
    appDiv.innerHTML = `<h2>404 - Página não encontrada</h2>`;
  }
  lucide.createIcons(); // inicializa os ícones lucide se houver
}

// ----------------- RENDER METHODS ----------------- //

function renderNavbar() {
  const isLogged = !!currentUser;
  return `
    <nav class="navbar fade-in">
      <div class="brand" onclick="navigate('${isLogged ? 'catalog' : 'home'}')">Olimpo Kids</div>
      <div>
        ${isLogged 
          ? `<button class="btn btn-outline btn-sm" onclick="logout()">Sair</button>`
          : `<button class="btn btn-outline btn-sm" onclick="navigate('login')">Entrar</button>`
        }
      </div>
    </nav>
  `;
}

function renderHome() {
  const isLogged = !!currentUser;
  return `
    <nav class="navbar navbar-olympus fade-in">
      <div class="brand" onclick="navigate('${isLogged ? 'catalog' : 'home'}')">Olimpo Kids</div>
      <div>
        ${isLogged 
          ? `<button class="btn btn-premium btn-sm" onclick="navigate('catalog')">Ir para Catálogo</button>`
          : `<button class="btn btn-primary btn-sm" onclick="navigate('login')">Entrar na Biblioteca</button>`
        }
      </div>
    </nav>
    <div class="sales-page">
      <section class="hero-olympus fade-in">
        <div class="hero-content">
          <div class="badge-sales">🔥 De Capivaras a K-Pop!</div>
          <h1 class="hero-title">O Antídoto Perfeito Contra o<br> Vício no Celular</h1>
          <p class="hero-subtitle">Desintoxicação digital na prática: prenda a atenção do seu filho por horas com dezenas de materiais imprimíveis dos temas que eles <strong>já amam</strong> na internet!</p>
          <button class="btn btn-premium btn-lg pulse-anim" onclick="navigate('register')">
            Quero Acessar as Atividades <i data-lucide="sparkles"></i>
          </button>
          <div style="margin-top: 1rem; font-size: 0.9rem; color: #DC143C; font-weight: 700; white-space: nowrap;">
            ⏳ Promoção de Lançamento expira em breve!
          </div>
        </div>
      </section>
      
      <section class="benefits-section fade-in">
        <h2 class="section-title-center">O Método Exato Para Tirar o Tédio (Sem Internet)</h2>
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="icon-wrapper"><i data-lucide="brain"></i></div>
            <h3>Universos Populares</h2>
            <p>Use Dinossauros, BTS e Capivaras a favor do encanto fora das telas.</p>
          </div>
          <div class="benefit-card">
            <div class="icon-wrapper"><i data-lucide="image"></i></div>
            <h3>+80 Atividades</h2>
            <p>Imprima e brinque na hora! Desde jogos a exercícios criativos originais.</p>
          </div>
          <div class="benefit-card">
            <div class="icon-wrapper"><i data-lucide="printer"></i></div>
            <h3>Acesso Imediato</h2>
            <p>Olimpo Kids não enrola. É assinatura digital pra você imprimir onde e quando quiser.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAuth(type) {
  const isLogin = type === 'login';
  return `
    <div class="auth-container fade-in">
      <div class="brand" style="position:absolute; top: 2rem; left: 2rem; cursor:pointer;" onclick="navigate('home')">Olimpo Kids</div>
      
      <div class="auth-box">
        <h2>${isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <form id="authForm" onsubmit="handleAuth(event, '${type}')">
          ${!isLogin ? `
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" id="name" class="form-control" required placeholder="Seu nome">
            </div>
          ` : ''}
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" id="email" class="form-control" required placeholder="seu@email.com">
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" id="password" class="form-control" required placeholder="********">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 1rem;">
            ${isLogin ? 'Entrar' : 'Continuar para atividades'}
          </button>
        </form>
        <div class="auth-toggle" onclick="navigate('${isLogin ? 'register' : 'login'}')">
          ${isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
        </div>
      </div>
    </div>
  `;
}

function renderCatalog() {
  // Limpeza segura caso alguma linha no DB não tenha title
  const getTitle = (p) => (p.title || '').toLowerCase();

  // 1. Filtrar Jogo da Memória (oculto por hora)
  const CATALOG = ALL_PRODUCTS.filter(p => !getTitle(p).includes('memória'));
  
  // 2. Criar as "Séries" / Categorias 
  const originais = CATALOG.filter(p => getTitle(p).includes('olimpo'));
  const popTrends = CATALOG.filter(p => ['bts', 'dorameira', 'divertidamente'].some(word => getTitle(p).includes(word)));
  const aventura = CATALOG.filter(p => ['dinos', 'capivara', 'bosque', 'caktos'].some(word => getTitle(p).includes(word)));
  const fofos = CATALOG.filter(p => !originais.includes(p) && !popTrends.includes(p) && !aventura.includes(p));

  return `
    ${renderNavbar()}
    <div class="catalog-view fade-in">
      
      <!-- Banner de Assinatura -->
      ${!(currentProfile && currentProfile.is_subscriber) ? `
      <div class="banner-subscription fade-in">
        <div class="badge" style="position:relative; display:inline-block; margin-bottom:1rem; background:#FF3366; color:#fff; top:0; right:0;">🔥 OFERTA LIMITADA</div>
        <h2>Desbloqueie toda a biblioteca por R$ 19,90/mês</h2>
        <p style="font-size: 1.1rem;">Tenha acesso VIP a todo o conteúdo garantido pelo <strong>preço de lançamento</strong>.</p>
        <p style="color: var(--success); font-weight: 800; margin-bottom: 2rem;"><i data-lucide="sparkles" style="width:16px;height:16px;"></i> Novos jogos adicionados TODA SEMANA!</p>
        <button class="btn btn-premium pulse-anim" onclick="subscribe()">Assinar e Garantir o Preço <i data-lucide="crown"></i></button>
      </div>` : ''}

      ${originais.length > 0 ? `
      <div class="row-container">
        <h3 class="section-title">✨ Originais Olimpo Kids</h3>
        <button class="scroll-btn left" onclick="scrollRow('row-originals', -1)"><i data-lucide="chevron-left"></i></button>
        <div class="catalog-row" id="row-originals">
          ${originais.map(product => renderProductCard(product)).join('')}
        </div>
        <button class="scroll-btn right" onclick="scrollRow('row-originals', 1)"><i data-lucide="chevron-right"></i></button>
      </div>` : ''}
      
      ${popTrends.length > 0 ? `
      <div class="row-container">
        <h3 class="section-title">🔥 Sucessos da Internet</h3>
        <button class="scroll-btn left" onclick="scrollRow('row-trends', -1)"><i data-lucide="chevron-left"></i></button>
        <div class="catalog-row" id="row-trends">
          ${popTrends.map(product => renderProductCard(product)).join('')}
        </div>
        <button class="scroll-btn right" onclick="scrollRow('row-trends', 1)"><i data-lucide="chevron-right"></i></button>
      </div>` : ''}

      ${aventura.length > 0 ? `
      <div class="row-container">
        <h3 class="section-title">🌿 Aventura & Animais</h3>
        <button class="scroll-btn left" onclick="scrollRow('row-aventura', -1)"><i data-lucide="chevron-left"></i></button>
        <div class="catalog-row" id="row-aventura">
          ${aventura.map(product => renderProductCard(product)).join('')}
        </div>
        <button class="scroll-btn right" onclick="scrollRow('row-aventura', 1)"><i data-lucide="chevron-right"></i></button>
      </div>` : ''}
      
      ${fofos.length > 0 ? `
      <div class="row-container">
        <h3 class="section-title">💖 Para Relaxar</h3>
        <button class="scroll-btn left" onclick="scrollRow('row-fofos', -1)"><i data-lucide="chevron-left"></i></button>
        <div class="catalog-row" id="row-fofos">
          ${fofos.map(product => renderProductCard(product)).join('')}
        </div>
        <button class="scroll-btn right" onclick="scrollRow('row-fofos', 1)"><i data-lucide="chevron-right"></i></button>
      </div>` : ''}

      <br><br><br>
    </div>
  `;
}

function getProductState(product) {
  if (product.is_free) return 'FREE';
  if (currentProfile && currentProfile.is_subscriber) return 'DESBLOQUEADO';
  if (userPurchases.includes(product.id)) return 'DESBLOQUEADO';
  return 'BLOQUEADO';
}

function renderProductCard(product) {
  const state = getProductState(product);
  
  let badgeHtml = '';
  let buttonHtml = '';
  
  if (state === 'FREE') {
    badgeHtml = `<div class="badge badge-free">GRÁTIS</div>`;
    buttonHtml = `<button class="btn btn-primary btn-sm" style="width:100%;" onclick="downloadPdf(${product.id})">Baixar grátis <i data-lucide="download"></i></button>`;
  } else if (state === 'BLOQUEADO') {
    badgeHtml = `<div class="badge badge-locked"><i data-lucide="lock" style="width:12px;height:12px;margin-bottom:-2px;"></i> BLOQUEADO</div>`;
    buttonHtml = `<button class="btn btn-primary btn-sm" style="width:100%;" onclick="buyItem(${product.id}, ${product.price})">Desbloquear R$${product.price.toFixed(2).replace('.', ',')}</button>`;
  } else if (state === 'DESBLOQUEADO') {
    badgeHtml = `<div class="badge badge-premium">PREMIUM</div>`;
    buttonHtml = `<button class="btn btn-success btn-sm" style="width:100%; background:var(--success); color:#fff;" onclick="downloadPdf(${product.id})">Baixar PDF <i data-lucide="download"></i></button>`;
  }

  return `
    <div class="product-card">
      ${badgeHtml}
      <img src="${product.cover_url}" alt="${product.title}">
      <div class="product-card-overlay">
        <h4 class="card-title">${product.title}</h4>
        ${buttonHtml}
      </div>
    </div>
  `;
}

// ----------------- ACTIONS & LOGIC ----------------- //

async function fetchUserData() {
  if (!currentUser) return;
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
  if (profile) {
    currentProfile = profile;
  } else {
    currentProfile = { is_subscriber: false }; // Fallback seguro
  }
  
  const { data: purchases } = await supabaseClient.from('user_purchases').select('product_id').eq('user_id', currentUser.id);
  if (purchases) userPurchases = purchases.map(p => p.product_id);
}

async function handleAuth(e, type) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orgText = btn.innerHTML;
  btn.innerHTML = 'Processando... <i data-lucide="loader-2" class="spin"></i>';
  btn.disabled = true;

  try {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (type === 'register') {
      const name = document.getElementById('name').value;
      const { data, error } = await supabaseClient.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      
      if (error) { 
        alert("Erro no cadastro: " + error.message); 
        return; 
      }
      
      if (data.user) {
        currentUser = data.user;
        // Salva Perfil Manualmente e ignora falhas de db no meio (extremamente robusto)
        await supabaseClient.from('profiles').upsert({ id: data.user.id, full_name: name, is_subscriber: false });
      }
      
      alert("Sucesso! Bem-vindo ao Olimpo Kids. Redirecionando...");
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email, password
      });
      
      if (error) { 
        let errorMsg = error.message;
        if (errorMsg.includes("Email not confirmed")) {
          errorMsg = "Você precisa confirmar seu e-mail antes de entrar, ou desativar a 'Confirmação de Email' no painel do Supabase!";
        } else if (errorMsg.includes("Invalid login credentials")) {
          errorMsg = "E-mail ou senha incorretos!";
        }
        alert("Erro no Login: " + errorMsg); 
        return; 
      }
      if (data.user) currentUser = data.user;
    }
    
    btn.innerHTML = 'Pronto! Autenticado.';
    setTimeout(() => { navigate('catalog'); }, 500);

  } catch (err) {
    alert("Ocorreu um problema de conexão: " + err.message);
  } finally {
    if (!currentUser) {
      btn.innerHTML = orgText;
      btn.disabled = false;
    }
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  currentProfile = null;
  navigate('home');
}

function subscribe() {
  const btn = document.querySelector('.btn-premium');
  if(btn) btn.innerHTML = 'Redirecionando... <i data-lucide="loader-2" class="spin"></i>';
  
  // Envia o cliente para a Lowify com o e-mail dele já acoplado no link
  const emailParam = currentUser ? `&email=${encodeURIComponent(currentUser.email)}` : '';
  const checkoutUrl = `https://pay.lowify.com.br/checkout.php?product_id=kU1epc${emailParam}`;
  
  window.location.href = checkoutUrl;
}

function buyItem(id, price) {
  const prod = ALL_PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  const title = (prod.title || '').toLowerCase();

  // Mapeamento dos PRODUTOS na Lowify 
  const checkoutMap = {
    'doces': 'txp1So',
    'caktos': '9mJmon',
    'bosque': 'PE4kVc',
    'capivara': 'e9UorW',
    'dinos': '0TxVp8',
    'dorameira': 'diT85S',
    'bts': '3ioW97',
    'divertidamente': 'Kt8GZP',
    'adesivos': 'bhq00w',
    'uno': '6tir3l',
    'bobbie': 'MM0fDE'
  };

  let lowifyId = null;
  for (const [key, value] of Object.entries(checkoutMap)) {
    if (title.includes(key)) {
      lowifyId = value;
      break;
    }
  }

  if (lowifyId) {
    // Mesma estratégia Premium de preenchimento automático para compra avulsa
    const emailParam = currentUser ? `&email=${encodeURIComponent(currentUser.email)}` : '';
    const checkoutUrl = `https://pay.lowify.com.br/checkout?product_id=${lowifyId}${emailParam}`;
    window.location.href = checkoutUrl;
  } else {
    alert("Produto sem link de checkout no momento. " + title);
  }
}

function downloadPdf(id) {
  alert("Iniciando download da atividade #" + id + "\nNo futuro isso baixará o PDF do Supabase Storage.");
}

function scrollRow(rowId, direction) {
  const row = document.getElementById(rowId);
  if (row) {
    const scrollAmount = row.clientWidth * 0.8; // Rola 80% da tela visível
    row.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
}

// ----------------- INIT ----------------- //
window.onload = async () => {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (session) {
      currentUser = session.user;
      navigate('catalog');
    } else {
      navigate('home');
    }
  } catch (err) {
    // Tratamento de falha silenciosa para evitar "Tela Preta"
    console.error("Falha ao iniciar o App:", err);
    document.getElementById('app').innerHTML = `
      <div style="text-align:center; padding: 5rem 2rem; color: #FF3366;">
        <h1>Oops! Erro de Conexão.</h1>
        <p>A comunicação com o Supabase falhou.</p>
        <p><strong>Detalhe Técnico:</strong> ${err.message || err.toString()}</p>
        <button class="btn btn-outline" style="margin-top:1rem;" onclick="location.reload()">Tentar Novamente</button>
      </div>
    `;
  }
};
