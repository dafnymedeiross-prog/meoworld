// Dados de demonstração do MEOWorld (comunidade fictícia, curiosidades e trends).

const BREEDS = [
  'SRD (vira-lata)', 'Siamês', 'Persa', 'Maine Coon', 'Angorá', 'Sphynx', 'Ragdoll',
  'Bengal', 'British Shorthair', 'Azul Russo', 'Norueguês da Floresta', 'Exótico', 'Himalaio'
];

const COATS = [
  { name: 'Laranja', color: '#f2a65a' },
  { name: 'Preto', color: '#4a4a55' },
  { name: 'Branco', color: '#f4f1ea' },
  { name: 'Cinza', color: '#9aa7b5' },
  { name: 'Creme', color: '#ecd3a8' },
  { name: 'Marrom', color: '#a9744f' }
];

const COMMUNITY = [
  { id: 'c1', catName: 'Mingau', owner: 'Bia', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-03-14', coat: '#f4f1ea', eyes: '#6bb7d6', bio: 'Especialista em derrubar copos.' },
  { id: 'c2', catName: 'Paçoca', owner: 'Rafa', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2021-08-02', coat: '#f2a65a', eyes: '#7dbb6a', bio: 'Durmo 16h por dia e me orgulho disso.' },
  { id: 'c3', catName: 'Luna', owner: 'Camila', breed: 'Siamês', gender: 'Fêmea', birth: '2020-11-20', coat: '#ecd3a8', eyes: '#6bb7d6', bio: 'Falo muito. Muito mesmo.' },
  { id: 'c4', catName: 'Thor', owner: 'João', breed: 'Maine Coon', gender: 'Macho', birth: '2019-05-09', coat: '#a9744f', eyes: '#d9a441', bio: 'Grande por fora, filhote por dentro.' },
  { id: 'c5', catName: 'Salém', owner: 'Duda', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2023-10-31', coat: '#4a4a55', eyes: '#d9a441', bio: 'Zoomies às 3 da manhã.' },
  { id: 'c6', catName: 'Nina', owner: 'Léo', breed: 'Persa', gender: 'Fêmea', birth: '2018-01-27', coat: '#9aa7b5', eyes: '#d9a441', bio: 'Só aceito sachê premium.' },
  { id: 'c7', catName: 'Frajola', owner: 'Tati', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-07-18', coat: '#4a4a55', eyes: '#7dbb6a', bio: 'Caixa de papelão > caminha cara.' },
  { id: 'c8', catName: 'Amora', owner: 'Gabi', breed: 'Ragdoll', gender: 'Fêmea', birth: '2023-02-05', coat: '#f4f1ea', eyes: '#6bb7d6', bio: 'Viro geleia no colo.' }
];

const TRENDS = ['#AmassandoPãozinho', '#GatoNaCaixa', '#Zoomies3daManhã', '#PiscadaLenta', '#GatosSãoLíquidos', '#EspaçoPessoMiau'];

// Posts de demonstração do TikCats (ilustrados; os vídeos de verdade são os que você enviar).
const SEED_TIKS = [
  { id: 's1', cat: 'c2', caption: 'Meu turno de amassar pãozinho começou', trend: '#AmassandoPãozinho', likes: 248, bg: '#ffe3c2' },
  { id: 's2', cat: 'c7', caption: 'A caixa chegou. O presente era a caixa.', trend: '#GatoNaCaixa', likes: 512, bg: '#d9f2d0' },
  { id: 's3', cat: 'c5', caption: '03:07 — hora de correr pelo corredor', trend: '#Zoomies3daManhã', likes: 933, bg: '#e3dcff' },
  { id: 's4', cat: 'c3', caption: 'Piscando devagar pra dizer que te amo', trend: '#PiscadaLenta', likes: 377, bg: '#ffd9e6' }
];

const FACTS = [
  { id: 'f1', cat: 'Corpo', title: 'Nariz com “impressão digital”', text: 'O desenho de sulcos no nariz de cada gato é único, parecido com a impressão digital dos humanos.' },
  { id: 'f2', cat: 'Corpo', title: 'Terceira pálpebra', text: 'Gatos têm uma terceira pálpebra, a membrana nictitante, que protege e hidrata os olhos.' },
  { id: 'f3', cat: 'Corpo', title: 'Orelhas radar', text: 'Cada orelha tem cerca de 32 músculos e consegue girar aproximadamente 180°, de forma independente.' },
  { id: 'f4', cat: 'Corpo', title: 'Bigodes são sensores', text: 'As vibrissas ajudam o gato a medir espaços e perceber correntes de ar. Nunca devem ser cortadas.' },
  { id: 'f5', cat: 'Corpo', title: 'Visão noturna', text: 'Uma camada refletora atrás da retina, o tapetum lucidum, faz os olhos brilharem e ajuda a enxergar com pouca luz.' },
  { id: 'f6', cat: 'Corpo', title: 'Sem paladar para doce', text: 'Gatos não sentem o sabor doce: o gene do receptor de doce não é funcional neles.' },
  { id: 'f7', cat: 'Comportamento', title: 'Campeões de soneca', text: 'Um gato adulto dorme em média de 12 a 16 horas por dia.' },
  { id: 'f8', cat: 'Comportamento', title: 'Piscada lenta', text: 'Piscar devagar para você é um sinal de confiança. Pode piscar de volta!' },
  { id: 'f9', cat: 'Comportamento', title: 'Amassar pãozinho', text: 'O movimento vem de filhote: é o que eles fazem ao mamar para estimular o leite da mãe.' },
  { id: 'f10', cat: 'Comportamento', title: 'Miado é para humanos', text: 'Gatos adultos quase não miam entre si. O miado é usado principalmente para se comunicar com pessoas.' },
  { id: 'f11', cat: 'Comportamento', title: 'O motor do ronrom', text: 'O ronronar acontece em frequências entre cerca de 25 e 150 Hz, e nem sempre significa felicidade: gatos também ronronam com dor ou medo.' },
  { id: 'f12', cat: 'Comportamento', title: 'Velocistas', text: 'Em corridas curtas, um gato doméstico pode chegar perto de 48 km/h.' },
  { id: 'f13', cat: 'Saúde', title: 'Lírios são perigosos', text: 'Lírios são extremamente tóxicos para gatos: até o pólen pode causar insuficiência renal. Na dúvida, procure um veterinário.' },
  { id: 'f14', cat: 'Saúde', title: 'Comidas proibidas', text: 'Chocolate, cebola, alho, uva e passas são tóxicos para gatos.' },
  { id: 'f15', cat: 'Saúde', title: 'Leite não é pra todo gato', text: 'Muitos gatos adultos são intolerantes à lactose, e leite de vaca pode causar diarreia.' },
  { id: 'f16', cat: 'Saúde', title: 'Tricolor quase sempre é fêmea', text: 'Quase todos os gatos tricolores (cálico) são fêmeas, porque a cor laranja/preta está ligada ao cromossomo X.' },
  { id: 'f17', cat: 'Cuidados', title: 'Regra da caixa de areia', text: 'A recomendação é ter uma caixa de areia por gato, mais uma extra.' },
  { id: 'f18', cat: 'Cuidados', title: 'Água longe da comida', text: 'Muitos gatos bebem mais quando a água fica longe do pote de ração e da caixa de areia. Fontes também ajudam.' },
  { id: 'f19', cat: 'Cuidados', title: 'Arranhar é necessidade', text: 'Arranhar serve para cuidar das unhas, alongar e marcar território. Arranhadores salvam o sofá.' },
  { id: 'f20', cat: 'Cuidados', title: 'Altura dá segurança', text: 'Prateleiras e lugares altos ajudam o gato a se sentir seguro e a observar o território.' }
];

const MEOW_REPLIES = [
  'Miau! 😺', 'Prrrrr… gostei disso.', 'Meu humano mandou dizer: kkkkk', 'Agora não posso, estou amassando pãozinho.',
  'Miau miau? (tradução: manda foto!)', 'Acabei de derrubar um copo pra comemorar.', 'Ronronando aqui 💙', 'Bora marcar um meow-papo depois da soneca?'
];
