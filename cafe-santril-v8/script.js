// ============================================================
//  CONFIGURAÇÃO DO RESTAURANTE — 3 SALAS
// ============================================================

const HORAS_JANTAR = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
const DIAS_ABERTOS = [2, 3, 4, 5, 6]; // Ter–Sáb
const DIAS_NOMES   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

// Definição das 3 salas com as suas mesas reais
// capacidade: capacidade máxima da mesa
// Para mesas de 2 pessoas a capacidade é 2; as restantes têm capacidade 4+
const SALAS = [
    {
        id: 1,
        nome: 'Sala 1',
        descricao: '14 mesas · ambiente principal',
        mesas: [
            { id: 'S1-M1',  cap: 2 },
            { id: 'S1-M2',  cap: 2 },
            { id: 'S1-M3',  cap: 2 },
            { id: 'S1-M4',  cap: 2 },
            { id: 'S1-M5',  cap: 4 },
            { id: 'S1-M6',  cap: 4 },
            { id: 'S1-M7',  cap: 4 },
            { id: 'S1-M8',  cap: 4 },
            { id: 'S1-M9',  cap: 4 },
            { id: 'S1-M10', cap: 4 },
            { id: 'S1-M11', cap: 4 },
            { id: 'S1-M12', cap: 4 },
            { id: 'S1-M13', cap: 7 },
            { id: 'S1-M14', cap: 7 },
        ]
    },
    {
        id: 2,
        nome: 'Sala 2',
        descricao: '6 mesas · espaço mais íntimo',
        mesas: [
            { id: 'S2-M1', cap: 2 },
            { id: 'S2-M2', cap: 2 },
            { id: 'S2-M3', cap: 4 },
            { id: 'S2-M4', cap: 4 },
            { id: 'S2-M5', cap: 4 },
            { id: 'S2-M6', cap: 7 },
        ]
    },
    {
        id: 3,
        nome: 'Sala 3',
        descricao: '11 mesas · espaço amplo',
        mesas: [
            { id: 'S3-M1',  cap: 2 },
            { id: 'S3-M2',  cap: 2 },
            { id: 'S3-M3',  cap: 2 },
            { id: 'S3-M4',  cap: 2 }, // pode ser 2 ou 3/4 pessoas
            { id: 'S3-M5',  cap: 4 },
            { id: 'S3-M6',  cap: 4 },
            { id: 'S3-M7',  cap: 4 },
            { id: 'S3-M8',  cap: 4 },
            { id: 'S3-M9',  cap: 4 },
            { id: 'S3-M10', cap: 7 },
            { id: 'S3-M11', cap: 7 },
        ]
    }
];

// Total de mesas para referência
const TOTAL_MESAS = SALAS.reduce((acc, s) => acc + s.mesas.length, 0);

// ============================================================
//  BASE DE DADOS  (localStorage)
// ============================================================

function iniciarBD() {
    let utilizadores = JSON.parse(localStorage.getItem('santril_users') || '[]');
    if (!utilizadores.some(u => u.email === 'admin@santril.pt')) {
        utilizadores.push({
            id: 1, nome: 'Administrador',
            email: 'admin@santril.pt', pass: 'admin123',
            tipo: 'admin', criado: new Date().toLocaleDateString('pt-PT')
        });
        localStorage.setItem('santril_users', JSON.stringify(utilizadores));
    }
    if (!localStorage.getItem('santril_mensagens'))
        localStorage.setItem('santril_mensagens', '[]');
    if (!localStorage.getItem('santril_reservas'))
        localStorage.setItem('santril_reservas', '[]');
    verificarResetSemanal();
}

function getUtilizadores() { return JSON.parse(localStorage.getItem('santril_users') || '[]'); }
function getMensagens()    { return JSON.parse(localStorage.getItem('santril_mensagens') || '[]'); }
function getReservas()     { return JSON.parse(localStorage.getItem('santril_reservas') || '[]'); }
function getSessao()       { const s = localStorage.getItem('santril_sessao'); return s ? JSON.parse(s) : null; }

// ============================================================
//  RESET SEMANAL AUTOMÁTICO
// ============================================================

function getSegundaFeira(dataRef) {
    const d = new Date(dataRef);
    const dia = d.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function verificarResetSemanal() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const segundaAtual = getSegundaFeira(hoje);
    const ultimaStr = localStorage.getItem('santril_ultima_semana');
    const ultima = ultimaStr ? new Date(ultimaStr) : null;
    if (!ultima || ultima < segundaAtual) {
        let reservas = getReservas().filter(r => {
            const d = new Date(r.dataISO + 'T00:00:00');
            d.setHours(0, 0, 0, 0);
            return d >= segundaAtual;
        });
        localStorage.setItem('santril_reservas', JSON.stringify(reservas));
        localStorage.setItem('santril_ultima_semana', segundaAtual.toISOString());
    }
}

// ============================================================
//  NOTIFICAÇÕES
// ============================================================

function mostrarNotificacao(msg, tipo) {
    const notif = document.getElementById('notificacao-topo');
    const msgEl = document.getElementById('notificacao-msg');
    if (!notif || !msgEl) return;
    msgEl.textContent = msg;
    notif.style.display = 'flex';
    notif.style.borderBottomColor = tipo === 'erro' ? '#c06060' : '#d4af37';
    // Auto-fechar após 4 segundos
    clearTimeout(notif._timer);
    notif._timer = setTimeout(fecharNotificacao, 4000);
}

function fecharNotificacao() {
    const notif = document.getElementById('notificacao-topo');
    if (notif) notif.style.display = 'none';
}

// ============================================================
//  CONTADORES ANIMADOS (home page)
// ============================================================

function animarContadores() {
    const contadores = [
        { id: 'cnt-anos',   target: 20, duracao: 1800 },
        { id: 'cnt-mesas',  target: 7,  duracao: 900  },
        { id: 'cnt-pratos', target: 12, duracao: 1200 },
        { id: 'cnt-dias',   target: 6,  duracao: 800  },
    ];

    contadores.forEach(({ id, target, duracao }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const inicio = performance.now();
        function atualizar(agora) {
            const progresso = Math.min((agora - inicio) / duracao, 1);
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progresso, 4);
            el.textContent = Math.floor(ease * target);
            if (progresso < 1) requestAnimationFrame(atualizar);
            else el.textContent = target;
        }
        requestAnimationFrame(atualizar);
    });
}

// ============================================================
//  OBSERVER — animar elementos quando entram no viewport
// ============================================================

function iniciarAnimacoesEntrada() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animar-entrada').forEach(el => observer.observe(el));
}

// ============================================================
//  ANO AUTOMÁTICO NO RODAPÉ
// ============================================================

function atualizarAnoRodape() {
    const el = document.getElementById('rodape-ano');
    if (el) {
        const ano = new Date().getFullYear();
        el.textContent = `© ${ano} Restaurante Santril. Todos os direitos reservados.`;
    }
}

// ============================================================
//  FILTRO DE MENU
// ============================================================

function filtrarMenu(categoria, btnClicado) {
    // Atualizar botões ativos
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
    if (btnClicado) btnClicado.classList.add('ativo');

    const cards = document.querySelectorAll('#menu-cards .menu-card');
    cards.forEach(card => {
        if (categoria === 'todos' || card.dataset.categoria === categoria) {
            card.classList.remove('oculto');
            // Animação de entrada
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = 'fadeUp 0.4s ease forwards';
        } else {
            card.classList.add('oculto');
        }
    });
}

// ============================================================
//  ESTADO LOADING NOS BOTÕES
// ============================================================

function setBtnLoading(id, ativo) {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (ativo) {
        btn.classList.add('btn-loading');
        btn._textoOriginal = btn.textContent;
        btn.textContent = 'A processar...';
    } else {
        btn.classList.remove('btn-loading');
        if (btn._textoOriginal) btn.textContent = btn._textoOriginal;
    }
}

// ============================================================
//  MENU HAMBÚRGUER (MOBILE)
// ============================================================

function toggleMenuMobile() {
    const btn = document.getElementById('menu-hamburguer');
    const nav = document.getElementById('nav-mobile');
    if (!btn || !nav) return;
    const aberto = nav.classList.toggle('aberto');
    btn.classList.toggle('aberto', aberto);
    // Impede scroll do body quando menu está aberto
    document.body.style.overflow = aberto ? 'hidden' : '';
}

function fecharMenuMobile() {
    const btn = document.getElementById('menu-hamburguer');
    const nav = document.getElementById('nav-mobile');
    if (!btn || !nav) return;
    nav.classList.remove('aberto');
    btn.classList.remove('aberto');
    document.body.style.overflow = '';
}

function navegarMobile(pagina) {
    fecharMenuMobile();
    navegarPara(pagina);
}

// ============================================================
//  NAVEGAÇÃO
// ============================================================

const PAGINAS = ['home','sobre','menu','especialidades','galeria','reservas','contactos','login','admin'];

function navegarPara(pagina) {
    if (pagina === 'admin') {
        const sessao = getSessao();
        if (!sessao || sessao.tipo !== 'admin') {
            mostrarNotificacao('Acesso restrito ao administrador.', 'erro');
            return;
        }
    }

    PAGINAS.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.style.display = 'none';
    });

    const alvo = document.getElementById('page-' + pagina);
    if (alvo) {
        alvo.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('ativo', link.dataset.page === pagina);
    });
    fecharMenuMobile();

    if (pagina === 'home')     setTimeout(animarContadores, 300);
    if (pagina === 'home')     setTimeout(iniciarAnimacoesEntrada, 400);
    if (pagina === 'admin')    carregarAdmin();
    if (pagina === 'reservas') iniciarPaginaReservas();
    if (pagina === 'galeria')  iniciarGaleria();
}

// ============================================================
//  NAVBAR — atualizar utilizador
// ============================================================

function atualizarNavbar() {
    const sessao = getSessao();
    const areaEl = document.getElementById('area-utilizador');
    if (!areaEl) return;

    if (sessao) {
        let html = `<div class="utilizador-info">
            <span class="utilizador-nome">Olá, ${sessao.nome.split(' ')[0]}</span>`;
        if (sessao.tipo === 'admin') {
            html += `<button class="btn-reservar" onclick="navegarPara('admin')">ADMIN</button>`;
        }
        html += `<button class="btn-sair" onclick="fazerLogout()">Sair</button></div>`;
        areaEl.innerHTML = html;
    } else {
        areaEl.innerHTML = `<button class="btn-reservar" onclick="navegarPara('login')">ENTRAR</button>`;
    }
}

// ============================================================
//  LOGIN
// ============================================================

function fazerLogin() {
    const email  = document.getElementById('login-email').value.trim();
    const pass   = document.getElementById('login-pass').value;
    const erroEl = document.getElementById('login-erro');
    erroEl.style.display = 'none';

    if (!email || !pass) {
        erroEl.textContent = 'Por favor preencha todos os campos.';
        erroEl.style.display = 'block';
        return;
    }

    setBtnLoading('btn-login', true);

    // Simular tempo de verificação (realismo)
    setTimeout(() => {
        setBtnLoading('btn-login', false);
        const user = getUtilizadores().find(u => u.email === email && u.pass === pass);
        if (!user) {
            erroEl.textContent = 'Email ou palavra-passe incorretos.';
            erroEl.style.display = 'block';
            return;
        }
        localStorage.setItem('santril_sessao', JSON.stringify(user));
        atualizarNavbar();
        document.getElementById('login-email').value = '';
        document.getElementById('login-pass').value  = '';
        mostrarNotificacao(`Bem-vindo de volta, ${user.nome.split(' ')[0]}! 👋`, 'ok');
        if (user.tipo === 'admin') navegarPara('admin');
        else navegarPara('reservas');
    }, 600);
}

// ============================================================
//  REGISTO
// ============================================================

function fazerRegisto() {
    const nome   = document.getElementById('reg-nome').value.trim();
    const email  = document.getElementById('reg-email').value.trim();
    const pass   = document.getElementById('reg-pass').value;
    const pass2  = document.getElementById('reg-pass2').value;
    const erroEl = document.getElementById('registo-erro');
    const okEl   = document.getElementById('registo-ok');
    erroEl.style.display = okEl.style.display = 'none';

    if (!nome || !email || !pass || !pass2) {
        erroEl.textContent = 'Por favor preencha todos os campos.';
        erroEl.style.display = 'block'; return;
    }
    if (pass.length < 6) {
        erroEl.textContent = 'A palavra-passe deve ter pelo menos 6 caracteres.';
        erroEl.style.display = 'block'; return;
    }
    if (pass !== pass2) {
        erroEl.textContent = 'As palavras-passe não coincidem.';
        erroEl.style.display = 'block'; return;
    }

    const utilizadores = getUtilizadores();
    if (utilizadores.some(u => u.email === email)) {
        erroEl.textContent = 'Já existe uma conta com esse email.';
        erroEl.style.display = 'block'; return;
    }

    setBtnLoading('btn-registo', true);

    setTimeout(() => {
        setBtnLoading('btn-registo', false);
        utilizadores.push({
            id: Date.now(), nome, email, pass,
            tipo: 'utilizador', criado: new Date().toLocaleDateString('pt-PT')
        });
        localStorage.setItem('santril_users', JSON.stringify(utilizadores));
        okEl.textContent = 'Conta criada com sucesso! Pode agora fazer login.';
        okEl.style.display = 'block';
        mostrarNotificacao('Conta criada com sucesso! Faça login para continuar.', 'ok');
        ['reg-nome','reg-email','reg-pass','reg-pass2'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }, 700);
}

// ============================================================
//  LOGOUT
// ============================================================

function fazerLogout() {
    const sessao = getSessao();
    const nome = sessao ? sessao.nome.split(' ')[0] : '';
    localStorage.removeItem('santril_sessao');
    atualizarNavbar();
    mostrarNotificacao(`Até logo, ${nome}! Obrigado pela visita.`, 'ok');
    navegarPara('home');
}

// ============================================================
//  TROCAR TAB LOGIN/REGISTO
// ============================================================

function trocarTab(qual) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('ativo'));
    if (qual === 'login') {
        tabs[0].classList.add('ativo');
        document.getElementById('form-login-div').style.display   = 'block';
        document.getElementById('form-registo-div').style.display = 'none';
    } else {
        tabs[1].classList.add('ativo');
        document.getElementById('form-login-div').style.display   = 'none';
        document.getElementById('form-registo-div').style.display = 'block';
    }
}

// ============================================================
//  ESPECIALIDADES TABS
// ============================================================

function mostrarPrato(index) {
    document.querySelectorAll('.prato-conteudo').forEach((el, i) => {
        el.style.display = i === index ? 'grid' : 'none';
    });
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('ativo', i === index);
    });
}

// ============================================================
//  DATAS E DISPONIBILIDADE (RESERVAS)
// ============================================================

function gerarDatasDisponiveis() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() + 14);
    const datas = [];
    const cursor = new Date(hoje);
    while (cursor <= limite) {
        if (DIAS_ABERTOS.includes(cursor.getDay())) datas.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return datas;
}

function formatarDataISO(d) { return d.toISOString().split('T')[0]; }

function formatarDataPT(d) {
    const dia = DIAS_NOMES[d.getDay()];
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    return `${dia}, ${dd}/${mm}`;
}

function mesasOcupadasParaDataHora(dataISO, hora) {
    return getReservas().filter(r => r.dataISO === dataISO && r.hora === hora).map(r => r.mesa);
}

function horasComVagasParaData(dataISO) {
    const totalMesas = SALAS.reduce((acc, s) => acc + s.mesas.length, 0);
    return HORAS_JANTAR.filter(h => mesasOcupadasParaDataHora(dataISO, h).length < totalMesas);
}

// Mesas livres numa sala para data/hora/nPessoas
function mesasLivresSala(sala, dataISO, hora, nPessoas) {
    const ocupadas = mesasOcupadasParaDataHora(dataISO, hora);
    return sala.mesas.filter(m => !ocupadas.includes(m.id) && m.cap >= nPessoas);
}

function preencherDatas() {
    const sel = document.getElementById('res-data');
    if (!sel) return;
    sel.innerHTML = '<option value="">— escolher data —</option>';
    gerarDatasDisponiveis().forEach(d => {
        const iso = formatarDataISO(d);
        const opt = document.createElement('option');
        opt.value = iso;
        opt.textContent = formatarDataPT(d);
        sel.appendChild(opt);
    });
}

function atualizarHorasDisponiveis() {
    const dataISO = document.getElementById('res-data').value;
    const selHora = document.getElementById('res-hora');

    selHora.innerHTML = '<option value="">— escolher hora —</option>';
    limparSalasMesas();
    if (!dataISO) return;

    const horas = horasComVagasParaData(dataISO);
    if (horas.length === 0) {
        selHora.innerHTML = '<option value="">Sem vagas nesta data</option>';
        mostrarNotificacao('Não há vagas disponíveis nesta data. Escolha outro dia.', 'erro');
        return;
    }
    const totalMesas = SALAS.reduce((acc, s) => acc + s.mesas.length, 0);
    horas.forEach(h => {
        const livres = totalMesas - mesasOcupadasParaDataHora(dataISO, h).length;
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = `${h}  (${livres} mesa${livres !== 1 ? 's' : ''} livre${livres !== 1 ? 's' : ''})`;
        selHora.appendChild(opt);
    });
}

function verificarNPessoas() {
    const val   = document.getElementById('res-pessoas').value;
    const aviso = document.getElementById('aviso-grupo-grande');
    const btn   = document.getElementById('btn-confirmar-reserva');
    if (val === '8') {
        if (aviso) aviso.style.display = 'block';
        if (btn)   btn.style.display   = 'none';
        limparSalasMesas();
    } else {
        if (aviso) aviso.style.display = 'none';
        if (btn)   btn.style.display   = '';
    }
}

function atualizarSalasDisponiveis() {
    const val      = document.getElementById('res-pessoas').value;
    if (val === '8') return; // grupo grande — não mostrar salas

    const dataISO  = document.getElementById('res-data').value;
    const hora     = document.getElementById('res-hora').value;
    const nPessoas = parseInt(val);
    const grid     = document.getElementById('salas-grid');

    limparSalasMesas();
    if (!dataISO || !hora || !nPessoas) return;

    grid.innerHTML = '';
    let alguma = false;

    SALAS.forEach(sala => {
        const livres = mesasLivresSala(sala, dataISO, hora, nPessoas);
        const disponivel = livres.length > 0;
        if (disponivel) alguma = true;

        const card = document.createElement('div');
        card.className = 'sala-card' + (disponivel ? '' : ' sala-indisponivel');
        card.dataset.salaId = sala.id;
        card.innerHTML = `
            <span class="sala-card-check">&#10003;</span>
            <div class="sala-card-nome">${sala.nome}</div>
            <div class="sala-card-info">${sala.descricao}</div>
            <div class="sala-card-vagas ${disponivel ? 'tem-vagas' : 'sem-vagas'}">
                ${disponivel
                    ? `${livres.length} mesa${livres.length !== 1 ? 's' : ''} disponivel${livres.length !== 1 ? 'eis' : ''}`
                    : 'Sem vagas para ' + nPessoas + ' pessoas'}
            </div>`;
        if (disponivel) card.onclick = () => selecionarSala(sala.id, dataISO, hora, nPessoas);
        grid.appendChild(card);
    });

    if (!alguma) mostrarNotificacao('Sem mesas disponíveis para este número de pessoas neste horário.', 'erro');
}

function selecionarSala(salaId, dataISO, hora, nPessoas) {
    document.querySelectorAll('.sala-card').forEach(c => c.classList.remove('selecionada'));
    const card = document.querySelector(`.sala-card[data-sala-id="${salaId}"]`);
    if (card) card.classList.add('selecionada');

    const sala   = SALAS.find(s => s.id === salaId);
    const livres = mesasLivresSala(sala, dataISO, hora, nPessoas);
    const sel    = document.getElementById('res-mesa');
    const grupo  = document.getElementById('grupo-mesa');

    sel.innerHTML = '<option value="">— escolher mesa —</option>';
    livres.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        const num = m.id.replace('S' + salaId + '-M', '');
        opt.textContent = `Mesa ${num}  (até ${m.cap} pessoa${m.cap !== 1 ? 's' : ''})`;
        sel.appendChild(opt);
    });
    grupo.style.display = 'block';
}

function limparSalasMesas() {
    const grid  = document.getElementById('salas-grid');
    const grupo = document.getElementById('grupo-mesa');
    const sel   = document.getElementById('res-mesa');
    if (grid)  grid.innerHTML = '<p style="color:#555;font-size:13px;font-style:italic;">Escolha primeiro a data, hora e número de pessoas.</p>';
    if (grupo) grupo.style.display = 'none';
    if (sel)   sel.innerHTML = '<option value="">— escolher mesa —</option>';
}

// ============================================================
//  FAZER RESERVA
// ============================================================

function fazerReserva() {
    const sessao  = getSessao();
    const dataISO = document.getElementById('res-data').value;
    const hora    = document.getElementById('res-hora').value;
    const mesa    = parseInt(document.getElementById('res-mesa').value);
    const pessoas = parseInt(document.getElementById('res-pessoas').value);
    const obs     = document.getElementById('res-obs').value.trim();
    const erroEl  = document.getElementById('res-erro');
    const okEl    = document.getElementById('res-ok');

    erroEl.style.display = okEl.style.display = 'none';

    if (!sessao) {
        erroEl.textContent = 'Tem de estar autenticado para fazer uma reserva.';
        erroEl.style.display = 'block'; return;
    }
    const mesaId  = document.getElementById('res-mesa').value;
    const pessoasVal = document.getElementById('res-pessoas').value;
    if (pessoasVal === '8') {
        erroEl.textContent = 'Para grupos de 8 ou mais pessoas, por favor contacte-nos diretamente pelo 253 992 211.';
        erroEl.style.display = 'block'; return;
    }
    if (!dataISO || !hora || !mesaId || !pessoas) {
        erroEl.textContent = 'Por favor preencha todos os campos (incluindo sala e mesa).';
        erroEl.style.display = 'block'; return;
    }

    const ocupadas = mesasOcupadasParaDataHora(dataISO, hora);
    if (ocupadas.includes(mesaId)) {
        erroEl.textContent = 'Essa mesa foi entretanto reservada. Por favor escolha outra.';
        erroEl.style.display = 'block';
        return;
    }

    setBtnLoading('btn-confirmar-reserva', true);

    setTimeout(() => {
        setBtnLoading('btn-confirmar-reserva', false);
        // Identificar a sala a partir do ID da mesa (ex: "S1-M3" -> sala 1)
        const salaNum = mesaId.startsWith('S') ? parseInt(mesaId[1]) : 0;
        const sala    = SALAS.find(s => s.id === salaNum);
        const nova = {
            id: Date.now(), userId: sessao.id, userName: sessao.nome,
            userEmail: sessao.email, dataISO, hora,
            mesa: mesaId,
            salaNome: sala ? sala.nome : '',
            pessoas: Number(pessoas), obs,
            criada: new Date().toLocaleString('pt-PT')
        };
        const reservas = getReservas();
        reservas.push(nova);
        localStorage.setItem('santril_reservas', JSON.stringify(reservas));

        const mesaNum = mesaId.replace(/S\d+-M/, '');
        okEl.textContent = `✓ Reserva confirmada — ${nova.salaNome}, Mesa ${mesaNum} às ${hora} para ${pessoas} pessoa${pessoas > 1 ? 's' : ''}`;
        okEl.style.display = 'block';
        okEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        mostrarNotificacao(`Reserva confirmada! ${nova.salaNome}, Mesa ${mesaNum} às ${hora} 🎉`, 'ok');

        document.getElementById('res-data').value     = '';
        document.getElementById('res-hora').innerHTML = '<option value="">— escolher primeiro a data —</option>';
        document.getElementById('res-pessoas').value  = '';
        document.getElementById('res-obs').value      = '';
        limparSalasMesas();
        carregarMinhasReservas();
    }, 700);
}

// ============================================================
//  MINHAS RESERVAS — mostra TODAS as reservas futuras do utilizador
// ============================================================

function carregarMinhasReservas() {
    const sessao = getSessao();
    const el     = document.getElementById('minhas-reservas');
    if (!el) return;

    if (!sessao) {
        el.innerHTML = '<p style="color:#555;font-size:14px;font-style:italic;">Faça login para ver as suas reservas.</p>';
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Apanhar TODAS as reservas futuras do utilizador, ordenadas por data/hora
    // Comparar como string para evitar problemas de tipo (number vs string)
    const minhas = getReservas()
        .filter(r => String(r.userId) === String(sessao.id))
        .filter(r => new Date(r.dataISO + 'T00:00:00') >= hoje)
        .sort((a, b) => a.dataISO.localeCompare(b.dataISO) || a.hora.localeCompare(b.hora));

    if (minhas.length === 0) {
        el.innerHTML = '<p style="color:#555;font-size:14px;font-style:italic;">Ainda não tem reservas futuras.</p>';
        return;
    }

    // Mostrar contador se tiver mais do que uma
    const header = minhas.length > 1
        ? `<p style="color:#888;font-size:13px;margin-bottom:16px;">${minhas.length} reservas encontradas</p>`
        : '';

    el.innerHTML = header + minhas.map(r => {
        const d = new Date(r.dataISO + 'T12:00:00');
        return `
        <div class="reserva-item">
            <div class="reserva-item-info">
                <div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Data</span>
                    <span class="reserva-detalhe-valor">${formatarDataPT(d)}</span>
                </div>
                <div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Hora</span>
                    <span class="reserva-detalhe-valor">${r.hora}</span>
                </div>
                <div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Sala</span>
                    <span class="reserva-detalhe-valor">${r.salaNome || 'Sala'}</span>
                </div>
                <div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Mesa</span>
                    <span class="reserva-detalhe-valor">${typeof r.mesa === 'string' ? r.mesa.replace(/S\d+-M/, '') : r.mesa}</span>
                </div>
                <div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Pessoas</span>
                    <span class="reserva-detalhe-valor">${r.pessoas}</span>
                </div>
                ${r.obs ? `<div class="reserva-detalhe">
                    <span class="reserva-detalhe-label">Obs.</span>
                    <span class="reserva-detalhe-valor">${r.obs}</span>
                </div>` : ''}
            </div>
            <button class="btn-eliminar" onclick="cancelarReserva(${r.id})">Cancelar</button>
        </div>`;
    }).join('');
}

function cancelarReserva(id) {
    if (!confirm('Tem a certeza que quer cancelar esta reserva?')) return;
    localStorage.setItem('santril_reservas', JSON.stringify(getReservas().filter(r => r.id !== id)));
    carregarMinhasReservas();
    mostrarNotificacao('Reserva cancelada.', 'ok');
}

// ============================================================
//  INICIAR PÁGINA DE RESERVAS
// ============================================================

function iniciarPaginaReservas() {
    const sessao     = getSessao();
    const avisoEl    = document.getElementById('reservas-aviso-login');
    const conteudoEl = document.getElementById('reservas-conteudo');

    if (!sessao) {
        if (avisoEl)    avisoEl.style.display    = 'block';
        if (conteudoEl) conteudoEl.style.display = 'none';
        return;
    }

    if (avisoEl)    avisoEl.style.display    = 'none';
    if (conteudoEl) conteudoEl.style.display = 'block';

    preencherDatas();
    limparSalasMesas();
    carregarMinhasReservas();

    ['res-erro','res-ok'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ============================================================
//  PAINEL ADMIN
// ============================================================

function carregarAdmin() {
    const utilizadores = getUtilizadores();
    const mensagens    = getMensagens();
    const reservas     = getReservas();
    const hoje         = new Date();
    hoje.setHours(0, 0, 0, 0);

    document.getElementById('stat-utilizadores').textContent = utilizadores.length;

    const reservasSemana = reservas.filter(r => new Date(r.dataISO + 'T00:00:00') >= hoje);
    document.getElementById('stat-reservas-hoje').textContent = reservasSemana.length;

    const mesasHoje = reservas.filter(r => r.dataISO === formatarDataISO(hoje)).map(r => r.mesa);
    document.getElementById('stat-mesas-livres').textContent = TOTAL_MESAS - new Set(mesasHoje).size;

    // Tabela reservas
    const tbody = document.getElementById('tabela-reservas-admin');
    if (tbody) {
        tbody.innerHTML = '';
        if (reservasSemana.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:#555;font-style:italic;text-align:center;padding:20px;">Sem reservas esta semana.</td></tr>';
        } else {
            reservasSemana
                .sort((a, b) => a.dataISO.localeCompare(b.dataISO) || a.hora.localeCompare(b.hora))
                .forEach(r => {
                    const d = new Date(r.dataISO + 'T12:00:00');
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${formatarDataPT(d)}</td>
                        <td>${r.hora}</td>
                        <td>${r.salaNome || ''} Mesa ${typeof r.mesa === 'string' ? r.mesa.replace(/S\d+-M/,'') : r.mesa}</td>
                        <td>${r.pessoas} pess.</td>
                        <td style="font-size:13px;">${r.userName}<br><span style="color:#666;font-size:11px;">${r.userEmail}</span></td>
                        <td style="color:#888;font-size:13px;">${r.obs || '—'}</td>
                        <td><button class="btn-eliminar" onclick="adminCancelarReserva(${r.id})">Cancelar</button></td>`;
                    tbody.appendChild(tr);
                });
        }
    }

    // Tabela utilizadores
    const tbodyU = document.getElementById('tabela-utilizadores');
    if (tbodyU) {
        tbodyU.innerHTML = '';
        utilizadores.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.nome}</td><td>${u.email}</td>
                <td><span class="${u.tipo === 'admin' ? 'badge-admin' : 'badge-user'}">${u.tipo}</span></td>
                <td>${u.tipo !== 'admin' ? `<button class="btn-eliminar" onclick="eliminarUtilizador(${u.id})">Remover</button>` : '—'}</td>`;
            tbodyU.appendChild(tr);
        });
    }

    // Avaliações
    renderAvalilacoesAdmin();
}

function adminCancelarReserva(id) {
    if (!confirm('Cancelar esta reserva?')) return;
    localStorage.setItem('santril_reservas', JSON.stringify(getReservas().filter(r => r.id !== id)));
    mostrarNotificacao('Reserva removida pelo administrador.', 'ok');
    carregarAdmin();
}

function eliminarUtilizador(id) {
    if (!confirm('Remover este utilizador?')) return;
    localStorage.setItem('santril_users', JSON.stringify(getUtilizadores().filter(u => u.id !== id)));
    mostrarNotificacao('Utilizador removido.', 'ok');
    carregarAdmin();
}

function limparReservasPassadas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const reservas = getReservas().filter(r => new Date(r.dataISO + 'T00:00:00') >= hoje);
    localStorage.setItem('santril_reservas', JSON.stringify(reservas));
    localStorage.setItem('santril_ultima_semana', getSegundaFeira(hoje).toISOString());
    mostrarNotificacao('Reservas antigas removidas com sucesso.', 'ok');
    carregarAdmin();
}

function filtrarGaleria(cat, btnClicado) {
    document.querySelectorAll('.galeria-filtros .filtro-btn').forEach(b => b.classList.remove('ativo'));
    if (btnClicado) btnClicado.classList.add('ativo');
    document.querySelectorAll('#galeria-grid .galeria-item').forEach(item => {
        const mostrar = cat === 'todos' || item.dataset.cat === cat;
        item.classList.toggle('oculto-galeria', !mostrar);
    });
}

// ============================================================
//  GALERIA
// ============================================================

function iniciarGaleria() {
    const sessao  = getSessao();
    const isAdmin = sessao?.tipo === 'admin';
    const adminBox = document.getElementById('galeria-admin-box');
    if (adminBox) adminBox.style.display = isAdmin ? 'block' : 'none';

    const fotosExtras = JSON.parse(localStorage.getItem('santril_galeria') || '[]');
    const grid = document.getElementById('galeria-grid');
    if (!grid) return;

    // Remover fotos extras anteriores
    grid.querySelectorAll('.galeria-item-extra').forEach(el => el.remove());

    fotosExtras.forEach((foto, index) => {
        const div = document.createElement('div');
        div.className = 'galeria-item galeria-item-extra';
        div.dataset.cat = foto.cat || 'extra';

        // Botões de admin (só visíveis para admin)
        const botoesAdmin = isAdmin ? `
            <div class="galeria-admin-btns" onclick="event.stopPropagation()">
                <button class="galeria-btn-editar" onclick="editarFotoGaleria(${index})" title="Editar nome">✏️</button>
                <button class="galeria-btn-apagar" onclick="apagarFotoGaleria(${index})" title="Apagar foto">🗑️</button>
            </div>` : '';

        div.innerHTML = `
            <img src="${foto.url}" alt="${foto.legenda}" onerror="this.parentElement.style.opacity='0.3'">
            <div class="galeria-overlay"><span>${foto.legenda}</span></div>
            ${botoesAdmin}`;

        div.onclick = () => abrirLightbox(foto.url, foto.legenda);
        grid.appendChild(div);
    });

    // Adicionar botões de editar/apagar nas fotos fixas se for admin
    atualizarBotoesAdminFixas(isAdmin);
}

function atualizarBotoesAdminFixas(isAdmin) {
    // Fotos fixas no HTML têm data-cat mas não são extras
    document.querySelectorAll('#galeria-grid .galeria-item:not(.galeria-item-extra)').forEach(item => {
        // Remover botões antigos
        item.querySelectorAll('.galeria-admin-btns').forEach(b => b.remove());
        if (!isAdmin) return;

        const img     = item.querySelector('img');
        const overlay = item.querySelector('.galeria-overlay span');
        if (!img || !overlay) return;

        const src     = img.src;
        const legenda = overlay.textContent;

        const btns = document.createElement('div');
        btns.className = 'galeria-admin-btns';
        btns.onclick = e => e.stopPropagation();
        btns.innerHTML = `
            <button class="galeria-btn-editar" title="Editar nome"
                onclick="editarNomeFotoFixa(this, '${legenda}')">✏️</button>`;
        item.appendChild(btns);
    });
}

function editarNomeFotoFixa(btn, legendaAtual) {
    const item    = btn.closest('.galeria-item');
    const overlay = item.querySelector('.galeria-overlay span');
    if (!overlay) return;

    const novo = prompt('Novo nome para a fotografia:', legendaAtual);
    if (novo === null || novo.trim() === '') return;
    overlay.textContent = novo.trim();
    btn.closest('.galeria-admin-btns').querySelector('.galeria-btn-editar').title = novo.trim();
    mostrarNotificacao('Nome atualizado! ✓', 'ok');
}

function adicionarFotoGaleria() {
    const url     = document.getElementById('galeria-url').value.trim();
    const legenda = document.getElementById('galeria-legenda').value.trim();
    if (!url) { mostrarNotificacao('Por favor insira o URL da imagem.', 'erro'); return; }

    const fotos = JSON.parse(localStorage.getItem('santril_galeria') || '[]');
    fotos.push({ id: Date.now(), url, legenda: legenda || 'Fotografia', cat: 'extra' });
    localStorage.setItem('santril_galeria', JSON.stringify(fotos));

    document.getElementById('galeria-url').value     = '';
    document.getElementById('galeria-legenda').value = '';
    mostrarNotificacao('Fotografia adicionada! ✓', 'ok');
    iniciarGaleria();
}

function apagarFotoGaleria(index) {
    if (!confirm('Tem a certeza que quer apagar esta fotografia?')) return;
    const fotos = JSON.parse(localStorage.getItem('santril_galeria') || '[]');
    fotos.splice(index, 1);
    localStorage.setItem('santril_galeria', JSON.stringify(fotos));
    mostrarNotificacao('Fotografia removida.', 'ok');
    iniciarGaleria();
}

function editarFotoGaleria(index) {
    const fotos = JSON.parse(localStorage.getItem('santril_galeria') || '[]');
    if (!fotos[index]) return;
    const novoNome = prompt('Novo nome para a fotografia:', fotos[index].legenda);
    if (novoNome === null || novoNome.trim() === '') return;
    fotos[index].legenda = novoNome.trim();
    localStorage.setItem('santril_galeria', JSON.stringify(fotos));
    mostrarNotificacao('Nome atualizado! ✓', 'ok');
    iniciarGaleria();
}

// ============================================================
//  LIGHTBOX
// ============================================================

function abrirLightbox(src, legenda) {
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const leg = document.getElementById('lightbox-legenda');
    if (!lb || !img) return;
    img.src = src;
    img.alt = legenda || '';
    if (leg) leg.textContent = legenda || '';
    lb.classList.add('aberto');
    document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('aberto');
    document.body.style.overflow = '';
}

// ============================================================
//  FORMULÁRIO DE CONTACTO
// ============================================================

function iniciarFormContacto() {
    const form = document.getElementById('form-contacto');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nome    = document.getElementById('cont-nome').value.trim();
        const email   = document.getElementById('cont-email').value.trim();
        const assunto = document.getElementById('cont-assunto').value.trim();
        const msg     = document.getElementById('cont-msg').value.trim();

        if (!nome || !email || !assunto || !msg) {
            mostrarNotificacao('Por favor preencha todos os campos.', 'erro');
            return;
        }

        setBtnLoading('btn-enviar-msg', true);

        setTimeout(() => {
            setBtnLoading('btn-enviar-msg', false);
            const msgs = getMensagens();
            msgs.push({
                id: Date.now(), nome, email, assunto, texto: msg,
                data: new Date().toLocaleDateString('pt-PT')
            });
            localStorage.setItem('santril_mensagens', JSON.stringify(msgs));
            mostrarNotificacao('Mensagem enviada com sucesso! Entraremos em contacto brevemente. ✉️', 'ok');
            form.reset();
        }, 800);
    });
}

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================

function iniciarTecladoAtalhos() {
    document.addEventListener('keydown', function(e) {
        // Esc fecha notificação, lightbox e menu mobile
        if (e.key === 'Escape') {
            fecharNotificacao();
            fecharLightbox();
            fecharMenuMobile();
        }
        // Enter no login
        if (e.key === 'Enter') {
            const loginDiv = document.getElementById('form-login-div');
            if (loginDiv && loginDiv.style.display !== 'none' &&
                document.getElementById('page-login')?.style.display !== 'none') {
                fazerLogin();
            }
        }
    });
}

// ============================================================
//  CABECALHO — efeito scroll
// ============================================================

function iniciarEfeitoCabecalho() {
    window.addEventListener('scroll', function() {
        const cab = document.getElementById('cabecalho');
        if (!cab) return;
        if (window.scrollY > 50) {
            cab.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
        } else {
            cab.style.boxShadow = 'none';
        }
    }, { passive: true });
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    iniciarBD();
    atualizarNavbar();
    atualizarAnoRodape();
    // iniciarFormContacto(); // substituído por sistema de avaliações
    iniciarTecladoAtalhos();
    iniciarEfeitoCabecalho();

    // Iniciar contadores e animações na home
    setTimeout(animarContadores, 500);
    setTimeout(iniciarAnimacoesEntrada, 600);
});


// ============================================================
//  SISTEMA DE AVALIAÇÕES (partilhadas + editar + apagar)
// ============================================================

// Shared reviews: stored in localStorage under a key that simulates shared state.
// In a real multi-user scenario this would be a backend; here all users on the
// same device share the same localStorage, and the UI shows all reviews to everyone.

function getAvaliacoes() {
    try { return JSON.parse(localStorage.getItem('santril_avaliacoes_v2')) || []; }
    catch(e) { return []; }
}
function saveAvaliacoes(avs) {
    localStorage.setItem('santril_avaliacoes_v2', JSON.stringify(avs));
}

function estrelas(nota, size) {
    size = size || '1rem';
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += `<span style="color:${i <= nota ? '#d4af37' : '#444'};font-size:${size};">★</span>`;
    }
    return s;
}

function nomeiniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(' ');
    return (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
}

function coresAvatar(nome) {
    const cores = ['#8B4513','#2E8B57','#4682B4','#9932CC','#B8860B','#556B2F'];
    let h = 0;
    for (let i = 0; i < (nome||'?').length; i++) h = (nome||'?').charCodeAt(i) + ((h << 5) - h);
    return cores[Math.abs(h) % cores.length];
}

function renderAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    if (!lista) return;
    const avs = getAvaliacoes();

    // Update summary
    const resumo = document.getElementById('aval-resumo');
    if (resumo) {
        if (avs.length > 0) {
            resumo.style.display = 'flex';
            const media = avs.reduce((s,a) => s + a.nota, 0) / avs.length;
            document.getElementById('aval-media-num').textContent = media.toFixed(1);
            document.getElementById('aval-media-stars').innerHTML = estrelas(Math.round(media), '1.3rem');
            const tot = document.getElementById('aval-total');
            if (tot) tot.textContent = avs.length + (avs.length === 1 ? ' avaliação' : ' avaliações');
            // Bars
            const barras = document.getElementById('aval-barras');
            if (barras) {
                let html = '';
                for (let i = 5; i >= 1; i--) {
                    const count = avs.filter(a => a.nota === i).length;
                    const pct = avs.length ? Math.round((count / avs.length) * 100) : 0;
                    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="color:#d4af37;font-size:0.75rem;width:10px;">${i}</span>
                        <span style="color:#d4af37;font-size:0.7rem;">★</span>
                        <div style="flex:1;background:#222;border-radius:4px;height:6px;overflow:hidden;">
                            <div style="width:${pct}%;background:linear-gradient(90deg,#d4af37,#f0d060);height:100%;border-radius:4px;transition:width .4s;"></div>
                        </div>
                        <span style="color:#666;font-size:0.7rem;width:20px;">${count}</span>
                    </div>`;
                }
                barras.innerHTML = html;
            }
        } else {
            resumo.style.display = 'none';
        }
    }

    if (avs.length === 0) {
        lista.innerHTML = '<div style="text-align:center;padding:24px 0;color:#666;font-size:0.9rem;">✨ Ainda sem avaliações.<br>Seja o primeiro a partilhar a sua experiência!</div>';
        return;
    }

    const utilizadorAtual = getSessao();
    const isAdmin = utilizadorAtual && utilizadorAtual.tipo === 'admin';

    const recentes = [...avs].sort((a,b) => b.id - a.id);
    lista.innerHTML = recentes.map(a => {
        const cor = coresAvatar(a.nome);
        const iniciais = nomeiniciais(a.nome);
        const podeEditar = isAdmin || a.autorSession === obterSessionId();
        return `<div style="display:flex;gap:12px;margin-bottom:14px;padding:14px 16px;background:linear-gradient(135deg,#161616,#0f0f0f);border:1px solid rgba(212,175,55,0.15);border-radius:12px;position:relative;transition:border-color .2s;" onmouseenter="this.style.borderColor='rgba(212,175,55,0.35)'" onmouseleave="this.style.borderColor='rgba(212,175,55,0.15)'">
            <div style="width:40px;height:40px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.85rem;flex-shrink:0;">${iniciais}</div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
                    <span style="font-weight:600;color:#e8e8e8;font-size:0.95rem;">${a.nome || 'Anónimo'}</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span>${estrelas(a.nota, '0.9rem')}</span>
                        <span style="color:#555;font-size:0.75rem;">${a.data}</span>
                    </div>
                </div>
                ${a.comentario ? `<p style="color:#bbb;font-size:0.88rem;margin:0;line-height:1.6;">${a.comentario}</p>` : ''}
                ${podeEditar ? `<div style="margin-top:10px;display:flex;gap:8px;">
                    <button onclick="editarAvaliacao(${a.id})" style="font-size:0.75rem;padding:4px 10px;background:transparent;border:1px solid rgba(212,175,55,0.4);color:#d4af37;border-radius:4px;cursor:pointer;">✏️ Editar</button>
                    <button onclick="apagarAvaliacao(${a.id})" style="font-size:0.75rem;padding:4px 10px;background:transparent;border:1px solid rgba(200,50,50,0.4);color:#e06060;border-radius:4px;cursor:pointer;">🗑️ Apagar</button>
                </div>` : ''}
            </div>
        </div>`;
    }).join('');
}

let _editandoId = null;

function obterSessionId() {
    let sid = sessionStorage.getItem('santril_sid');
    if (!sid) { sid = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2); sessionStorage.setItem('santril_sid', sid); }
    return sid;
}

function toggleFormAvaliacao() {
    const wrap = document.getElementById('form-avaliacao-wrap');
    const btn = document.getElementById('btn-mostrar-form');
    if (!wrap) return;
    const open = wrap.style.display === 'none' || wrap.style.display === '';
    wrap.style.display = open ? 'block' : 'none';
    if (btn) btn.style.display = open ? 'none' : 'block';
    if (open) iniciarEstrelas();
    if (!open) cancelarEdicao();
}

function temPermissao(avaliacao) {
    const sessao = getSessao();
    const isAdmin = sessao && sessao.tipo === 'admin';
    return isAdmin || avaliacao.autorSession === obterSessionId();
}

function editarAvaliacao(id) {
    const avs = getAvaliacoes();
    const a = avs.find(x => x.id === id);
    if (!a) return;
    if (!temPermissao(a)) { mostrarNotificacao('Não tem permissão para editar esta avaliação.', 'erro'); return; }
    _editandoId = id;
    document.getElementById('aval-nome').value = a.nome || '';
    document.getElementById('aval-comentario').value = a.comentario || '';
    document.getElementById('aval-nota').value = a.nota;
    // Show form and set stars
    const wrap = document.getElementById('form-avaliacao-wrap');
    const btn = document.getElementById('btn-mostrar-form');
    wrap.style.display = 'block';
    if (btn) btn.style.display = 'none';
    iniciarEstrelas();
    // Update star display
    document.querySelectorAll('#star-rating .star').forEach(s => {
        s.style.color = parseInt(s.dataset.val) <= a.nota ? '#d4af37' : '#444';
    });
    document.getElementById('btn-submeter-aval').textContent = '💾 Guardar Alterações';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelarEdicao() {
    _editandoId = null;
    const btn = document.getElementById('btn-submeter-aval');
    if (btn) btn.textContent = 'Publicar';
    const nome = document.getElementById('aval-nome');
    const com = document.getElementById('aval-comentario');
    const nota = document.getElementById('aval-nota');
    if (nome) nome.value = '';
    if (com) com.value = '';
    if (nota) nota.value = '0';
    document.querySelectorAll('#star-rating .star').forEach(s => s.style.color = '#444');
}

function apagarAvaliacao(id) {
    const a = getAvaliacoes().find(x => x.id === id);
    if (!a) return;
    if (!temPermissao(a)) { mostrarNotificacao('Não tem permissão para apagar esta avaliação.', 'erro'); return; }
    if (!confirm('Apagar esta avaliação?')) return;
    saveAvaliacoes(getAvaliacoes().filter(x => x.id !== id));
    renderAvaliacoes();
    renderAvalilacoesAdmin();
    mostrarNotificacao('Avaliação apagada.', 'ok');
}

function submeterAvaliacao() {
    const nota = parseInt(document.getElementById('aval-nota').value) || 0;
    const nome = document.getElementById('aval-nome').value.trim();
    const comentario = document.getElementById('aval-comentario').value.trim();

    if (nota === 0) { mostrarNotificacao('Por favor selecione uma classificação de estrelas.', 'erro'); return; }

    let avs = getAvaliacoes();
    if (_editandoId) {
        const original = avs.find(a => a.id === _editandoId);
        if (original && !temPermissao(original)) { mostrarNotificacao('Não tem permissão para editar esta avaliação.', 'erro'); return; }
        avs = avs.map(a => a.id === _editandoId ? { ...a, nome, nota, comentario } : a);
        mostrarNotificacao('Avaliação atualizada! ⭐', 'ok');
    } else {
        avs.push({ id: Date.now(), nome, nota, comentario, data: new Date().toLocaleDateString('pt-PT'), autorSession: obterSessionId() });
        mostrarNotificacao('Obrigado pela sua avaliação! ⭐', 'ok');
    }
    saveAvaliacoes(avs);
    cancelarEdicao();
    toggleFormAvaliacao();
    renderAvaliacoes();
    renderAvalilacoesAdmin();
}

function renderAvalilacoesAdmin() {
    const el = document.getElementById('lista-avaliacoes-admin');
    if (!el) return;
    const avs = getAvaliacoes();
    if (avs.length === 0) { el.innerHTML = '<p style="color:#555;font-style:italic;font-size:14px;">Ainda não há avaliações.</p>'; return; }
    el.innerHTML = [...avs].sort((a,b) => b.id - a.id).map(a => `
        <div class="msg-card" style="margin-bottom:10px;">
            <div class="msg-meta">${a.nome || 'Anónimo'} — ${a.data} &nbsp; ${'★'.repeat(a.nota)}${'☆'.repeat(5-a.nota)}</div>
            <div class="msg-texto">${a.comentario || '<em style="color:#555">Sem comentário</em>'}</div>
            <button onclick="apagarAvaliacao(${a.id})" style="margin-top:8px;font-size:0.75rem;padding:3px 10px;background:transparent;border:1px solid rgba(200,50,50,0.4);color:#e06060;border-radius:4px;cursor:pointer;">🗑️ Apagar</button>
        </div>`).join('');
}

function iniciarEstrelas() {
    const stars = document.querySelectorAll('#star-rating .star');
    if (!stars.length) return;
    // Remove old listeners by cloning
    stars.forEach(s => {
        const ns = s.cloneNode(true);
        s.parentNode.replaceChild(ns, s);
    });
    document.querySelectorAll('#star-rating .star').forEach(s => {
        s.addEventListener('mouseenter', () => {
            const val = parseInt(s.dataset.val);
            document.querySelectorAll('#star-rating .star').forEach(st => {
                st.style.color = parseInt(st.dataset.val) <= val ? '#d4af37' : '#444';
                st.style.transform = parseInt(st.dataset.val) === val ? 'scale(1.2)' : 'scale(1)';
            });
        });
        s.addEventListener('mouseleave', () => {
            const cur = parseInt(document.getElementById('aval-nota').value) || 0;
            document.querySelectorAll('#star-rating .star').forEach(st => {
                st.style.color = parseInt(st.dataset.val) <= cur ? '#d4af37' : '#444';
                st.style.transform = 'scale(1)';
            });
        });
        s.addEventListener('click', () => {
            const val = parseInt(s.dataset.val);
            document.getElementById('aval-nota').value = val;
            document.querySelectorAll('#star-rating .star').forEach(st => {
                st.style.color = parseInt(st.dataset.val) <= val ? '#d4af37' : '#444';
                st.style.transform = 'scale(1)';
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderAvaliacoes();
    iniciarEstrelas();
});

const _observerAval = new MutationObserver(() => {
    const pg = document.getElementById('page-contactos');
    if (pg && pg.style.display !== 'none') { renderAvaliacoes(); iniciarEstrelas(); }
    const pgA = document.getElementById('page-admin');
    if (pgA && pgA.style.display !== 'none') { renderAvalilacoesAdmin(); }
});
document.addEventListener('DOMContentLoaded', () => {
    const pg = document.getElementById('page-contactos');
    if (pg) _observerAval.observe(pg, { attributes: true, attributeFilter: ['style'] });
    const pgA = document.getElementById('page-admin');
    if (pgA) _observerAval.observe(pgA, { attributes: true, attributeFilter: ['style'] });
});
