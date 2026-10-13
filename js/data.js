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
  { id: 'c1', photo: 'img/cats/c1.jpg', credit: {"by":"jasminerebecca42","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:White_cat_(26973287860).jpg"}, username: 'mingau.copos', followers: 128, catName: 'Mingau', owner: 'Bia', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-03-14', coat: '#f4f1ea', eyes: '#6bb7d6', bio: 'Especialista em derrubar copos.' },
  { id: 'c2', photo: 'img/cats/c2.jpg', credit: {"by":"Leroy_Skalstad","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Orange_tabby_cat-932269.jpg"}, username: 'pacoca_soneca', followers: 342, catName: 'Paçoca', owner: 'Rafa', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2021-08-02', coat: '#f2a65a', eyes: '#7dbb6a', bio: 'Durmo 16h por dia e me orgulho disso.' },
  { id: 'c3', photo: 'img/cats/c3.jpg', credit: {"by":"Sarahphern3lia","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Eclipse,_the_first_transgender_cat.jpg"}, username: 'luna.fala', followers: 97, catName: 'Luna', owner: 'Camila', breed: 'Siamês', gender: 'Fêmea', birth: '2020-11-20', coat: '#ecd3a8', eyes: '#6bb7d6', bio: 'Falo muito. Muito mesmo.' },
  { id: 'c4', photo: 'img/cats/c4.jpg', credit: {"by":"Miscellaneous contributor","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Gray-Brown_Tabby_Cat.jpg"}, username: 'thor.gigante', followers: 510, catName: 'Thor', owner: 'João', breed: 'Maine Coon', gender: 'Macho', birth: '2019-05-09', coat: '#a9744f', eyes: '#d9a441', bio: 'Grande por fora, filhote por dentro.' },
  { id: 'c5', photo: 'img/cats/c5.jpg', credit: {"by":"Salwa Farwaneh Dameh","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Black_cat_curled_up_on_a_sofa_in_Newcastle_upon_Tyne,_UK.jpg"}, username: 'salem3am', followers: 276, catName: 'Salém', owner: 'Duda', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2023-10-31', coat: '#4a4a55', eyes: '#d9a441', bio: 'Zoomies às 3 da manhã.' },
  { id: 'c6', photo: 'img/cats/c6.jpg', credit: {"by":"Aleenamustlive","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Grey_cat_looking_up_at_camera.jpg"}, username: 'nina.premium', followers: 189, catName: 'Nina', owner: 'Léo', breed: 'British Shorthair', gender: 'Fêmea', birth: '2018-01-27', coat: '#9aa7b5', eyes: '#d9a441', bio: 'Só aceito sachê premium.' },
  { id: 'c7', photo: 'img/cats/c7.jpg', credit: {"by":"Mattkiska","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Edie%27s_eye_reflection.jpg"}, username: 'frajola_caixa', followers: 64, catName: 'Frajola', owner: 'Tati', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-07-18', coat: '#4a4a55', eyes: '#7dbb6a', bio: 'Caixa de papelão > caminha cara.' },
  { id: 'c8', photo: 'img/cats/c8.jpg', credit: {"by":"AdinaVoicu","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Tabby_cat_with_blue_eyes-3336579.jpg"}, username: 'amora.geleia', followers: 233, catName: 'Amora', owner: 'Gabi', breed: 'Ragdoll', gender: 'Fêmea', birth: '2023-02-05', coat: '#f4f1ea', eyes: '#6bb7d6', bio: 'Viro geleia no colo.' },
  { id: 'c9', photo: 'img/cats/c9.jpg', credit: {"by":"Babelball","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:3_year_old_calico_cat.jpg"}, username: 'pipoca.branca', followers: 154, catName: 'Pipoca', owner: 'Marina', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2021-04-12', coat: '#f4f1ea', eyes: '#7dbb6a', bio: 'Olhos verdes e opinião sobre tudo.' },
  { id: 'c10', photo: 'img/cats/c10.jpg', credit: {"by":"TechnoKittyCat","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Calico_Cat_Napping_on_Wooden_Fence.jpg"}, username: 'jujuba.tricolor', followers: 88, catName: 'Jujuba', owner: 'Pedro', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2020-09-30', coat: '#f4f1ea', eyes: '#d9a441', bio: 'Tricolor, logo, mandona.' },
  { id: 'c11', photo: 'img/cats/c11.jpg', credit: {"by":"Laurie2002","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Cute_grey_cat_with_big_eyes.jpg"}, username: 'fumaca.cinza', followers: 201, catName: 'Fumaça', owner: 'Aline', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-01-15', coat: '#9aa7b5', eyes: '#d9a441', bio: 'Apareço e sumo sem fazer barulho.' },
  { id: 'c12', photo: 'img/cats/c12.jpg', credit: {"by":"www.Pixel.la Free Stock Photos","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Cat-188088_(23698467234).jpg"}, username: 'tigrao.neve', followers: 317, catName: 'Tigrão', owner: 'Caio', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2019-12-03', coat: '#a9744f', eyes: '#7dbb6a', bio: 'Rajado de nascença, aventureiro por opção.' },
  { id: 'c13', photo: 'img/cats/c13.jpg', credit: {"by":"Miscellaneous contributor","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Orange_tabby_cat_laying_down.jpg"}, username: 'cheddar.laranja', followers: 422, catName: 'Cheddar', owner: 'Lívia', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2023-03-21', coat: '#f2a65a', eyes: '#d9a441', bio: 'Um neurônio laranja, usado com moderação.' },
  { id: 'c14', photo: 'img/cats/c14.jpg', credit: {"by":"Butterflye222","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Red_point_siamese_cat.jpg"}, username: 'floquinho', followers: 76, catName: 'Floquinho', owner: 'Bruno', breed: 'Siamês', gender: 'Macho', birth: '2021-06-08', coat: '#ecd3a8', eyes: '#6bb7d6', bio: 'Falante, carente e de olho azul.' },
  { id: 'c15', photo: 'img/cats/c15.jpg', credit: {"by":"Art (RUS) Potosi","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Black_cat_in_Slavny,_Tula_Oblast.jpg"}, username: 'pantera.fofa', followers: 145, catName: 'Pantera', owner: 'Sofia', breed: 'Persa', gender: 'Fêmea', birth: '2018-10-10', coat: '#4a4a55', eyes: '#d9a441', bio: 'Peluda demais para ter pressa.' },
  { id: 'c16', photo: 'img/cats/c16.jpg', credit: {"by":"Mattkiska","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:Edie_and_Cheeto_(Cat_and_fish).jpg"}, username: 'batman.gato', followers: 268, catName: 'Batman', owner: 'Igor', breed: 'SRD (vira-lata)', gender: 'Macho', birth: '2022-11-02', coat: '#4a4a55', eyes: '#7dbb6a', bio: 'De smoking o dia todo. Vigio o aquário.' },
  { id: 'c17', photo: 'img/cats/c17.jpg', credit: {"by":"Gugalcrom123","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:An_European_Shorthair_tabby_cat.jpg"}, username: 'sardinha', followers: 59, catName: 'Sardinha', owner: 'Helena', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2023-07-19', coat: '#a9744f', eyes: '#7dbb6a', bio: 'Durmo em qualquer superfície plana.' },
  { id: 'c18', photo: 'img/cats/c18.jpg', credit: {"by":"Fumikas Sagisavas","license":"CC0","url":"https://commons.wikimedia.org/wiki/File:White_cat_on_the_computer_desk.jpg"}, username: 'nuvem.home.office', followers: 112, catName: 'Nuvem', owner: 'Vitor', breed: 'SRD (vira-lata)', gender: 'Fêmea', birth: '2020-02-14', coat: '#f4f1ea', eyes: '#d9a441', bio: 'Supervisora de home office.' }
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
  { id: 'f20', cat: 'Cuidados', title: 'Altura dá segurança', text: 'Prateleiras e lugares altos ajudam o gato a se sentir seguro e a observar o território.' },
  { id: 'f21', cat: "Cio e reprodução", title: "Quando vem o primeiro cio", text: "A gata costuma ter o primeiro cio entre 4 e 12 meses, muitas vezes perto dos 6. Ou seja: uma filhote de poucos meses já pode engravidar." },
  { id: 'f22', cat: "Cio e reprodução", title: "Como é o cio da gata", text: "Ela mia alto e sem parar, se esfrega em tudo, rola no chão, fica mais carinhosa e levanta o quadril com o rabo de lado quando recebe carinho nas costas. Pode tentar fugir de casa." },
  { id: 'f23', cat: "Cio e reprodução", title: "Gata no cio não sangra", text: "Diferente das cadelas, as gatas normalmente não têm sangramento no cio. Sangue na vulva ou na urina é motivo para ir ao veterinário." },
  { id: 'f24', cat: "Cio e reprodução", title: "Quanto tempo dura", text: "Cada cio dura em média uma semana e, se a gata não cruzar, ele volta em duas ou três semanas. Em épocas de dias longos isso pode se repetir por meses." },
  { id: 'f25', cat: "Cio e reprodução", title: "Ovulação só depois do cruzamento", text: "Gatas são de ovulação induzida: o óvulo só é liberado depois do acasalamento. Por isso elas engravidam com muita facilidade." },
  { id: 'f26', cat: "Cio e reprodução", title: "Machos não têm cio", text: "O gato macho não entra no cio: ele reage às fêmeas no cio por perto. Fica inquieto, mia, tenta fugir, briga e marca território com urina." },
  { id: 'f27', cat: "Cio e reprodução", title: "Gestação de uns dois meses", text: "A gestação da gata dura cerca de 63 a 65 dias, e uma ninhada costuma ter de 3 a 5 filhotes." },
  { id: 'f28', cat: "Cio e reprodução", title: "Irmãos de pais diferentes", text: "Filhotes da mesma ninhada podem ter pais diferentes, se a gata cruzar com mais de um macho no mesmo cio." },
  { id: 'f29', cat: "Cio e reprodução", title: "Castração", text: "Castrar evita ninhadas indesejadas e o cio, reduz fugas, brigas e marcação com urina, e diminui o risco de tumores de mama e de infecção no útero. A idade ideal é o veterinário quem define; muitos indicam antes do primeiro cio." },
  { id: 'f30', cat: "Cio e reprodução", title: "Anticoncepcional não é solução", text: "Injeções e comprimidos anticoncepcionais para gatas estão ligados a tumores de mama e infecções uterinas graves. A castração é a opção segura." },
  { id: 'f31', cat: "Areia e banheiro", title: "Por que o xixi sai para trás", text: "O pênis do gato fica voltado para trás quando não está ereto, então a urina sai nessa direção. Nas fêmeas a uretra também se abre para trás." },
  { id: 'f32', cat: "Areia e banheiro", title: "Xixi em jato na parede é recado", text: "Marcar território é diferente de fazer xixi: o gato fica em pé, de costas para uma superfície vertical, com o rabo levantado e tremendo, e solta um jato pequeno para trás. É comunicação pelo cheiro." },
  { id: 'f33', cat: "Areia e banheiro", title: "Quem marca território", text: "Machos não castrados são os que mais marcam, mas fêmeas e gatos castrados também podem fazer isso, principalmente por estresse, mudança na casa ou disputa com outro gato. A castração resolve a maioria dos casos em machos." },
  { id: 'f34', cat: "Areia e banheiro", title: "Macho que não consegue urinar é emergência", text: "Gato macho indo várias vezes à caixa, fazendo força, miando e soltando pouca ou nenhuma urina pode estar com a uretra obstruída. Isso mata em pouco tempo: vá ao veterinário na hora." },
  { id: 'f35', cat: "Areia e banheiro", title: "Xixi fora da caixa tem motivo", text: "Pode ser caixa suja, areia que ele não gosta, caixa em lugar barulhento, estresse ou doença urinária. Antes de tratar como birra, vale uma consulta." },
  { id: 'f36', cat: "Areia e banheiro", title: "Areia de bentonita (aglomerante)", text: "Forma torrões firmes, é fácil de limpar e segura bem o cheiro. É a preferida de muitos gatos pelo grão fino, mas levanta pó e é pesada." },
  { id: 'f37', cat: "Areia e banheiro", title: "Areia de sílica", text: "Os cristais absorvem muita urina e controlam bem o odor, com pouco pó e trocas mais espaçadas. É mais cara, e alguns gatos estranham a textura." },
  { id: 'f38', cat: "Areia e banheiro", title: "Granulado de madeira", text: "Feito de pinus prensado, é barato, biodegradável e tem cheiro natural. Vira pó ao molhar, então funciona melhor em caixa com peneira." },
  { id: 'f39', cat: "Areia e banheiro", title: "Areias vegetais", text: "As de mandioca, milho ou tofu aglomeram, são leves e biodegradáveis. Guarde bem fechadas: por serem de origem vegetal, podem mofar com umidade." },
  { id: 'f40', cat: "Areia e banheiro", title: "A melhor areia é a que o gato usa", text: "Na média, gatos preferem areia de grão fino, macia e sem perfume. Areias perfumadas agradam o nariz do humano, não o do gato." },
  { id: 'f41', cat: "Areia e banheiro", title: "Troque de areia aos poucos", text: "Para mudar de tipo, misture a nova com a antiga e aumente a proporção ao longo de uma semana, ou ofereça as duas em caixas lado a lado." },
  { id: 'f42', cat: "Areia e banheiro", title: "Tamanho e lugar da caixa", text: "A caixa deve ter cerca de uma vez e meia o comprimento do gato, com uns 5 cm de areia, em lugar calmo e longe da comida e da água." },
  { id: 'f43', cat: "Areia e banheiro", title: "Limpeza todo dia", text: "Retire fezes e torrões pelo menos uma vez por dia e lave a caixa com água e sabão neutro de tempos em tempos. Evite desinfetantes de cheiro forte." },
  { id: 'f44', cat: "Areia e banheiro", title: "Por que eles enterram", text: "Enterrar as fezes é instinto para esconder o cheiro de predadores e de gatos dominantes. Gato que deixa descoberto pode estar marcando presença ou não gostando da areia." },
  { id: 'f45', cat: "Alimentação", title: "Carnívoro de verdade", text: "O gato é carnívoro estrito: precisa de nutrientes que só existem em tecido animal, como a taurina. Dieta vegetariana não serve para gatos." },
  { id: 'f46', cat: "Alimentação", title: "Taurina", text: "Falta de taurina causa cegueira e doença no coração. Por isso ração de cachorro não substitui a de gato." },
  { id: 'f47', cat: "Alimentação", title: "Chocolate e café", text: "Chocolate, café, chá preto e energéticos têm teobromina e cafeína, que causam vômito, tremores, arritmia e convulsões em gatos." },
  { id: 'f48', cat: "Alimentação", title: "Cebola, alho e parentes", text: "Cebola, alho, alho-poró e cebolinha destroem os glóbulos vermelhos do gato, crus, cozidos ou em pó. Cuidado com papinha de bebê e caldos prontos." },
  { id: 'f49', cat: "Alimentação", title: "Uva e uva-passa", text: "Podem causar insuficiência renal. Como não se sabe a dose segura, a regra é não dar nenhuma." },
  { id: 'f50', cat: "Alimentação", title: "Álcool e massa crua", text: "Pequenas quantidades de álcool já intoxicam um gato. Massa crua com fermento também: ela cresce no estômago e produz álcool." },
  { id: 'f51', cat: "Alimentação", title: "Remédio de gente pode matar", text: "Paracetamol é extremamente tóxico para gatos, mesmo em dose pequena, e ibuprofeno também. Nunca medique por conta própria." },
  { id: 'f52', cat: "Alimentação", title: "Ossos e espinhas", text: "Ossos cozidos e espinhas de peixe podem lascar, engasgar e perfurar o intestino." },
  { id: 'f53', cat: "Alimentação", title: "Peixe e ovo crus", text: "Peixe cru tem uma enzima que destrói a vitamina B1, e clara de ovo crua atrapalha a absorção de biotina. Crus, os dois também podem trazer bactérias." },
  { id: 'f54', cat: "Alimentação", title: "Atum só de vez em quando", text: "Atum de lata para humanos em excesso desequilibra a dieta e pode acumular mercúrio. Serve como agrado raro, não como refeição." },
  { id: 'f55', cat: "Alimentação", title: "Fígado demais faz mal", text: "Fígado em excesso causa intoxicação por vitamina A, que deforma os ossos." },
  { id: 'f56', cat: "Alimentação", title: "Sal, embutidos e temperos", text: "Presunto, salsicha, salgadinhos e comida temperada têm sal e gordura demais para um gato." },
  { id: 'f57', cat: "Alimentação", title: "Adoçante xilitol", text: "Presente em balas e produtos sem açúcar, o xilitol é perigoso para cães e não é considerado seguro para gatos. Melhor manter longe." },
  { id: 'f58', cat: "Alimentação", title: "Ração de filhote", text: "O desmame começa por volta de 4 semanas e termina perto de 8. Daí até cerca de 12 meses o gato come ração de filhote, mais calórica e proteica." },
  { id: 'f59', cat: "Alimentação", title: "Quando passar para ração de adulto", text: "Em geral por volta de 1 ano. Raças grandes, como o Maine Coon, podem ficar na de filhote até 18 a 24 meses." },
  { id: 'f60', cat: "Alimentação", title: "Ração para castrados", text: "Depois da castração o gasto de energia cai e o apetite aumenta. Rações para castrados têm menos calorias, e o veterinário orienta a troca." },
  { id: 'f61', cat: "Alimentação", title: "Ração sênior", text: "A partir de 7 a 10 anos muitos gatos passam para dieta sênior, de acordo com os exames e a orientação do veterinário." },
  { id: 'f62', cat: "Alimentação", title: "Como trocar de ração", text: "Misture a nova com a antiga e aumente a proporção ao longo de 7 a 10 dias. Troca brusca costuma dar vômito e diarreia." },
  { id: 'f63', cat: "Alimentação", title: "Gato que para de comer", text: "Gato não pode ficar em jejum: mais de um ou dois dias sem comer pode causar lipidose hepática, uma doença grave do fígado. Procure o veterinário." },
  { id: 'f64', cat: "Alimentação", title: "Sachê ajuda a hidratar", text: "O gato descende de felinos do deserto e sente pouca sede. Alimento úmido aumenta a ingestão de água e ajuda rins e bexiga." },
  { id: 'f65', cat: "Alimentação", title: "Obesidade", text: "Gato gordinho não é gato saudável: o excesso de peso aumenta o risco de diabetes, artrose e problemas urinários." },
  { id: 'f66', cat: "Alimentação", title: "Refeições pequenas", text: "Na natureza o gato faz várias pequenas refeições por dia. Dividir a porção diária e usar comedouros-brinquedo ajuda no peso e no tédio." },
  { id: 'f67', cat: "Plantas", title: "Por que eles comem grama", text: "Ninguém sabe ao certo. As hipóteses são ajudar a eliminar bolas de pelo, fornecer fibra e ser um instinto herdado para expulsar parasitas do intestino. A maioria come sem estar doente e nem sempre vomita depois." },
  { id: 'f68', cat: "Plantas", title: "Graminha de gato", text: "Brotos de trigo, aveia, cevada ou milho de pipoca plantados em vasinho são seguros e dão ao gato uma opção melhor que as plantas da casa." },
  { id: 'f69', cat: "Plantas", title: "Catnip, a erva-do-gato", text: "A Nepeta cataria tem nepetalactona, que provoca uns 10 minutos de euforia: rolar, esfregar, lamber e correr. Não vicia e é segura." },
  { id: 'f70', cat: "Plantas", title: "Nem todo gato liga para catnip", text: "A reação é hereditária e aparece em cerca de dois terços dos gatos. Filhotes com menos de 3 a 6 meses normalmente não reagem." },
  { id: 'f71', cat: "Plantas", title: "Matatabi", text: "A videira-prateada (Actinidia polygama) funciona em mais gatos que o catnip, inclusive em muitos que não reagem a ele. É vendida em palitos e em pó." },
  { id: 'f72', cat: "Plantas", title: "Valeriana", text: "A raiz de valeriana tem cheiro forte para humanos e efeito estimulante em muitos gatos, parecido com o do catnip." },
  { id: 'f73', cat: "Plantas", title: "Orégano não é catnip", text: "O orégano é da mesma família botânica do catnip, mas não tem o mesmo efeito, e é listado como tóxico para gatos, podendo irritar estômago e intestino. O óleo essencial é ainda mais perigoso. Melhor não oferecer." },
  { id: 'f74', cat: "Plantas", title: "Temperos que não fazem mal", text: "Manjericão, alecrim e tomilho são considerados não tóxicos para gatos. Já hortelã e salsinha podem fazer mal em quantidade." },
  { id: 'f75', cat: "Plantas", title: "Plantas seguras para ter em casa", text: "Clorofito, palmeira-areca, calateia, peperômia e orquídea-borboleta são consideradas não tóxicas para gatos. Mesmo assim, comer muita folha pode dar vômito." },
  { id: 'f76', cat: "Plantas", title: "Plantas perigosas comuns no Brasil", text: "Comigo-ninguém-pode, espada-de-são-jorge, jiboia, costela-de-adão, copo-de-leite, azaleia, babosa e tulipa são tóxicas. Deixe fora do alcance ou fora de casa." },
  { id: 'f77', cat: "Plantas", title: "Palmeira-cica", text: "A cica (Cycas revoluta) é uma das plantas mais perigosas: todas as partes, principalmente as sementes, causam falência do fígado." },
  { id: 'f78', cat: "Plantas", title: "Óleos essenciais", text: "Melaleuca (tea tree), eucalipto, canela, cítricos e outros óleos essenciais são tóxicos para gatos, na pele, por via oral e até no difusor em ambiente fechado." },
  { id: 'f79', cat: "Idade", title: "Idade de gato em anos humanos", text: "A conta mais usada: o primeiro ano equivale a cerca de 15 anos humanos, o segundo soma mais 9 (24 no total) e cada ano seguinte soma uns 4." },
  { id: 'f80', cat: "Idade", title: "Exemplos da conta", text: "6 meses ≈ 10 anos · 1 ano ≈ 15 · 2 anos ≈ 24 · 5 anos ≈ 36 · 10 anos ≈ 56 · 15 anos ≈ 76 · 20 anos ≈ 96." },
  { id: 'f81', cat: "Idade", title: "Sete para um não vale", text: "A regra de multiplicar por 7 não funciona: o gato amadurece muito rápido nos dois primeiros anos e depois envelhece mais devagar." },
  { id: 'f82', cat: "Idade", title: "Fases da vida", text: "Filhote até 1 ano, adulto jovem de 1 a 6, adulto maduro de 7 a 10 e sênior a partir de 10 anos." },
  { id: 'f83', cat: "Idade", title: "Quanto vive um gato", text: "Gatos que vivem dentro de casa costumam chegar a 12 a 18 anos, e muitos passam dos 20. Com acesso à rua a expectativa cai bastante." },
  { id: 'f84', cat: "Idade", title: "A gata mais velha", text: "O recorde registrado é de Creme Puff, uma gata do Texas que viveu 38 anos." },
  { id: 'f85', cat: "Idade", title: "Olhos de filhote", text: "Os filhotes nascem de olhos fechados e os abrem entre 7 e 10 dias. Todos nascem com olhos azulados; a cor definitiva aparece nos meses seguintes." },
  { id: 'f86', cat: "Idade", title: "Dentes de leite", text: "Filhotes têm 26 dentes de leite, trocados por 30 dentes permanentes até cerca de 6 meses." },
  { id: 'f87', cat: "Idade", title: "Idoso precisa de mais consultas", text: "A partir de 7 a 10 anos, exames de rotina a cada 6 a 12 meses ajudam a pegar cedo doença renal, hipertireoidismo e diabetes." },
  { id: 'f88', cat: "Corpo", title: "Audição poderosa", text: "Gatos ouvem sons de até cerca de 64 mil hertz, bem acima dos 20 mil dos humanos. Isso inclui os guinchos ultrassônicos de roedores." },
  { id: 'f89', cat: "Corpo", title: "Saltadores", text: "Um gato saudável salta cerca de cinco a seis vezes o próprio comprimento." },
  { id: 'f90', cat: "Corpo", title: "Clavícula solta", text: "A clavícula do gato é pequena e não se prende aos outros ossos, o que ajuda a passar por espaços apertados." },
  { id: 'f91', cat: "Corpo", title: "Sempre de pé", text: "O reflexo de endireitamento permite girar o corpo no ar e cair de pé. Isso não torna a queda segura: janelas e sacadas precisam de tela." },
  { id: 'f92', cat: "Corpo", title: "Suor nas patas", text: "Gatos suam principalmente pelas almofadinhas das patas. Pegadas úmidas na mesa do veterinário são sinal de nervosismo." },
  { id: 'f93', cat: "Corpo", title: "Língua de lixa", text: "A língua tem pequenas farpas de queratina viradas para trás, que funcionam como pente para o pelo e ajudam a raspar a carne." },
  { id: 'f94', cat: "Corpo", title: "18 dedos", text: "O normal são 5 dedos em cada pata da frente e 4 em cada pata de trás. Gatos polidáctilos nascem com dedos a mais." },
  { id: 'f95', cat: "Corpo", title: "Coração acelerado", text: "O coração de um gato em repouso bate de 140 a 220 vezes por minuto, cerca do dobro do nosso." },
  { id: 'f96', cat: "Corpo", title: "Mais quente que você", text: "A temperatura normal do gato fica entre 38 e 39,2 °C." },
  { id: 'f97', cat: "Corpo", title: "Pontas escuras do siamês", text: "A cor do siamês depende da temperatura: o pigmento só se forma nas partes mais frias do corpo, como orelhas, focinho, patas e rabo." },
  { id: 'f98', cat: "Corpo", title: "Laranjas são quase sempre machos", text: "Cerca de 80% dos gatos laranja são machos, porque o gene dessa cor fica no cromossomo X." },
  { id: 'f99', cat: "Corpo", title: "Brancos de olhos azuis", text: "Gatos brancos de olhos azuis têm chance maior de nascer surdos de um ou dos dois ouvidos." },
  { id: 'f100', cat: "Corpo", title: "Pupila em fenda", text: "A pupila vertical abre e fecha muito mais que a nossa, o que ajuda a enxergar tanto no escuro quanto no sol forte." },
  { id: 'f101', cat: "Corpo", title: "Enxergam mal de pertinho", text: "Gatos não focam bem objetos a menos de uns 25 cm. Para o que está embaixo do nariz, eles usam os bigodes." },
  { id: 'f102', cat: "Comportamento", title: "Hora do agito", text: "Gatos são crepusculares: ficam mais ativos ao amanhecer e ao entardecer, horário de caça dos ancestrais." },
  { id: 'f103', cat: "Comportamento", title: "Cabeçada é carinho", text: "Ao esfregar a cabeça e as bochechas em você, o gato deposita feromônios e marca você como parte do grupo." },
  { id: 'f104', cat: "Comportamento", title: "Rabo em pé", text: "Rabo erguido com a pontinha curvada é cumprimento amistoso. Rabo eriçado é medo, e rabo batendo de um lado para o outro é irritação." },
  { id: 'f105', cat: "Comportamento", title: "Barriga à mostra", text: "Mostrar a barriga é sinal de confiança, mas nem sempre convite para carinho: muitos gatos reagem com patadas." },
  { id: 'f106', cat: "Comportamento", title: "O barulhinho para passarinhos", text: "Aquele estalar de dentes diante da janela é atribuído à excitação e à frustração da caça." },
  { id: 'f107', cat: "Comportamento", title: "Presentes", text: "Trazer presas ou brinquedos para você é comportamento de caça: o instinto continua mesmo com o pote cheio." },
  { id: 'f108', cat: "Comportamento", title: "Amor por caixas", text: "Espaços apertados dão sensação de segurança e ajudam a manter o calor. Em estudos com gatos de abrigo, ter uma caixa reduziu o estresse." },
  { id: 'f109', cat: "Comportamento", title: "Eles sabem o próprio nome", text: "Um estudo japonês de 2019 mostrou que gatos distinguem o próprio nome de outras palavras parecidas. Responder já é outra história." },
  { id: 'f110', cat: "Comportamento", title: "Derrubar coisas", text: "Empurrar objetos da mesa mistura instinto de caça, curiosidade e busca de atenção: se funcionou uma vez, ele repete." },
  { id: 'f111', cat: "Comportamento", title: "Lamber você", text: "Lamber outro gato ou o humano é comportamento social de vínculo, o mesmo que a mãe tem com os filhotes." },
  { id: 'f112', cat: "Comportamento", title: "Sete vidas", text: "No Brasil o gato tem sete vidas; em países de língua inglesa são nove. A fama vem da agilidade e do reflexo de cair de pé." },
  { id: 'f113', cat: "Comportamento", title: "Dez mil anos de convivência", text: "A domesticação começou há cerca de 10 mil anos no Oriente Médio, quando gatos selvagens se aproximaram dos celeiros atrás de roedores." },
  { id: 'f114', cat: "Saúde", title: "Vacinas", text: "Filhotes começam a vacinação por volta de 8 semanas, com reforços, e adultos seguem o calendário do veterinário. No Brasil a antirrábica é anual." },
  { id: 'f115', cat: "Saúde", title: "FIV e FeLV", text: "São vírus transmitidos entre gatos por mordidas e contato próximo. Teste antes de juntar gatos novos aos da casa." },
  { id: 'f116', cat: "Saúde", title: "Produto de cachorro pode matar gato", text: "Antipulgas para cães com permetrina são altamente tóxicos para gatos. Use apenas produtos feitos para gatos." },
  { id: 'f117', cat: "Saúde", title: "Gato esconde a dor", text: "Por instinto, eles disfarçam quando estão doentes. Parar de comer, se esconder, mudar o uso da caixa ou parar de se lamber são sinais de alerta." },
  { id: 'f118', cat: "Saúde", title: "Bolas de pelo", text: "Vomitar uma bola de pelo de vez em quando é comum. Com frequência, merece consulta. Escovar o pelo ajuda, principalmente em gatos de pelo longo." },
  { id: 'f119', cat: "Saúde", title: "Dentes", text: "Doença periodontal é muito comum em gatos adultos. Mau hálito forte, baba e dificuldade para mastigar pedem avaliação." },
  { id: 'f120', cat: "Saúde", title: "Respirar de boca aberta", text: "Gato ofegando de boca aberta não é normal como em cães: se não passar logo depois de brincar, é caso de urgência." },
  { id: 'f121', cat: "Saúde", title: "Rins", text: "Doença renal crônica é uma das mais comuns em gatos idosos. Beber muita água e fazer muito xixi são os primeiros sinais." },
  { id: 'f122', cat: "Saúde", title: "Esporotricose", text: "Micose comum no Brasil, causa feridas que não cicatrizam e passa do gato para pessoas por arranhões e mordidas. Tem tratamento: procure o veterinário." },
  { id: 'f123', cat: "Saúde", title: "Linha, lã e elástico", text: "Fios engolidos podem cortar o intestino. Se vir um fio saindo da boca ou do ânus, não puxe: leve ao veterinário." },
  { id: 'f124', cat: "Cuidados", title: "Tela em janelas e sacadas", text: "Quedas de altura são tão comuns que têm nome: síndrome do gato paraquedista. Rede de proteção em todas as janelas evita." },
  { id: 'f125', cat: "Cuidados", title: "Dentro de casa é mais seguro", text: "Sem acesso à rua, o gato fica longe de atropelamentos, brigas, envenenamentos e doenças, e vive bem mais." },
  { id: 'f126', cat: "Cuidados", title: "Brincar todo dia", text: "Duas sessões curtas por dia com varinha ou bolinha gastam energia e reduzem miados e arranhões de madrugada. Termine deixando ele capturar a presa." },
  { id: 'f127', cat: "Cuidados", title: "Laser com moderação", text: "Como o gato nunca alcança o pontinho, o laser pode frustrar. Encerre a brincadeira com um brinquedo ou petisco que ele possa pegar." },
  { id: 'f128', cat: "Cuidados", title: "Não se arrancam as unhas", text: "A retirada das garras amputa a ponta dos dedos, causa dor crônica e é proibida no Brasil para fins estéticos ou de conveniência. Cortar só a pontinha da unha é seguro." },
  { id: 'f129', cat: "Cuidados", title: "Caixa de transporte amiga", text: "Deixe a caixa aberta pela casa com uma mantinha e petiscos, para que não apareça só em dia de veterinário." },
  { id: 'f130', cat: "Cuidados", title: "Identificação", text: "Microchip e coleira com fecho de segurança e telefone aumentam muito a chance de um gato perdido voltar para casa." },
  { id: 'f131', cat: "Cuidados", title: "Apresentar gatos devagar", text: "Um gato novo deve ficar em cômodo separado no começo, com troca de cheiros e encontros curtos. A adaptação leva dias ou semanas." },
  { id: 'f132', cat: "Cuidados", title: "Banho quase nunca", text: "Gatos saudáveis se limpam sozinhos e raramente precisam de banho. Escovação resolve na maioria dos casos." },
  { id: 'f133', cat: "Cuidados", title: "Lugar para se esconder", text: "Tocas e esconderijos permitem que o gato se afaste quando quer. Não o tire à força de lá." },
  { id: 'f134', cat: "Cuidados", title: "Potes largos e rasos", text: "Muitos gatos preferem potes largos e rasos, de cerâmica, vidro ou inox, que também são mais fáceis de higienizar que os de plástico." },
  { id: 'f135', cat: "Veterinário", title: "Nunca é tarde para a primeira consulta", text: "Um gato adulto que nunca foi ao veterinário pode começar em qualquer idade. A primeira consulta serve para examinar, pesar, olhar dentes e planejar vacinas e exames." },
  { id: 'f136', cat: "Veterinário", title: "Adulto nunca vacinado pode vacinar", text: "Dá para iniciar a vacinação em qualquer idade. Em adultos sem histórico, o usual são duas doses da vacina múltipla com intervalo de 3 a 4 semanas e depois reforços, mais a antirrábica. O veterinário define o esquema." },
  { id: 'f137', cat: "Veterinário", title: "Gato de apartamento também vacina", text: "Mesmo sem sair de casa, o gato pode ter contato com vírus trazidos em sapatos, roupas e mãos, ou numa fuga, internação ou hotelzinho. A antirrábica protege também a família." },
  { id: 'f138', cat: "Veterinário", title: "V3, V4 e V5", text: "A V3 protege contra panleucopenia, rinotraqueíte e calicivirose. A V4 soma a clamidiose, e a V5 soma a leucemia felina (FeLV). Qual usar depende do estilo de vida do gato." },
  { id: 'f139', cat: "Veterinário", title: "Teste antes da V5", text: "Antes de vacinar contra FeLV, o gato precisa de um teste rápido de sangue para FIV e FeLV: a vacina não ajuda quem já tem o vírus." },
  { id: 'f140', cat: "Veterinário", title: "Antirrábica gratuita", text: "Muitas prefeituras brasileiras fazem campanhas anuais de vacinação antirrábica gratuita para cães e gatos. Vale consultar o centro de zoonoses da sua cidade." },
  { id: 'f141', cat: "Veterinário", title: "O que pedir no primeiro check-up", text: "Para um adulto: exame físico completo, teste de FIV e FeLV, hemograma, exames de rim e fígado, exame de urina e avaliação dos dentes. Serve de base para comparar nos anos seguintes." },
  { id: 'f142', cat: "Veterinário", title: "Castrado em mutirão", text: "Gato castrado em ONG ou mutirão normalmente não recebeu vacinas nem exames junto. Vale conferir se há algum cartão ou registro do dia da cirurgia." },
  { id: 'f143', cat: "Veterinário", title: "Check-up anual", text: "Adultos saudáveis devem ir ao veterinário uma vez por ano, mesmo sem sintomas. A partir de 7 anos, o ideal passa a ser a cada 6 meses." },
  { id: 'f144', cat: "Veterinário", title: "Vermífugo e antipulgas", text: "Mesmo gatos que não saem de casa precisam de controle de vermes e pulgas, com frequência e produto definidos pelo veterinário conforme o risco." },
  { id: 'f145', cat: "Veterinário", title: "Veterinário sem pânico", text: "Cubra a caixa de transporte com um pano, leve uma mantinha com o cheiro de casa e, se puder, escolha uma clínica com atendimento voltado a felinos (Cat Friendly)." },
  { id: 'f146', cat: "Veterinário", title: "Mais de um gato", text: "Com vários gatos, leve um de cada vez ou em caixas separadas. Na volta, o cheiro da clínica pode fazer os outros estranharem por algumas horas." },
  { id: 'f147', cat: "Veterinário", title: "Lugares com preço acessível", text: "Hospitais veterinários de universidades, clínicas populares e serviços públicos de algumas cidades oferecem consultas e vacinas mais baratas ou gratuitas." },
  { id: 'f148', cat: "Viagem", title: "Viajar dentro do estado", text: "De carro não há documento obrigatório específico, mas leve a carteira de vacinação com a antirrábica em dia. O gato vai em caixa de transporte presa ao cinto ou no assoalho, nunca solto nem no colo de quem dirige." },
  { id: 'f149', cat: "Viagem", title: "Viajar para outro estado", text: "Leve a carteira de vacinação com a antirrábica válida e um atestado de saúde assinado por veterinário, emitido poucos dias antes. Companhias aéreas e de ônibus exigem os dois; confirme o prazo de validade do atestado com a empresa." },
  { id: 'f150', cat: "Viagem", title: "Antirrábica com antecedência", text: "Para viajar, a vacina antirrábica costuma precisar ter sido aplicada há mais de 30 dias e há menos de um ano. Não deixe para a véspera." },
  { id: 'f151', cat: "Viagem", title: "De avião", text: "Cada companhia tem regras próprias: reserva antecipada, taxa, idade mínima, peso máximo com a caixa para ir na cabine e medidas da caixa. Consulte antes de comprar a passagem." },
  { id: 'f152', cat: "Viagem", title: "Focinho achatado", text: "Raças braquicefálicas, como Persa, Exótico e Himalaio, correm mais risco respiratório e muitas companhias restringem o transporte delas no porão." },
  { id: 'f153', cat: "Viagem", title: "Viajar para outro país", text: "É preciso o Certificado Veterinário Internacional (CVI), emitido pelo Vigiagro, do Ministério da Agricultura, a partir de um atestado de saúde do veterinário. Cada país de destino tem exigências próprias, publicadas no site do ministério." },
  { id: 'f154', cat: "Viagem", title: "Microchip", text: "Muitos países, como os da União Europeia, exigem microchip no padrão ISO 11784/11785, implantado antes ou no mesmo dia da vacina antirrábica que vale para a viagem." },
  { id: 'f155', cat: "Viagem", title: "Sorologia da raiva", text: "Para a União Europeia, saindo do Brasil, é exigido um exame de sangue que comprova os anticorpos contra a raiva, feito em laboratório aprovado, e é preciso esperar 90 dias após a coleta para embarcar." },
  { id: 'f156', cat: "Viagem", title: "Comece meses antes", text: "Somando microchip, vacina, sorologia e prazos de espera, uma viagem internacional com gato pede pelo menos quatro meses de preparo. Alguns países ainda exigem quarentena na chegada." },
  { id: 'f157', cat: "Viagem", title: "O certificado vale pouco tempo", text: "O CVI tem validade curta, de poucos dias para a entrada no país de destino. A emissão precisa ser marcada bem perto da data do voo." },
  { id: 'f158', cat: "Viagem", title: "A volta também tem regra", text: "Para voltar ao Brasil o gato precisa de certificado veterinário do país de onde está saindo e de vacina antirrábica válida." },
  { id: 'f159', cat: "Viagem", title: "Na estrada", text: "Forre a caixa com tapete higiênico e uma mantinha com cheiro de casa, evite alimentar nas duas ou três horas antes de sair, ofereça água nas paradas e nunca abra a caixa com portas ou janelas do carro abertas." },
  { id: 'f160', cat: "Viagem", title: "Calmante só com receita", text: "Não dê sedativo por conta própria: alguns são perigosos, principalmente em voos. Se o gato sofre muito para viajar, o veterinário indica o que pode ser usado." },
  { id: 'f161', cat: "Viagem", title: "Às vezes é melhor ficar", text: "Gatos são apegados ao território e muitos se estressam mais viajando do que ficando em casa com alguém de confiança cuidando deles." },
  { id: 'f162', cat: "Corpo", title: "Gatos vesgos", text: "O estrabismo convergente é comum em siameses e parentes. O mesmo gene da pelagem faz parte dos nervos ópticos se ligar ao lado errado do cérebro, e cruzar os olhos é a forma de compensar." },
  { id: 'f163', cat: "Corpo", title: "Como um gato vesgo enxerga", text: "Ele enxerga bem no dia a dia, sem dor e sem visão dupla, porque o cérebro se adapta desde filhote. A principal perda é na noção de profundidade, então pode calcular saltos com um pouco menos de precisão." },
  { id: 'f164', cat: "Saúde", title: "Vesgo de repente", text: "Estrabismo de nascença não preocupa. Já um gato adulto que fica vesgo de repente, com cabeça torta ou andar cambaleante, precisa de veterinário: pode ser problema neurológico ou de ouvido interno." },
  { id: 'f165', cat: "Saúde", title: "Por que gatos roncam", text: "No sono profundo os músculos da garganta relaxam e o ar faz o tecido vibrar, como em nós. Um ronco baixinho e regular, em um gato que acorda bem e respira normalmente, costuma ser normal." },
  { id: 'f166', cat: "Saúde", title: "Quem ronca mais", text: "Gatos de focinho achatado, como Persa, Exótico e Himalaio, roncam mais por causa das vias aéreas curtas. Excesso de peso e dormir todo torcido, com a cabeça dobrada, também aumentam o ronco." },
  { id: 'f167', cat: "Saúde", title: "Quando o ronco preocupa", text: "Procure o veterinário se o ronco começou de repente ou piorou, se o gato faz barulho para respirar acordado, respira de boca aberta, espirra, tem secreção no nariz ou nos olhos, tosse, perdeu o apetite ou mudou o miado." },
  { id: 'f168', cat: "Comportamento", title: "Ronco ou ronrom dormindo?", text: "Muitos gatos ronronam cochilando, e o som se confunde com ronco. O ronrom é contínuo e acontece ao inspirar e ao expirar; o ronco aparece mais na inspiração e some quando o gato muda de posição." },
  { id: 'f169', cat: "Fofuras", title: "Por que eles nos seguem até o banheiro", text: "Para o gato, a casa inteira é território dele e porta fechada é mistério. Somam-se a curiosidade, a rotina (você sempre vai lá depois de acordar) e o fato de que ali você fica parado e disponível para carinho." },
  { id: 'f196', cat: "Fofuras", title: "“Vai lá que eu vigio”", text: "Uma teoria querida entre tutores diz que o gato acompanha você no banheiro para montar guarda, já que na natureza a hora das necessidades é um momento vulnerável. Ninguém comprovou isso, mas combina com o jeito deles: gatos que confiam uns nos outros ficam por perto nessas horas." },
  { id: 'f170', cat: "Fofuras", title: "Dormir nos seus pés", text: "É quentinho, tem o seu cheiro e você se mexe menos ali do que no resto da cama. Também é um ponto de onde ele sai rápido se precisar, então junta companhia com segurança." },
  { id: 'f171', cat: "Fofuras", title: "Dormir na sua barriga ou no peito", text: "É a parte mais quente e macia, e o ritmo da sua respiração e do coração acalma, como acontecia junto da mãe e dos irmãos." },
  { id: 'f172', cat: "Fofuras", title: "Dormir na sua cabeça", text: "A cabeça solta bastante calor, fica parada a noite toda e o cabelo guarda o seu cheiro. De quebra, é perto do rosto de quem ele confia." },
  { id: 'f173', cat: "Fofuras", title: "Escolher dormir com você é confiança", text: "Dormindo o gato fica vulnerável. Escolher dormir encostado em alguém é sinal de que ele se sente seguro com essa pessoa." },
  { id: 'f174', cat: "Fofuras", title: "Gatos têm cristais de energia?", text: "Não há nenhuma evidência científica de que gatos tenham cristais, absorvam ou limpem energias. O que existe é mais simples e bonito: a companhia deles relaxa, e fazer carinho em um gato reduz o estresse de muita gente." },
  { id: 'f175', cat: "Fofuras", title: "O poder do ronrom", text: "O ronrom vibra em frequências baixas, e alguns pesquisadores levantaram a hipótese de que isso ajude na recuperação de ossos e tecidos do próprio gato. É uma hipótese, não algo comprovado, e não vale como tratamento para humanos." },
  { id: 'f176', cat: "Fofuras", title: "Eles miam o nosso nome?", text: "Não é o seu nome em “gatês”, mas chega perto: cada gato desenvolve miados próprios para o seu humano, um vocabulário particular que só vocês dois entendem. Gatos adultos quase não miam entre si; o miado é coisa de gato com gente." },
  { id: 'f177', cat: "Fofuras", title: "Eles sabem o seu nome?", text: "Estudos japoneses indicam que gatos reconhecem o próprio nome e que podem associar o nome de companheiros da casa ao rosto deles. Para pessoas, isso apareceu mais em gatos de famílias grandes." },
  { id: 'f178', cat: "Fofuras", title: "Eles reconhecem a sua voz", text: "Em testes, gatos distinguiram a voz do tutor da voz de estranhos, mexendo orelhas e cabeça. Só não se deram ao trabalho de levantar." },
  { id: 'f179', cat: "Fofuras", title: "A mãe reconhece os filhos depois de grandes?", text: "O reconhecimento é pelo cheiro, não pela ideia de “meu filho”. Se mãe e filhotes continuam morando juntos, o cheiro familiar se mantém e eles seguem como companheiros próximos: dormem juntos e se lambem. O vínculo fica, mas mais como membros do mesmo grupo do que como mãe e filho." },
  { id: 'f180', cat: "Fofuras", title: "E se forem separados?", text: "Depois de algumas semanas separados o cheiro muda, e mãe e filhote tendem a se tratar como gatos desconhecidos ao se reencontrar. Por isso irmãos e pais também cruzam entre si: castrar vale para a família toda." },
  { id: 'f181', cat: "Fofuras", title: "Gatos se apegam de verdade", text: "Num estudo de 2019, cerca de dois terços dos gatos mostraram apego seguro ao tutor, proporção parecida com a de bebês humanos e de cães. A fama de indiferentes é injusta." },
  { id: 'f182', cat: "Fofuras", title: "Para ele, você é um gatão", text: "Uma hipótese conhecida é a de que os gatos nos tratam como tratariam outro gato, grande e meio desajeitado: esfregam, lambem, amassam e levantam o rabo para a gente do mesmo jeito." },
  { id: 'f183', cat: "Fofuras", title: "O “prrrt” de boas-vindas", text: "Aquele som curtinho e enrolado quando você chega é um cumprimento. É o mesmo som que a mãe usa para chamar os filhotes." },
  { id: 'f184', cat: "Fofuras", title: "Mostrar o bumbum", text: "Virar de costas e levantar o rabo na sua cara é educação felina: entre gatos, deixar cheirar é cumprimento de quem confia." },
  { id: 'f185', cat: "Fofuras", title: "Mordidinha de amor", text: "Mordidas leves durante o carinho costumam ser brincadeira ou excesso de estímulo, não raiva. Se vier com orelhas para trás e rabo batendo, é hora de parar." },
  { id: 'f186', cat: "Fofuras", title: "Lamber o seu cabelo", text: "Gatos amigos se lambem para misturar os cheiros e reforçar o vínculo. Quando ele lambe você, está cuidando de alguém do grupo." },
  { id: 'f187', cat: "Fofuras", title: "Trazer brinquedos para a cama", text: "Deixar brinquedos perto de você ou no seu travesseiro pode ser convite para brincar ou o gesto de guardar a “caça” em lugar seguro: o seu." },
  { id: 'f188', cat: "Fofuras", title: "Sentar no teclado, no livro, no papel", text: "O notebook é quentinho, e aquilo que tem a sua atenção passa a ser o lugar mais interessante da casa. Ele quer estar onde você está olhando." },
  { id: 'f189', cat: "Fofuras", title: "Posição de pãozinho", text: "Com as patas dobradas embaixo do corpo, o gato está relaxado e guardando calor. Não é posição de quem pretende sair correndo." },
  { id: 'f190', cat: "Fofuras", title: "Dormir de barriga para cima", text: "A barriga é a parte mais vulnerável do corpo. Gato que dorme assim está muito à vontade no ambiente (e provavelmente com calor)." },
  { id: 'f191', cat: "Fofuras", title: "Eles sonham", text: "Gatos têm sono REM como nós. Bigodes tremendo, patinhas mexendo e miadinhos dormindo são sinais de que provavelmente estão sonhando." },
  { id: 'f192', cat: "Fofuras", title: "Encostar o nariz", text: "Tocar focinho com focinho é cumprimento entre gatos amigos. Se ele faz isso com o seu nariz ou com o seu dedo, você entrou para o clube." },
  { id: 'f193', cat: "Fofuras", title: "Ficar de costas para você", text: "Sentar de costas não é desprezo: é confiar em você para vigiar a retaguarda enquanto ele cuida da frente." },
  { id: 'f194', cat: "Fofuras", title: "Banho de sol", text: "Gatos procuram o quadradinho de sol porque gostam de calor e porque ficar aquecido economiza energia, ainda mais durante as sonecas." },
  { id: 'f195', cat: "Fofuras", title: "Esperar você na porta", text: "Muitos gatos aprendem a rotina da casa e reconhecem sons como seus passos, as chaves ou o carro, e por isso já estão na porta quando você chega." }
];

// Destaques do CuriousCats ("Mais importantes"), pelo título, na ordem em que aparecem.
const TOP_FACTS = [
  "Macho que não consegue urinar é emergência",
  "Gato que para de comer",
  "Respirar de boca aberta",
  "Por que gatos roncam",
  "Quando o ronco preocupa",
  "Gato esconde a dor",
  "Lírios são perigosos",
  "Comidas proibidas",
  "Cebola, alho e parentes",
  "Remédio de gente pode matar",
  "Produto de cachorro pode matar gato",
  "Plantas perigosas comuns no Brasil",
  "Orégano não é catnip",
  "Por que eles comem grama",
  "Nunca é tarde para a primeira consulta",
  "Adulto nunca vacinado pode vacinar",
  "Check-up anual",
  "Quando vem o primeiro cio",
  "Como é o cio da gata",
  "Castração",
  "Quando passar para ração de adulto",
  "Como trocar de ração",
  "Regra da caixa de areia",
  "A melhor areia é a que o gato usa",
  "Por que o xixi sai para trás",
  "Tela em janelas e sacadas",
  "Brincar todo dia",
  "Arranhar é necessidade",
  "Idade de gato em anos humanos",
  "Fases da vida",
  "Piscada lenta",
  "Rabo em pé",
  "Bigodes são sensores",
  "Como um gato vesgo enxerga",
  "Viajar para outro estado",
  "Viajar para outro país"
];

const MEOW_REPLIES = [
  'Miau! 😺', 'Prrrrr… gostei disso.', 'Meu humano mandou dizer: kkkkk', 'Agora não posso, estou amassando pãozinho.',
  'Miau miau? (tradução: manda foto!)', 'Acabei de derrubar um copo pra comemorar.', 'Ronronando aqui 💙', 'Bora marcar um meow-papo depois da soneca?'
];

// Guia de compras: marcas mais repetidas em rankings brasileiros e preços médios de lojas online.
const SHOP = {
  "date": "outubro de 2026",
  "groups": [
    {
      "name": "Ração",
      "unit": "por kg",
      "note": "Linha para adultos castrados. Preço por quilo em pacotes grandes.",
      "tiers": [
        {
          "tier": "Cara",
          "brand": "N&D Prime",
          "q": "ração n&d prime gatos castrados",
          "price": "R$ 50",
          "pack": "Pacote: 7,5 kg por R$ 366 a R$ 396",
          "why": "Sem grãos e com bastante carne.",
          "also": "Biofresh"
        },
        {
          "tier": "Média",
          "brand": "Premier",
          "q": "ração premier gatos castrados",
          "price": "R$ 28",
          "pack": "Pacote: 7,5 kg por R$ 187 a R$ 250",
          "why": "Super premium com boa aceitação.",
          "also": "Royal Canin (cerca de R$ 30/kg) e Guabi Natural"
        },
        {
          "tier": "Barata",
          "brand": "Golden Gatos",
          "q": "ração golden gatos castrados",
          "price": "R$ 16",
          "pack": "Pacote: 10,1 kg por R$ 143 a R$ 180",
          "why": "A mais citada em custo-benefício.",
          "also": "GranPlus (cerca de R$ 14/kg)"
        }
      ]
    },
    {
      "name": "Areia",
      "unit": "por kg",
      "note": "Preço por quilo. O gasto do mês depende de quanto cada tipo rende.",
      "tiers": [
        {
          "tier": "Cara",
          "brand": "Viva Verde",
          "q": "areia viva verde gatos",
          "price": "R$ 15",
          "pack": "Pacote: 4 kg por R$ 53 a R$ 69",
          "why": "Vegetal, grãos finos, torrões firmes e biodegradável.",
          "also": "Chalesco sílica (cerca de R$ 20/kg)"
        },
        {
          "tier": "Média",
          "brand": "Pipicat Classic",
          "q": "areia pipicat classic",
          "price": "R$ 5",
          "pack": "Pacote: 4 kg por R$ 18 a R$ 20",
          "why": "Bentonita tradicional, boa absorção.",
          "also": ""
        },
        {
          "tier": "Barata",
          "brand": "Ipet Wood’s",
          "q": "granulado de madeira gatos",
          "price": "R$ 3",
          "pack": "Pacote: 20 kg por R$ 56 a R$ 70",
          "why": "Granulado de madeira: rende muito e vai melhor em caixa com peneira.",
          "also": "granulado de pinus genérico (15 kg por R$ 40 a R$ 45)"
        }
      ]
    },
    {
      "name": "Caixa de areia",
      "unit": "a unidade",
      "note": "O tamanho importa mais que a marca: cerca de uma vez e meia o comprimento do gato.",
      "tiers": [
        {
          "tier": "Cara",
          "brand": "Animaux Premium (fechada)",
          "q": "caixa de areia fechada gatos",
          "price": "R$ 300",
          "pack": "Fechadas vão de R$ 160 a R$ 370",
          "why": "Com tampa e porta: segura melhor a areia espalhada e dá privacidade.",
          "also": "fechadas de inox"
        },
        {
          "tier": "Média",
          "brand": "Chalesco Furba (com peneira)",
          "q": "caixa de areia furba chalesco",
          "price": "R$ 120",
          "pack": "Entre R$ 119 e R$ 127",
          "why": "Bandejas com peneira que facilitam separar a sujeira. Combina com granulado.",
          "also": "Furacão Pet Furba"
        },
        {
          "tier": "Barata",
          "brand": "Jel Plast Furba",
          "q": "caixa de areia furba gatos",
          "price": "R$ 55",
          "pack": "Por volta de R$ 55",
          "why": "Modelo básico e barato, que resolve bem.",
          "also": "bandejas abertas simples"
        }
      ]
    },
    {
      "name": "Fonte de água",
      "unit": "a unidade",
      "note": "Água corrente estimula o gato a beber mais.",
      "tiers": [
        {
          "tier": "Cara",
          "brand": "Cat My Pet Magicat",
          "q": "fonte magicat cat my pet",
          "price": "R$ 350",
          "pack": "Entre R$ 333 e R$ 370",
          "why": "Fonte grande, de marca nacional conhecida.",
          "also": ""
        },
        {
          "tier": "Média",
          "brand": "Amicus Aqua Mini",
          "q": "fonte amicus aqua mini",
          "price": "R$ 110",
          "pack": "Entre R$ 91 e R$ 130",
          "why": "Bivolt e compacta. A versão de cerâmica sai por cerca de R$ 180.",
          "also": "fontes de inox de 3 L (cerca de R$ 180)"
        },
        {
          "tier": "Barata",
          "brand": "Fonte genérica com filtro",
          "q": "fonte de água gatos",
          "price": "R$ 45",
          "pack": "Entre R$ 43 e R$ 50",
          "why": "Modelos de 1,5 L com filtro já cumprem a função.",
          "also": ""
        }
      ]
    },
    {
      "name": "Arranhador",
      "unit": "a unidade",
      "note": "Tem que ser firme e alto o bastante para o gato se esticar.",
      "tiers": [
        {
          "tier": "Cara",
          "brand": "São Pet Torre",
          "q": "arranhador torre são pet",
          "price": "R$ 700",
          "pack": "Entre R$ 590 e R$ 800 (1,12 m de altura)",
          "why": "Torre com andares: arranhador, cama e mirante de uma vez.",
          "also": "Meau Torre 5 andares (cerca de R$ 600)"
        },
        {
          "tier": "Média",
          "brand": "Meau Poste de Sisal",
          "q": "arranhador poste sisal gatos",
          "price": "R$ 130",
          "pack": "Entre R$ 112 e R$ 150",
          "why": "Poste de sisal, o formato que a maioria dos gatos prefere.",
          "also": "postes simples a partir de R$ 45"
        },
        {
          "tier": "Barata",
          "brand": "Furacão Pet (papelão)",
          "q": "arranhador papelão furacão pet",
          "price": "R$ 50",
          "pack": "Entre R$ 45 e R$ 52",
          "why": "De chão, em papelão: barato, e muitos gatos adoram. Precisa ser trocado quando desgasta.",
          "also": "rampa de papelão (cerca de R$ 72)"
        }
      ]
    }
  ],
  "tips": [
    {
      "name": "Areia e respiração",
      "items": [
        [
          "Areia com muito pó",
          "A poeira fina de algumas areias pode irritar nariz, olhos e vias respiratórias, principalmente em gatos sensíveis ou alérgicos. Espirros, tosse, secreção no nariz ou olhos irritados depois de usar a caixa são sinais para trocar de areia e falar com o veterinário."
        ],
        [
          "Bentonita é a que mais levanta pó",
          "As areias de argila são as mais associadas a poeira. Esse pó contém sílica cristalina, que pode ser inalada. As versões “sem pó” ou “low dust” reduzem o problema, mas não eliminam."
        ],
        [
          "Sílica em cristais não é a mesma coisa",
          "A areia de sílica em gel é feita de sílica amorfa, diferente da cristalina da poeira de argila, e solta menos pó. A ressalva dela é outra: não deve ser ingerida, o que pede atenção com filhotes."
        ],
        [
          "Areia perfumada",
          "Perfume agrada o humano, não o gato. Gatos costumam preferir areia sem cheiro, e fragrância forte é mais um irritante para quem já tem o nariz sensível."
        ],
        [
          "Para gato com asma ou bronquite",
          "As opções com menos partículas no ar são granulado de madeira, areias vegetais de milho ou mandioca e as de papel. Despeje devagar, em lugar ventilado, e confirme a escolha com o veterinário."
        ],
        [
          "Filhote e areia aglomerante",
          "Filhotes pequenos podem comer areia por curiosidade, e as que aglomeram formam massa no estômago. Para eles, prefira granulado de madeira ou areia vegetal."
        ],
        [
          "O que se sabe de verdade",
          "Há poucos estudos sobre areia e doença respiratória em gatos, e os resultados não são conclusivos. Evitar pó e perfume é precaução razoável, não uma certeza científica."
        ]
      ]
    },
    {
      "name": "Antes de comprar",
      "items": [
        [
          "Mesmo preço, qualidade diferente",
          "Whiskas custa quase o mesmo que Golden e GranPlus, mas os guias colocam essas duas acima em qualidade. Na faixa barata, compare o rótulo antes do preço."
        ],
        [
          "Sílica: cara no quilo, não no mês",
          "Um pacote de 1,8 kg da Chalesco sai por cerca de R$ 36 e pode durar até um mês para um gato, o que aproxima o gasto mensal da faixa média."
        ],
        [
          "Pacote grande sai mais barato",
          "O mesmo produto em pacote de 1,5 kg pode custar o dobro por quilo do que no de 7,5 ou 10 kg. Guarde a ração bem fechada e em lugar seco."
        ],
        [
          "Caixa fechada nem sempre é melhor",
          "A tampa segura cheiro e pó lá dentro, bem onde o gato respira, e alguns gatos se recusam a usar. Se for fechada, limpe com mais frequência."
        ],
        [
          "Caixa autolimpante",
          "As automáticas custam na faixa de R$ 2.500 ou mais. São conforto para o humano, não necessidade do gato, e ele precisa de adaptação gradual."
        ],
        [
          "Fonte tem custo escondido",
          "Modelos com filtro de carvão pedem troca periódica do refil, e toda fonte precisa ser desmontada e lavada toda semana para não juntar limo."
        ],
        [
          "Arranhador que balança não serve",
          "Se o poste tomba ou é baixo demais, o gato volta para o sofá. Coloque perto de onde ele dorme e de onde já costuma arranhar."
        ],
        [
          "Quem escolhe é o gato (e o veterinário)",
          "Idade, castração, peso e saúde urinária mudam a ração ideal. E a melhor areia continua sendo a que o gato aceita usar."
        ]
      ]
    }
  ]
};

// Posts de demonstração da timeline. "h" é há quantas horas o post foi feito.
const SEED_POSTS = [
  { id: 'p1', cat: 'c13', caption: "Alongamento do dia: 100% barriga para cima.", likes: 412, h: 1 },
  { id: 'p2', cat: 'c5', caption: "Corrida das 3 da manhã: novo recorde no corredor.", likes: 933, h: 2 },
  { id: 'p3', cat: 'c18', caption: "Reunião cancelada: deitei no teclado.", likes: 268, h: 3 },
  { id: 'p4', cat: 'c2', caption: "Turno de soneca número 4 do dia concluído com sucesso.", likes: 248, h: 5 },
  { id: 'p5', cat: 'c9', caption: "Vigiando os passarinhos da janela. Trabalho sério.", likes: 154, h: 7 },
  { id: 'p6', cat: 'c7', caption: "A cama nova chegou. Fiquei com a caixa.", likes: 512, h: 9 },
  { id: 'p7', cat: 'c12', caption: "Primeira neve da vida. Gelado, mas aprovado.", likes: 317, h: 12 },
  { id: 'p8', cat: 'c3', caption: "Reclamei do pote meio vazio por 40 minutos. Funcionou.", likes: 97, h: 16 },
  { id: 'p9', cat: 'c16', caption: "De olho no aquário. Só olhando, juro.", likes: 201, h: 20 },
  { id: 'p10', cat: 'c10', caption: "Tomando sol no muro, como manda a tradição.", likes: 88, h: 26 },
  { id: 'p11', cat: 'c1', caption: "Derrubei um copo hoje. Foi sem querer querendo.", likes: 128, h: 30 },
  { id: 'p12', cat: 'c14', caption: "Miei até abrirem a porta. Depois não quis sair.", likes: 76, h: 36 },
  { id: 'p13', cat: 'c4', caption: "Dizem que sou grande. Eu digo que o sofá é que é pequeno.", likes: 510, h: 44 },
  { id: 'p14', cat: 'c17', caption: "Achei um lugar novo para dormir: em cima da roupa limpa.", likes: 59, h: 52 },
  { id: 'p15', cat: 'c8', caption: "Olhei para a humana até ela me dar colo. Técnica infalível.", likes: 233, h: 60 },
  { id: 'p16', cat: 'c11', caption: "Apareci do nada na cozinha de novo. Ninguém me viu chegar.", likes: 145, h: 72 },
  { id: 'p17', cat: 'c6', caption: "Aceito sachê. Ração seca só em último caso.", likes: 189, h: 90 },
  { id: 'p18', cat: 'c15', caption: "Escovada do dia feita. Sobrou pelo para outro gato.", likes: 122, h: 110 }
];
