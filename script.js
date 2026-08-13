const products = [
  {name:"Alho em cartela 150 g", category:"alho", image:"assets/alho-cartela.jpg", desc:"Cabeças de alho em embalagem prática para o varejo."},
  {name:"Alho em cartela 400 g", category:"alho", image:"assets/alho-cartela.jpg", desc:"Apresentação maior para quem busca praticidade no abastecimento."},
  {name:"Pote de alho triturado 200 g", category:"alho", image:"assets/alho-triturado.jpg", desc:"Alho triturado pronto para facilitar o preparo das refeições."},
  {name:"Pote de alho triturado 400 g", category:"alho", image:"assets/alho-triturado.jpg", desc:"Mais quantidade para cozinhas domésticas e pequenos negócios."},
  {name:"Pote de alho triturado 1 kg", category:"alho", image:"assets/alho-triturado.jpg", desc:"Opção para maior consumo e estabelecimentos de alimentação."},
  {name:"Balde de alho triturado 3 kg", category:"alho", image:"assets/alho-triturado.jpg", desc:"Formato de maior volume para uso profissional."},
  {name:"Pacote de alho Bulbilho 500 g", category:"alho", image:"assets/alho-bulbilho.jpg", desc:"Apresentação em pacote, ideal para diferentes usos culinários."},
  {name:"Pote de alho em pasta 220 g", category:"alho", image:"assets/alho-triturado.jpg", desc:"Textura prática para temperar e incorporar às receitas."},
  {name:"Pote de cebola triturada 200 g", category:"temperos", image:"assets/rotulos-zani.jpg", desc:"Cebola triturada para complementar temperos e preparos."},
  {name:"Pote de alho frito 100 g", category:"alho", image:"assets/rotulos-zani.jpg", desc:"Opção crocante para finalização de pratos e acompanhamentos."},
  {name:"Pacote de alho descascado 400 g", category:"alho", image:"assets/alho-cartela.jpg", desc:"Alho descascado para agilizar o preparo."},
  {name:"Pacote de alho descascado 1 kg", category:"alho", image:"assets/alho-cartela.jpg", desc:"Maior volume para cozinhas e estabelecimentos."},
  {name:"Alho em caixa 10 kg", category:"alho", image:"assets/ponto-venda.jpg", desc:"Apresentação em caixa para clientes de maior volume."},
  {name:"Sal temperado — pacote 500 g", category:"temperos", image:"assets/rotulos-zani.jpg", desc:"Tempero com alho e outros ingredientes para uso culinário."}
];

const grid = document.querySelector("#productGrid");
const search = document.querySelector("#productSearch");
const filter = document.querySelector("#productFilter");
const empty = document.querySelector("#emptyProducts");

function renderProducts(){
  const term = search.value.trim().toLowerCase();
  const selected = filter.value;
  const filtered = products.filter(p =>
    (selected === "todos" || p.category === selected) &&
    p.name.toLowerCase().includes(term)
  );
  grid.innerHTML = filtered.map((p, i) => `
    <article class="product-card">
      <div class="product-photo"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="product-body">
        <span class="tag">${p.category === "temperos" ? "Tempero" : "Alho"}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <button class="product-link" data-index="${products.indexOf(p)}">Ver detalhes →</button>
      </div>
    </article>
  `).join("");
  empty.hidden = filtered.length !== 0;
}

search.addEventListener("input", renderProducts);
filter.addEventListener("change", renderProducts);
renderProducts();

const modal = document.querySelector("#productModal");
const modalImage = document.querySelector("#modalImage");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const modalCategory = document.querySelector("#modalCategory");

grid.addEventListener("click", e => {
  const btn = e.target.closest(".product-link");
  if(!btn) return;
  const p = products[Number(btn.dataset.index)];
  modalImage.src = p.image;
  modalImage.alt = p.name;
  modalTitle.textContent = p.name;
  modalText.textContent = p.desc;
  modalCategory.textContent = p.category === "temperos" ? "Tempero" : "Alho";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
});
function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}
document.querySelector(".modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if(e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });

document.querySelectorAll(".accordion-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    const open = btn.classList.toggle("active");
    content.style.maxHeight = open ? content.scrollHeight + "px" : null;
    btn.querySelector("span").textContent = open ? "−" : "+";
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

const form = document.querySelector("#clientForm");
const status = document.querySelector("#formStatus");

const supabaseClient = window.supabase.createClient(
  window.ALHO_ZANI_SUPABASE_URL,
  window.ALHO_ZANI_SUPABASE_KEY
);

form.addEventListener("submit", async e => {
  e.preventDefault();
  status.textContent = "Salvando seu cadastro...";
  status.className = "form-status";

  const data = Object.fromEntries(new FormData(form).entries());
  const cidadeEstado = (data.cidade || "").trim();
  const estadoMatch = cidadeEstado.match(/[-–—]\s*([A-Za-z]{2})$/);
  const estado = estadoMatch ? estadoMatch[1].toUpperCase() : "PR";
  const cidade = cidadeEstado.replace(/[-–—]\s*[A-Za-z]{2}\s*$/, "").trim();

  const payload = {
    nome: data.nome?.trim(),
    empresa: data.empresa?.trim() || null,
    email: data.email?.trim().toLowerCase(),
    telefone: data.telefone?.trim(),
    whatsapp: data.telefone?.trim(),
    cidade: cidade || null,
    estado,
    tipo_cliente: data.interesse || null,
    mensagem: data.mensagem?.trim() || null,
    status: "Novo"
  };

  const { error } = await supabaseClient.from("Clientes").insert(payload);

  if (error) {
    console.error("Erro ao cadastrar no Supabase:", error);
    status.textContent = "Não foi possível salvar o cadastro agora. Tente novamente ou fale conosco pelo WhatsApp.";
    status.className = "form-status error";
    return;
  }

  const text =
`Olá, Alho Zani! Vim pelo site e gostaria de entrar em contato.

Nome: ${data.nome}
Empresa/comércio: ${data.empresa || "Não informado"}
E-mail: ${data.email}
Telefone/WhatsApp: ${data.telefone}
Cidade: ${data.cidade}
Interesse: ${data.interesse}
Mensagem: ${data.mensagem || "Gostaria de receber mais informações."}`;

  localStorage.setItem("alhoZaniUltimoCadastro", JSON.stringify({
    nome:data.nome, email:data.email, telefone:data.telefone, cidade:data.cidade,
    interesse:data.interesse, data:new Date().toISOString()
  }));

  status.textContent = "Cadastro realizado com sucesso! Abrindo o WhatsApp...";
  status.className = "form-status success";
  const url = "https://wa.me/5543999808756?text=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener");
  form.reset();
  form.querySelector('[name="cidade"]').value = "Arapongas-PR";
});

document.querySelector("#modalContact").addEventListener("click", closeModal);
document.querySelector("#year").textContent = new Date().getFullYear();
