/**
 * ███████╗ ██████╗  ██████╗██╗ █████╗ ██╗
 * ██╔════╝██╔═══██╗██╔════╝██║██╔══██╗██║
 * ███████╗██║   ██║██║     ██║███████║██║
 * ╚════██║██║   ██║██║     ██║██╔══██║██║
 * ███████║╚██████╔╝╚██████╗██║██║  ██║███████╗
 * ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝
 *
 * MVP de Rede Social com Algoritmo de Recomendação
 * v2 — Comentários funcionais + Grade de curtidas no perfil
 *
 * Como usar:
 *   npx create-expo-app SociaiApp
 *   cd SociaiApp
 *   Substitua App.js por este arquivo.
 *   npx expo start
 *
 * Sem dependências extras — @expo/vector-icons já vem no Expo.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────
// CONSTANTES DE CATEGORIAS
// ─────────────────────────────────────────────
const CATEGORIES = [
  "Esporte", "Música", "Notícia", "Nutrição", "Saúde",
  "Segurança", "Cinema", "Artes", "Culinária", "Estudos",
];

const CATEGORY_META = {
  Esporte:   { icon: "football",         color: "#FF6B35" },
  Música:    { icon: "musical-notes",    color: "#A855F7" },
  Notícia:   { icon: "newspaper",        color: "#3B82F6" },
  Nutrição:  { icon: "nutrition",        color: "#22C55E" },
  Saúde:     { icon: "heart",            color: "#EF4444" },
  Segurança: { icon: "shield-checkmark", color: "#6366F1" },
  Cinema:    { icon: "film",             color: "#F59E0B" },
  Artes:     { icon: "color-palette",    color: "#EC4899" },
  Culinária: { icon: "restaurant",       color: "#14B8A6" },
  Estudos:   { icon: "book",             color: "#8B5CF6" },
};

// ─────────────────────────────────────────────
// DATABASE DE POSTS (10 por categoria = 100 posts)
// ─────────────────────────────────────────────
const DATABASE_POSTS = [
  // ESPORTE
  { id: "e1",  category: "Esporte",   author: "Carlos Mendes",    avatar: "https://randomuser.me/api/portraits/men/11.jpg", text: "Treino de força hoje foi brutal! Novo recorde pessoal no supino: 120kg. Consistência é tudo nesse esporte.", image: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=700&q=85", likes: 312 },
  { id: "e2",  category: "Esporte",   author: "Fernanda Lima",    avatar: "https://randomuser.me/api/portraits/women/47.jpg", text: "Maratona de São Paulo 2025 - 42km completados em 3h47min! A superação começa quando você quer desistir.", image: "https://images.unsplash.com/photo-1465208450638-83c1e00e53c0?w=700&q=85", likes: 891 },
  { id: "e3",  category: "Esporte",   author: "Rafael Costa",     avatar: "https://randomuser.me/api/portraits/men/53.jpg", text: "Brasil vs Argentina. A rivalidade mais clássica do futebol sul-americano. Qual lado você está?", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&q=85", likes: 2341 },
  { id: "e4",  category: "Esporte",   author: "Juliana Rocha",    avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "Surf no litoral norte de SP hoje de manhã! As ondas estavam perfeitas, 2 metros de pico!", image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&q=85", likes: 567 },
  { id: "e5",  category: "Esporte",   author: "Bruno Alves",      avatar: "https://randomuser.me/api/portraits/men/15.jpg", text: "Tênis de mesa: o esporte que poucos praticam mas TODOS amam assistir. Reflexo, estratégia e precisão.", image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=700&q=85", likes: 234 },
  { id: "e6",  category: "Esporte",   author: "Ana Beatriz",      avatar: "https://randomuser.me/api/portraits/women/23.jpg", text: "Escalada em rocha. Cada subida é uma batalha mental. A parede não cede, mas você aprende a ceder.", image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=700&q=85", likes: 445 },
  { id: "e7",  category: "Esporte",   author: "Pedro Vieira",     avatar: "https://randomuser.me/api/portraits/men/32.jpg", text: "Natação ao amanhecer: 3km hoje antes do trabalho. A água gelada acorda melhor que qualquer café!", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=700&q=85", likes: 678 },
  { id: "e8",  category: "Esporte",   author: "Larissa Moura",    avatar: "https://randomuser.me/api/portraits/women/48.jpg", text: "Vôlei de praia é minha paixão! Campeonato estadual semana que vem. Alguém torcendo por mim?", image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=700&q=85", likes: 356 },
  { id: "e9",  category: "Esporte",   author: "Diego Santos",     avatar: "https://randomuser.me/api/portraits/men/7.jpg",  text: "MMA: arte marcial mista ou arte marcial completa? Treino de Jiu-jitsu e Muay Thai hoje no mesmo dia.", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=700&q=85", likes: 789 },
  { id: "e10", category: "Esporte",   author: "Camila Ferreira",  avatar: "https://randomuser.me/api/portraits/women/41.jpg", text: "Ciclismo urbano: percorri 35km pela cidade hoje. Menos carro, mais saúde e mais conexão com SP.", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700&q=85", likes: 521 },
  // MÚSICA
  { id: "m1",  category: "Música",    author: "Lucas Santana",    avatar: "https://randomuser.me/api/portraits/men/13.jpg", text: "Novo álbum do Kendrick Lamar é simplesmente obra-prima. Cada faixa é uma camada de profundidade lírica.", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=85", likes: 1203 },
  { id: "m2",  category: "Música",    author: "Isabela Cruz",     avatar: "https://randomuser.me/api/portraits/women/46.jpg", text: "Festival Lollapalooza 2026 confirmado! A lineup está absurda. Já garantiu seu ingresso?", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=85", likes: 3412 },
  { id: "m3",  category: "Música",    author: "Matheus Lima",     avatar: "https://randomuser.me/api/portraits/men/17.jpg", text: "Produzindo minha primeira beat do zero. O processo criativo é viciante. DAW, samples e muito café.", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=700&q=85", likes: 567 },
  { id: "m4",  category: "Música",    author: "Renata Campos",    avatar: "https://randomuser.me/api/portraits/women/39.jpg", text: "Samba de raiz: a música que mais conta a história do povo brasileiro. Pagode do fim de semana foi incrível.", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&q=85", likes: 892 },
  { id: "m5",  category: "Música",    author: "Felipe Duarte",    avatar: "https://randomuser.me/api/portraits/men/21.jpg", text: "Tocando violão há 10 anos e ainda me emociono quando a música sai do jeito certo. Nunca pare de praticar.", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=700&q=85", likes: 445 },
  { id: "m6",  category: "Música",    author: "Vitória Neves",    avatar: "https://randomuser.me/api/portraits/women/43.jpg", text: "Jazz ao vivo num bar de São Paulo. Improvisação pura, presença total. Isso é música de verdade.", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&q=85", likes: 712 },
  { id: "m7",  category: "Música",    author: "Gabriel Ramos",    avatar: "https://randomuser.me/api/portraits/men/10.jpg", text: "Playlist para estudar: lo-fi, rain sounds e um pouco de Bach. Produtividade aumenta 40% com música certa.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85", likes: 2134 },
  { id: "m8",  category: "Música",    author: "Aline Costa",      avatar: "https://randomuser.me/api/portraits/women/45.jpg", text: "Forró pé de serra é o gênero mais dançante do Brasil. Acordeom, triângulo e zabumba: uma fórmula perfeita.", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=700&q=85", likes: 634 },
  { id: "m9",  category: "Música",    author: "Thiago Barbosa",   avatar: "https://randomuser.me/api/portraits/men/8.jpg",  text: "Produção musical em casa ficou acessível demais. Com um bom microfone e interface de áudio, você grava um álbum.", image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=700&q=85", likes: 987 },
  { id: "m10", category: "Música",    author: "Bruna Oliveira",   avatar: "https://randomuser.me/api/portraits/women/38.jpg", text: "Música clássica não é chata! Beethoven sinfonia nº 9 dura 1 hora e você não pisca. Experimente.", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=700&q=85", likes: 456 },
  // NOTÍCIA
  { id: "n1",  category: "Notícia",   author: "Jornalismo BR",    avatar: "https://randomuser.me/api/portraits/men/27.jpg", text: "URGENTE: Banco Central anuncia corte na taxa Selic. Mercado reage positivamente com alta nas bolsas.", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=85", likes: 4521 },
  { id: "n2",  category: "Notícia",   author: "Tech News BR",     avatar: "https://randomuser.me/api/portraits/men/28.jpg", text: "OpenAI lança GPT-5 com capacidade de raciocínio inédita. Especialistas debatem impacto no mercado de trabalho.", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=85", likes: 8932 },
  { id: "n3",  category: "Notícia",   author: "Clima Agora",      avatar: "https://randomuser.me/api/portraits/women/29.jpg", text: "COP31 no Brasil: acordos climáticos históricos assinados por 145 países. Meta: carbono zero até 2040.", image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=700&q=85", likes: 3211 },
  { id: "n4",  category: "Notícia",   author: "Economia Hoje",    avatar: "https://randomuser.me/api/portraits/men/30.jpg", text: "Inflação recua para 3.2% em abril. IPCA abaixo da meta pelo segundo mês consecutivo, segundo IBGE.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=85", likes: 1678 },
  { id: "n5",  category: "Notícia",   author: "Ciência BR",       avatar: "https://randomuser.me/api/portraits/men/31.jpg", text: "Pesquisadores da USP desenvolvem vacina contra dengue 100% nacional. Ensaios clínicos começam em agosto.", image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=700&q=85", likes: 5678 },
  { id: "n6",  category: "Notícia",   author: "Política BR",      avatar: "https://randomuser.me/api/portraits/men/33.jpg", text: "Reforma tributária entra em vigor. Entenda como o novo sistema simplifica impostos para pessoas físicas.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=85", likes: 2345 },
  { id: "n7",  category: "Notícia",   author: "Espaço News",      avatar: "https://randomuser.me/api/portraits/men/34.jpg", text: "NASA confirma: missão Artemis IV levará astronautas ao polo sul da Lua em 2026. Primeiro pouso em 54 anos.", image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=700&q=85", likes: 9123 },
  { id: "n8",  category: "Notícia",   author: "Saúde Pública",    avatar: "https://randomuser.me/api/portraits/women/35.jpg", text: "OMS declara fim da pandemia de mpox. Vacinação global e rastreamento foram fundamentais para o controle.", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=700&q=85", likes: 4321 },
  { id: "n9",  category: "Notícia",   author: "Energia Verde",    avatar: "https://randomuser.me/api/portraits/women/36.jpg", text: "Brasil atinge marca histórica: 95% da energia elétrica vinda de fontes renováveis. Referência mundial.", image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=85", likes: 6789 },
  { id: "n10", category: "Notícia",   author: "Educação BR",      avatar: "https://randomuser.me/api/portraits/women/37.jpg", text: "MEC amplia bolsas do ProUni em 40%. Mais de 200 mil novos estudantes terão acesso ao ensino superior.", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&q=85", likes: 3456 },
  // NUTRIÇÃO
  { id: "nu1", category: "Nutrição",  author: "Dra. Mariana",     avatar: "https://randomuser.me/api/portraits/women/49.jpg", text: "Proteína no café da manhã muda tudo! Ovos + Greek yogurt + granola. Saciedade até o almoço garantida.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=85", likes: 2134 },
  { id: "nu2", category: "Nutrição",  author: "Chef Nutri Ana",   avatar: "https://randomuser.me/api/portraits/women/50.jpg", text: "Smoothie bowl antiinflamatório: banana, açaí, spirulina e mel. Rico em antioxidantes e com gosto incrível.", image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=700&q=85", likes: 1567 },
  { id: "nu3", category: "Nutrição",  author: "NutriVida",        avatar: "https://randomuser.me/api/portraits/women/51.jpg", text: "Mito derrubado: gordura boa é essencial! Abacate, azeite e oleaginosas são aliados do coração e do cérebro.", image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=700&q=85", likes: 3421 },
  { id: "nu4", category: "Nutrição",  author: "Dr. Paulo Neto",   avatar: "https://randomuser.me/api/portraits/men/52.jpg", text: "Jejum intermitente 16:8: pesquisa de 6 meses mostra redução de 8% na circunferência abdominal.", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&q=85", likes: 4532 },
  { id: "nu5", category: "Nutrição",  author: "Cozinha Funcional",avatar: "https://randomuser.me/api/portraits/women/54.jpg", text: "Feijão carioca é uma das melhores fontes de fibra e proteína vegetal do mundo. Coma arroz e feijão sem culpa.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=85", likes: 2891 },
  { id: "nu6", category: "Nutrição",  author: "Vida Leve",        avatar: "https://randomuser.me/api/portraits/women/55.jpg", text: "Hidratação é subestimada! 2L de água por dia melhora memória, humor e metabolismo. Adicione limão.", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&q=85", likes: 1234 },
  { id: "nu7", category: "Nutrição",  author: "Nutri Sport",      avatar: "https://randomuser.me/api/portraits/men/56.jpg", text: "Pré-treino natural: banana com pasta de amendoim 30min antes. Carboidrato + proteína = energia e performance.", image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=700&q=85", likes: 1876 },
  { id: "nu8", category: "Nutrição",  author: "Comer Bem BR",     avatar: "https://randomuser.me/api/portraits/women/57.jpg", text: "Salada não precisa ser triste! Rúcula, manga, queijo coalho grelhado, castanhas e vinagrete de maracujá.", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=85", likes: 2345 },
  { id: "nu9", category: "Nutrição",  author: "Dieta Consciente", avatar: "https://randomuser.me/api/portraits/women/58.jpg", text: "Açúcar adicionado é o principal vilão da dieta moderna. Aprenda a ler rótulos e corte o que não precisa.", image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=700&q=85", likes: 3678 },
  { id: "nu10",category: "Nutrição",  author: "Mesa Nutritiva",   avatar: "https://randomuser.me/api/portraits/women/59.jpg", text: "Chia, linhaça e aveia no mesmo pote. Overnight oats: prepara na noite e café da manhã está pronto!", image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=700&q=85", likes: 1543 },
  // SAÚDE
  { id: "sa1", category: "Saúde",     author: "Dr. Henrique",     avatar: "https://randomuser.me/api/portraits/men/60.jpg", text: "Sono é o melhor remédio gratuito. 7-9h por noite reduz risco de doenças cardiovasculares em 30%.", image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=700&q=85", likes: 4123 },
  { id: "sa2", category: "Saúde",     author: "Psicóloga Ana P.", avatar: "https://randomuser.me/api/portraits/women/61.jpg", text: "Saúde mental é saúde. Ansiedade afeta 1 em cada 3 brasileiros. Terapia, meditação e exercício são comprovados.", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=700&q=85", likes: 5678 },
  { id: "sa3", category: "Saúde",     author: "Clínica Prevenir", avatar: "https://randomuser.me/api/portraits/women/62.jpg", text: "Check-up anual salva vidas! Pressão, glicemia, colesterol e hemograma: exames simples que detectam cedo.", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=85", likes: 2341 },
  { id: "sa4", category: "Saúde",     author: "Dr. Roberto Paz",  avatar: "https://randomuser.me/api/portraits/men/63.jpg", text: "Sedentarismo mata mais que fumar segundo a OMS. 30 minutos de caminhada por dia reduz mortalidade em 35%.", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=85", likes: 6789 },
  { id: "sa5", category: "Saúde",     author: "Bem Estar Total",  avatar: "https://randomuser.me/api/portraits/women/64.jpg", text: "Meditação mindfulness: 10 minutos por dia reduz cortisol em 23%. Apps como Headspace ajudam muito.", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=700&q=85", likes: 3456 },
  { id: "sa6", category: "Saúde",     author: "Dra. Cláudia",    avatar: "https://randomuser.me/api/portraits/women/65.jpg", text: "Vitamina D: 80% dos brasileiros têm deficiência! Exposição solar de 20min ao dia é fundamental.", image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=700&q=85", likes: 4521 },
  { id: "sa7", category: "Saúde",     author: "Viva Saudável",    avatar: "https://randomuser.me/api/portraits/women/66.jpg", text: "Postura no trabalho home office: ajuste cadeira, monitor e teclado. Dores nas costas são evitáveis com ergonomia.", image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=700&q=85", likes: 1876 },
  { id: "sa8", category: "Saúde",     author: "Cardio Fit",       avatar: "https://randomuser.me/api/portraits/men/67.jpg", text: "Pressão alta é silenciosa. Medir regularmente e reduzir sódio, álcool e estresse são os três pilares.", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=700&q=85", likes: 2134 },
  { id: "sa9", category: "Saúde",     author: "Saúde em Foco",    avatar: "https://randomuser.me/api/portraits/women/68.jpg", text: "Diabetes tipo 2 é prevenível! Atividade física + alimentação saudável reduz risco em 58%.", image: "https://images.unsplash.com/photo-1626196340002-22e8f90e6bcb?w=700&q=85", likes: 3234 },
  { id: "sa10",category: "Saúde",     author: "Mente e Corpo",    avatar: "https://randomuser.me/api/portraits/women/69.jpg", text: "Riso é remédio: rir 15 minutos por dia libera endorfinas, fortalece imunidade e reduz pressão arterial.", image: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=700&q=85", likes: 7891 },
  // SEGURANÇA
  { id: "se1", category: "Segurança", author: "CyberSec Brasil",  avatar: "https://randomuser.me/api/portraits/men/1.jpg",  text: "Phishing evoluiu: golpistas usam IA para clonar a voz de familiares. Nunca transfira dinheiro sem confirmar.", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&q=85", likes: 5432 },
  { id: "se2", category: "Segurança", author: "Proteção Digital", avatar: "https://randomuser.me/api/portraits/men/2.jpg",  text: "2FA salva contas! Autenticação de dois fatores bloqueia 99.9% dos ataques automatizados. Ative agora.", image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=700&q=85", likes: 4321 },
  { id: "se3", category: "Segurança", author: "Seg. Pública",     avatar: "https://randomuser.me/api/portraits/men/3.jpg",  text: "Câmeras de segurança inteligentes com IA identificam comportamento suspeito antes do crime acontecer.", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=700&q=85", likes: 2345 },
  { id: "se4", category: "Segurança", author: "Data Privacy BR",  avatar: "https://randomuser.me/api/portraits/men/4.jpg",  text: "LGPD completou 5 anos. Você sabe seus direitos sobre dados pessoais? Pode solicitar exclusão de qualquer empresa.", image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=700&q=85", likes: 1876 },
  { id: "se5", category: "Segurança", author: "TI Segura",        avatar: "https://randomuser.me/api/portraits/men/5.jpg",  text: "Senha forte em 2026: mínimo 16 caracteres, frases inteiras funcionam melhor. Use um gerenciador de senhas.", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=85", likes: 3456 },
  { id: "se6", category: "Segurança", author: "Fraude Alert",     avatar: "https://randomuser.me/api/portraits/men/6.jpg",  text: "Golpe do PIX falso aumentou 200% em 2025. Sempre confira o nome do destinatário ANTES de confirmar.", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=85", likes: 8901 },
  { id: "se7", category: "Segurança", author: "Priv. Online",     avatar: "https://randomuser.me/api/portraits/men/9.jpg",  text: "VPN não é só para streaming: protege seus dados em redes Wi-Fi públicas. Use sempre em aeroportos e cafés.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=85", likes: 2134 },
  { id: "se8", category: "Segurança", author: "Segurança Kids",   avatar: "https://randomuser.me/api/portraits/men/1.jpg2", text: "Controle parental: conversas abertas sobre segurança online protegem mais que qualquer software de bloqueio.", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=700&q=85", likes: 3678 },
  { id: "se9", category: "Segurança", author: "Hack Ético BR",    avatar: "https://randomuser.me/api/portraits/men/1.jpg4", text: "Bug bounty: empresas pagam hackers éticos para encontrar vulnerabilidades. Carreira em alta, salários de R$25k+.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=85", likes: 4521 },
  { id: "se10",category: "Segurança", author: "Trânsito Seguro",  avatar: "https://randomuser.me/api/portraits/men/1.jpg6", text: "Cinto de segurança reduz mortalidade em acidentes em 45%. Simples, comprovado e obrigatório por lei.", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=700&q=85", likes: 5432 },
  // CINEMA
  { id: "ci1", category: "Cinema",    author: "Cine Crítico BR",  avatar: "https://randomuser.me/api/portraits/men/1.jpg8", text: "Oppenheimer ganha o Oscar mas Barbie conquista a cultura pop. 2025 foi o ano dos filmes com alma e propósito.", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=85", likes: 6789 },
  { id: "ci2", category: "Cinema",    author: "Sétima Arte",      avatar: "https://randomuser.me/api/portraits/men/1.jpg9", text: "A24 continua dominando o cinema independente. De Hereditary a Civil War: cada filme é uma declaração artística.", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&q=85", likes: 4321 },
  { id: "ci3", category: "Cinema",    author: "Festival Cannes",  avatar: "https://randomuser.me/api/portraits/men/2.jpg0", text: "Cinema brasileiro brilha em Cannes 2025! Vidas Largas leva Palma de Ouro. Que orgulho do nosso cinema.", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=700&q=85", likes: 9123 },
  { id: "ci4", category: "Cinema",    author: "Streaming Talk",   avatar: "https://randomuser.me/api/portraits/men/2.jpg2", text: "Netflix vs theatrical release: debate continua. Filmes na tela grande têm magia que não se reproduz em casa.", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=700&q=85", likes: 3456 },
  { id: "ci5", category: "Cinema",    author: "Cinema Clássico",  avatar: "https://randomuser.me/api/portraits/men/2.jpg4", text: "Reassistindo 2001: Uma Odisseia no Espaço. Kubrick em 1968 previu IA melhor que qualquer ficção recente.", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=85", likes: 2341 },
  { id: "ci6", category: "Cinema",    author: "Anime Fan BR",     avatar: "https://randomuser.me/api/portraits/men/2.jpg5", text: "Demon Slayer: o anime que converteu 50 milhões de pessoas ao gênero. A animação do ufotable é incomparável.", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&q=85", likes: 8901 },
  { id: "ci7", category: "Cinema",    author: "Diretor BR",       avatar: "https://randomuser.me/api/portraits/men/2.jpg6", text: "Curta metragem brasileiro: a forma mais democrática de fazer cinema. Festivais revelam novos talentos.", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=700&q=85", likes: 1567 },
  { id: "ci8", category: "Cinema",    author: "Trilha Sonora",    avatar: "https://randomuser.me/api/portraits/men/4.jpg0", text: "Hans Zimmer vs John Williams: dois gênios, dois estilos. Qual trilha sonora marcou mais sua vida?", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=700&q=85", likes: 5432 },
  { id: "ci9", category: "Cinema",    author: "Roteiro em Foco",  avatar: "https://randomuser.me/api/portraits/men/4.jpg2", text: "Escrever roteiro é disciplina. Salvar o Gato de Blake Snyder é a bíblia do storytelling visual.", image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=700&q=85", likes: 2134 },
  { id: "ci10",category: "Cinema",    author: "Cine Fórum SP",    avatar: "https://randomuser.me/api/portraits/men/7.jpg0", text: "Cineclube de São Paulo debate Roma de Alfonso Cuarón. O preto e branco como escolha estética e política.", image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=700&q=85", likes: 1876 },
  // ARTES
  { id: "ar1", category: "Artes",     author: "Galeria Aberta",   avatar: "https://randomuser.me/api/portraits/men/7.jpg1", text: "Exposição de Tarsila do Amaral no MASP. Abaporu em tamanho real tira o fôlego. Arte modernista viva!", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=700&q=85", likes: 4321 },
  { id: "ar2", category: "Artes",     author: "Arte de Rua",      avatar: "https://randomuser.me/api/portraits/men/7.jpg2", text: "Grafite no Beco do Batman: cada parede é uma tela nova. Arte urbana transforma espaços abandonados em museus.", image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=700&q=85", likes: 3456 },
  { id: "ar3", category: "Artes",     author: "Arte Digital",     avatar: "https://randomuser.me/api/portraits/men/7.jpg3", text: "NFT perdeu hype, mas arte digital permanece. Illustrators no Procreate criam obras incríveis vendidas globalmente.", image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=700&q=85", likes: 2345 },
  { id: "ar4", category: "Artes",     author: "Escultura BR",     avatar: "https://randomuser.me/api/portraits/men/7.jpg4", text: "Victor Brecheret e sua influência no modernismo brasileiro. O Monumento às Bandeiras conta 200 anos de história.", image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=700&q=85", likes: 1678 },
  { id: "ar5", category: "Artes",     author: "Fotografia Arte",  avatar: "https://randomuser.me/api/portraits/men/7.jpg5", text: "Fotografia analógica está de volta. Filme 35mm, câmeras antigas e quartos de revelação. A lentidão como arte.", image: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=700&q=85", likes: 5678 },
  { id: "ar6", category: "Artes",     author: "Teatro SP",        avatar: "https://randomuser.me/api/portraits/men/7.jpg6", text: "Teatro em São Paulo: mais de 150 peças em cartaz esse mês. Do clássico ao contemporâneo, arte viva em cada palco.", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=700&q=85", likes: 2891 },
  { id: "ar7", category: "Artes",     author: "Cerâmica Arte",    avatar: "https://randomuser.me/api/portraits/men/7.jpg7", text: "Cerâmica artesanal: o movimento do slow art que cresce. Argila nas mãos, mente no presente. Meditação em forma.", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&q=85", likes: 3234 },
  { id: "ar8", category: "Artes",     author: "Ilustração BR",    avatar: "https://randomuser.me/api/portraits/men/7.jpg8", text: "Mercado de ilustração editorial cresceu 67% com o boom de newsletters e publicações independentes.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=85", likes: 1543 },
  { id: "ar9", category: "Artes",     author: "Dança Contemp.",   avatar: "https://randomuser.me/api/portraits/men/7.jpg9", text: "Dança contemporânea é linguagem política. O corpo que resiste, que ocupa, que conta história sem palavras.", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=700&q=85", likes: 2134 },
  { id: "ar10",category: "Artes",     author: "Museu Virtual",    avatar: "https://randomuser.me/api/portraits/men/8.jpg0", text: "Google Arts & Culture: acervo de 3000 museus na palma da mão. Da Mona Lisa ao Museu do Amanhã.", image: "https://images.unsplash.com/photo-1502236876580-df3b771d6a69?w=700&q=85", likes: 4567 },
  // CULINÁRIA
  { id: "cu1", category: "Culinária", author: "Chef Marcus",      avatar: "https://randomuser.me/api/portraits/men/8.jpg1", text: "Feijoada perfeita: segredo é o tucupi e o bacon defumado. 6 horas de fogo lento. Receita no comentário.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=700&q=85", likes: 6789 },
  { id: "cu2", category: "Culinária", author: "Pão Artesanal BR", avatar: "https://randomuser.me/api/portraits/men/8.jpg2", text: "Sourdough em casa: fermento natural que fiz há 3 anos ainda vivo! Pão de fermentação longa muda tudo.", image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=700&q=85", likes: 4321 },
  { id: "cu3", category: "Culinária", author: "Confeitaria Fina", avatar: "https://randomuser.me/api/portraits/men/8.jpg3", text: "Brigadeiro gourmet: ninho + nutella + limão siciliano. O clássico que nunca sai de moda reinventado.", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=700&q=85", likes: 8901 },
  { id: "cu4", category: "Culinária", author: "Churrasco Master", avatar: "https://randomuser.me/api/portraits/men/8.jpg4", text: "Picanha na brasa: sal grosso e brasa alta. Nada mais, nada menos. A carne brasileira melhor do mundo.", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=700&q=85", likes: 9123 },
  { id: "cu5", category: "Culinária", author: "Vegano Gostoso",   avatar: "https://randomuser.me/api/portraits/men/8.jpg5", text: "Hambúrguer de grão-de-bico: 15 minutos, barato e delicioso. Vegetariano que convence até carnívoro.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=85", likes: 5432 },
  { id: "cu6", category: "Culinária", author: "Comida de Boteco", avatar: "https://randomuser.me/api/portraits/men/8.jpg6", text: "Bolinho de bacalhau perfeito: crocante por fora, cremoso por dentro. Aperitivo que é refeição completa.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=700&q=85", likes: 3456 },
  { id: "cu7", category: "Culinária", author: "Pastelaria BR",    avatar: "https://randomuser.me/api/portraits/men/8.jpg7", text: "Pastel de feira: a comida de rua mais democrática do Brasil. Queijo, carne e palmito: a santíssima trindade.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=85", likes: 7891 },
  { id: "cu8", category: "Culinária", author: "Sushiman BR",      avatar: "https://randomuser.me/api/portraits/men/8.jpg8", text: "Temaki de salmão com cream cheese: a fusão japonesa-brasileira que conquistou o mundo. Irresistível.", image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=700&q=85", likes: 5678 },
  { id: "cu9", category: "Culinária", author: "Doces do Brasil",  avatar: "https://randomuser.me/api/portraits/men/8.jpg9", text: "Quindim, canjica e pamonha: a doçaria brasileira que a confeitaria europeia nunca vai reproduzir igual.", image: "https://images.unsplash.com/photo-1488477181212-4328e5d600bc?w=700&q=85", likes: 4321 },
  { id: "cu10",category: "Culinária", author: "Cozinha Mineira",  avatar: "https://randomuser.me/api/portraits/men/9.jpg0", text: "Pão de queijo mineiro com queijo curado: 3 ingredientes, tradição centenária. Patrimônio cultural do Brasil.", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&q=85", likes: 8901 },
  // ESTUDOS
  { id: "st1", category: "Estudos",   author: "Estuda Aqui",      avatar: "https://randomuser.me/api/portraits/men/9.jpg1", text: "Técnica Pomodoro 2.0: 25min de foco + 5min de pausa + Notion para organizar. Produtividade triplicou!", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=85", likes: 5432 },
  { id: "st2", category: "Estudos",   author: "Concurso BR",      avatar: "https://randomuser.me/api/portraits/men/9.jpg2", text: "Aprovado no INSS após 14 meses de estudo! Dica: revisão ativa, não passiva. Escreva, explique, não só leia.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&q=85", likes: 8901 },
  { id: "st3", category: "Estudos",   author: "Dev Carreira",     avatar: "https://randomuser.me/api/portraits/men/9.jpg3", text: "Python em 3 meses do zero ao emprego? Possível com 2h/dia no freeCodeCamp + projetos no GitHub.", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=700&q=85", likes: 7891 },
  { id: "st4", category: "Estudos",   author: "Idiomas Rápido",   avatar: "https://randomuser.me/api/portraits/men/9.jpg4", text: "Inglês fluente em 18 meses: imersão total. Séries sem legenda, podcasts, conversas com nativos no Tandem.", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=85", likes: 6789 },
  { id: "st5", category: "Estudos",   author: "ENEM Dicas",       avatar: "https://randomuser.me/api/portraits/men/9.jpg5", text: "ENEM 2026: redação cai inteligência artificial com certeza. Pratique dissertações argumentativas sobre tech.", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=85", likes: 4321 },
  { id: "st6", category: "Estudos",   author: "Filosofia Hoje",   avatar: "https://randomuser.me/api/portraits/men/9.jpg6", text: "Ler Platão em 2026 continua relevante. A Alegoria da Caverna nunca foi tão atual quanto na era das redes.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=700&q=85", likes: 3456 },
  { id: "st7", category: "Estudos",   author: "Matemática Fácil", avatar: "https://randomuser.me/api/portraits/men/9.jpg7", text: "Cálculo não é bicho de sete cabeças. Canal 3Blue1Brown no YouTube transforma abstrato em visual. Gratuito.", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=700&q=85", likes: 5678 },
  { id: "st8", category: "Estudos",   author: "OAB Prep",         avatar: "https://randomuser.me/api/portraits/men/9.jpg8", text: "Primeira fase da OAB: foque em Direito Civil e Penal, responsáveis por 40% da prova. Questões diárias.", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=700&q=85", likes: 4321 },
  { id: "st9", category: "Estudos",   author: "Ciência de Dados", avatar: "https://randomuser.me/api/portraits/men/9.jpg9", text: "Machine Learning: cursos da Stanford no Coursera mais prática no Kaggle: combinação imbatível para iniciantes.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=85", likes: 6789 },
  { id: "st10",category: "Estudos",   author: "Leitura e Ação",   avatar: "https://randomuser.me/api/portraits/men/10.jpg0",text: "Meta: 24 livros em 2026. Audiobooks no trânsito + leitura antes de dormir = 2 livros por mês. Quem topa?", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&q=85", likes: 3456 },
];

// ─────────────────────────────────────────────
// COMENTÁRIOS INICIAIS (seed)
// ─────────────────────────────────────────────
const SEED_COMMENTS = {
  e1:  [{ id: "s1", user: "João M.",  avatar: "https://randomuser.me/api/portraits/men/21.jpg", text: "Incrível! Qual é sua rotina de treino?", ts: "2h atrás" }],
  m2:  [{ id: "s2", user: "Sara L.",  avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "Já garanti meu ingresso! Te vejo lá!", ts: "4h atrás" }],
  n7:  [{ id: "s3", user: "Pedro K.", avatar: "https://randomuser.me/api/portraits/men/32.jpg", text: "Que momento histórico para a humanidade.", ts: "1h atrás" }],
  cu4: [{ id: "s4", user: "Ana B.",   avatar: "https://randomuser.me/api/portraits/women/47.jpg", text: "Picanha bem passada ou mal passada?",    ts: "30min atrás" }],
  sa2: [{ id: "s5", user: "Lucas R.", avatar: "https://randomuser.me/api/portraits/men/13.jpg", text: "Muito importante falar disso, obrigado!", ts: "3h atrás" }],
  ci3: [{ id: "s6", user: "Bia S.",   avatar: "https://randomuser.me/api/portraits/women/49.jpg", text: "Brasil mostrando o que sabe fazer!", ts: "5h atrás" }],
};

// ─────────────────────────────────────────────
// TEMAS
// ─────────────────────────────────────────────
const LIGHT = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F3F4F6",
  text: "#0F0F0F", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  border: "#E5E7EB", accent: "#6366F1", like: "#EF4444",
  tabBar: "#FFFFFF", statusBar: "dark-content",
};
const DARK = {
  bg: "#0A0A0A", surface: "#141414", surfaceAlt: "#1E1E1E",
  text: "#F9FAFB", textSecondary: "#9CA3AF", textMuted: "#6B7280",
  border: "#2A2A2A", accent: "#818CF8", like: "#F87171",
  tabBar: "#141414", statusBar: "light-content",
};

// ─────────────────────────────────────────────
// AVATAR — com foto real + fallback de inicial
// ─────────────────────────────────────────────
const Avatar = ({ uri, size = 40, name = "" }) => {
  const [failed, setFailed] = useState(false);
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  const fontSize = Math.round(size * 0.38);
  const bgColors = ["#6366F1","#A855F7","#EC4899","#EF4444","#F59E0B",
                    "#22C55E","#14B8A6","#3B82F6","#FF6B35","#8B5CF6"];
  const bgColor  = bgColors[(name.charCodeAt(0) || 0) % bgColors.length];

  if (failed || !uri) {
    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
      }}>
        <Text style={{ color: "#FFF", fontSize, fontWeight: "700" }}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: "#D1D5DB",
        borderWidth: size > 34 ? 1.5 : 0,
        borderColor: "rgba(0,0,0,0.08)",
      }}
      onError={() => setFailed(true)}
    />
  );
};

// ─────────────────────────────────────────────
// BOTÃO CURTIR (com animação)
// ─────────────────────────────────────────────
const HeartButton = ({ liked, count, onPress, theme }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 50 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.actionBtn} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={22}
          color={liked ? theme.like : theme.textSecondary}
        />
      </Animated.View>
      <Text style={[styles.actionCount, { color: liked ? theme.like : theme.textSecondary }]}>
        {count}
      </Text>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
// POST CARD
// ─────────────────────────────────────────────
const PostCard = React.memo(({ post, theme, onLike, onComment, likedPosts, commentCount }) => {
  const liked = likedPosts.has(post.id);
  const meta  = CATEGORY_META[post.category];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Barra de categoria colorida no topo */}
      <View style={[styles.cardAccentBar, { backgroundColor: meta.color }]} />

      {/* Imagem em destaque ACIMA do texto (estilo editorial/Instagram) */}
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: post.image }} style={styles.cardImage} resizeMode="cover" />
        {/* Overlay com badge de categoria sobre a imagem */}
        <View style={[styles.cardImageBadge, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon} size={11} color="#FFF" />
          <Text style={styles.cardImageBadgeText}>{post.category}</Text>
        </View>
        {/* Indicador de curtida (coração flutuante) */}
        {liked && (
          <View style={styles.cardImageLikedMark}>
            <Ionicons name="heart" size={16} color="#FFF" />
          </View>
        )}
      </View>

      {/* Cabeçalho: avatar + autor */}
      <View style={styles.cardHeader}>
        <Avatar uri={post.avatar} size={38} name={post.author} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.authorName, { color: theme.text }]}>{post.author}</Text>
          <View style={styles.categoryRow}>
            <Ionicons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.categoryLabel, { color: meta.color }]}>{post.category}</Text>
          </View>
        </View>
      </View>

      {/* Texto */}
      <Text style={[styles.cardText, { color: theme.text }]}>{post.text}</Text>

      {/* Ações */}
      <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
        <HeartButton
          liked={liked}
          count={post.likes + (liked ? 1 : 0)}
          onPress={() => onLike(post)}
          theme={theme}
        />
        <TouchableOpacity
          onPress={() => onComment(post)}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={commentCount > 0 ? "chatbubble" : "chatbubble-outline"}
            size={20}
            color={commentCount > 0 ? theme.accent : theme.textSecondary}
          />
          <Text style={[styles.actionCount, { color: commentCount > 0 ? theme.accent : theme.textSecondary }]}>
            {commentCount > 0 ? commentCount : "Comentar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────
// MODAL DE COMENTÁRIOS — FUNCIONAL E PERSISTENTE
// ─────────────────────────────────────────────
const CommentModal = ({ visible, post, onClose, theme, userName, userAvatar, comments, onAddComment }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll quando novos comentários chegam
  useEffect(() => {
    if (visible && post) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible, comments, post]);

  if (!post) return null;

  const postComments = comments[post.id] || [];
  const meta = CATEGORY_META[post.category];

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddComment(post.id, {
      id:     `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user:   userName,
      avatar: userAvatar,
      text:   trimmed,
      ts:     "agora",
    });
    setInputText("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Folha do modal */}
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Handle */}
          <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Comentários
              {postComments.length > 0 && (
                <Text style={{ color: theme.accent, fontWeight: "600" }}>
                  {" "}({postComments.length})
                </Text>
              )}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Preview do post */}
          <View style={[
            styles.modalPostPreview,
            { backgroundColor: theme.surfaceAlt, borderLeftColor: meta.color },
          ]}>
            <Avatar uri={post.avatar} size={28} name={post.author} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.modalPostAuthor, { color: meta.color }]}>{post.author}</Text>
              <Text style={[styles.modalPostText, { color: theme.textSecondary }]} numberOfLines={2}>
                {post.text}
              </Text>
            </View>
          </View>

          {/* Lista de comentários */}
          <ScrollView
            ref={scrollRef}
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10, gap: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            {postComments.length === 0 ? (
              <View style={styles.noComments}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={theme.textMuted} />
                <Text style={[styles.noCommentsText, { color: theme.textMuted }]}>
                  Nenhum comentário ainda.{"\n"}Seja o primeiro!
                </Text>
              </View>
            ) : (
              postComments.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <Avatar uri={c.avatar} size={34} name={c.user} />
                  <View style={{ flex: 1 }}>
                    <View style={[styles.commentBubble, { backgroundColor: theme.surfaceAlt }]}>
                      <Text style={[styles.commentUser, { color: theme.accent }]}>{c.user}</Text>
                      <Text style={[styles.commentText, { color: theme.text }]}>{c.text}</Text>
                    </View>
                    <Text style={[styles.commentTs, { color: theme.textMuted }]}>{c.ts}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Campo de input */}
          <View style={[styles.commentInputRow, { borderTopColor: theme.border }]}>
            <Avatar uri={userAvatar} size={34} name={userName} />
            <TextInput
              style={[styles.commentInput, {
                backgroundColor: theme.surfaceAlt,
                color: theme.text,
                borderColor: inputText.trim() ? theme.accent : theme.border,
              }]}
              placeholder={`Comentar como ${userName}...`}
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
              blurOnSubmit
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? theme.accent : theme.border },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={15} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// TELA: ONBOARDING
// ─────────────────────────────────────────────
const OnboardingScreen = ({ onComplete, theme }) => {
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState("");
  const [selected, setSelected] = useState(new Set());
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const goNext = () => {
    if (name.trim().length < 2) return;
    fadeAnim.setValue(0);
    slideAnim.setValue(28);
    setStep(1);
  };

  const toggle = (cat) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
  };

  const canProceed = selected.size >= 2;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} />
      <ScrollView
        contentContainerStyle={styles.onboardScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: theme.accent }]}>
              <Ionicons name="planet" size={36} color="#FFF" />
            </View>
            <Text style={[styles.logoText, { color: theme.text }]}>Nexus</Text>
            <Text style={[styles.logoSub, { color: theme.textSecondary }]}>Sua rede inteligente</Text>
          </View>

          {step === 0 ? (
            /* Passo 1: Nome */
            <View style={styles.onboardCard}>
              <Text style={[styles.onboardTitle, { color: theme.text }]}>Qual é o seu nome?</Text>
              <Text style={[styles.onboardSub, { color: theme.textSecondary }]}>
                Vamos personalizar sua experiência
              </Text>
              <TextInput
                style={[styles.nameInput, {
                  backgroundColor: theme.surfaceAlt,
                  color: theme.text,
                  borderColor: name.trim().length >= 2 ? theme.accent : theme.border,
                }]}
                placeholder="Seu primeiro nome"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, {
                  backgroundColor: name.trim().length >= 2 ? theme.accent : theme.border,
                }]}
                onPress={goNext}
                disabled={name.trim().length < 2}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Passo 2: Interesses */
            <View style={styles.onboardCard}>
              <Text style={[styles.onboardTitle, { color: theme.text }]}>
                Olá, {name.trim()}!
              </Text>
              <Text style={[styles.onboardSub, { color: theme.textSecondary }]}>
                Selecione pelo menos{" "}
                <Text style={{ color: theme.accent, fontWeight: "700" }}>2 interesses</Text>{" "}
                para personalizar seu feed
              </Text>

              <View style={styles.categoriesGrid}>
                {CATEGORIES.map(cat => {
                  const isSelected = selected.has(cat);
                  const meta = CATEGORY_META[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, {
                        backgroundColor: isSelected ? meta.color : theme.surfaceAlt,
                        borderColor: isSelected ? meta.color : theme.border,
                      }]}
                      onPress={() => toggle(cat)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={meta.icon} size={17} color={isSelected ? "#FFF" : meta.color} />
                      <Text style={[styles.categoryChipText, { color: isSelected ? "#FFF" : theme.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.selectionCount, { color: theme.textSecondary }]}>
                {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: canProceed ? theme.accent : theme.border }]}
                onPress={() => canProceed && onComplete(name.trim(), Array.from(selected))}
                disabled={!canProceed}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Entrar no Nexus</Text>
                <Ionicons name="rocket" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// TELA: FEED
// ─────────────────────────────────────────────
// Gera a ordem do feed a partir dos pesos atuais (puro snapshot)
const buildFeedSnapshot = (weights) => {
  const maxW = Math.max(...Object.values(weights), 1);
  const scored = DATABASE_POSTS.map(post => {
    const catWeight = (weights[post.category] || 0) / maxW;
    const noise     = Math.random();
    const catBoost  = catWeight * 0.22;
    return { ...post, _score: noise + catBoost };
  });
  return scored.sort((a, b) => b._score - a._score);
};

const FeedScreen = ({
  theme, userName, userAvatar,
  categoryWeights, onLike, likedPosts,
  comments, onAddComment,
}) => {
  const [commentPost,  setCommentPost]  = useState(null);
  const [feedSnapshot, setFeedSnapshot] = useState(() => buildFeedSnapshot(categoryWeights));
  const [hasNewContent, setHasNewContent] = useState(false);
  const flatListRef = useRef(null);

  // Detecta que categoryWeights mudou (like/comentário) → sinaliza ao usuário
  // que há conteúdo novo disponível, SEM re-embaralhar automaticamente
  useEffect(() => {
    setHasNewContent(true);
  }, [categoryWeights]);

  const handleRefresh = useCallback(() => {
    const next = buildFeedSnapshot(categoryWeights);
    setFeedSnapshot(next);
    setHasNewContent(false);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [categoryWeights]);

  const renderItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      theme={theme}
      onLike={onLike}
      onComment={setCommentPost}
      likedPosts={likedPosts}
      commentCount={(comments[item.id] || []).length}
    />
  ), [theme, onLike, likedPosts, comments]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.bg }]}>
      <FlatList
        ref={flatListRef}
        data={feedSnapshot}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.border }} />
        )}
        ListHeaderComponent={
          <View style={[styles.feedHeader, {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          }]}>
            <View style={styles.feedHeaderRow}>
              <View>
                <Text style={[styles.feedGreeting, { color: theme.textSecondary }]}>
                  Bom dia, {userName}
                </Text>
                <Text style={[styles.feedTitle, { color: theme.text }]}>Seu Feed</Text>
              </View>
              {/* Botão de atualizar feed */}
              <TouchableOpacity
                onPress={handleRefresh}
                style={[
                  styles.refreshBtn,
                  {
                    backgroundColor: hasNewContent ? theme.accent : theme.surfaceAlt,
                    borderColor: hasNewContent ? theme.accent : theme.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="refresh"
                  size={15}
                  color={hasNewContent ? "#FFF" : theme.textSecondary}
                />
                <Text style={[
                  styles.refreshBtnText,
                  { color: hasNewContent ? "#FFF" : theme.textSecondary },
                ]}>
                  {hasNewContent ? "Atualizar" : "Atualizado"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      <CommentModal
        visible={!!commentPost}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        theme={theme}
        userName={userName}
        userAvatar={userAvatar}
        comments={comments}
        onAddComment={onAddComment}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// TELA: PERFIL
// ─────────────────────────────────────────────
const ProfileScreen = ({
  theme, userName, userAvatar,
  categoryWeights, likedPosts, likedPostsData,
  darkMode, onToggleDark, onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("algo");

  const totalWeight = Object.values(categoryWeights).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(categoryWeights)
    .filter(([, w]) => w > 0)
    .sort(([, a], [, b]) => b - a);
  const maxWeight = sorted[0]?.[1] || 1;

  // Tamanho de cada célula da grade (3 colunas, 1px de separação)
  const IMG_SIZE = (SCREEN_WIDTH - 2) / 3;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cabeçalho do perfil ── */}
      <View style={[styles.profileHeader, {
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        {/* Avatar com inicial */}
        <View style={[styles.profileAvatarWrap, { backgroundColor: theme.accent }]}>
          <Text style={styles.profileAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={[styles.profileName, { color: theme.text }]}>{userName}</Text>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{likedPosts.size}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Curtidas</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>{sorted.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Categorias</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text
              style={[styles.statNumber, { color: theme.text, fontSize: 13 }]}
              numberOfLines={1}
            >
              {sorted[0]?.[0] ?? "—"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Top tema</Text>
          </View>
        </View>

        {/* Botão modo escuro */}
        <TouchableOpacity
          style={[styles.darkToggle, {
            backgroundColor: theme.surfaceAlt,
            borderColor: theme.border,
          }]}
          onPress={onToggleDark}
          activeOpacity={0.8}
        >
          <Ionicons name={darkMode ? "sunny" : "moon"} size={14} color={theme.accent} />
          <Text style={[styles.darkToggleText, { color: theme.text }]}>
            {darkMode ? "Modo claro" : "Modo escuro"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tabs internas (Algoritmo | Curtidas) ── */}
      <View style={[styles.profileTabs, {
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        {[
          { id: "algo",  label: "Algoritmo", icon: "analytics" },
          { id: "likes", label: "Curtidas",  icon: "heart" },
        ].map(t => {
          const isA = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.profileTab,
                isA && { borderBottomColor: theme.accent, borderBottomWidth: 2.5 },
              ]}
              onPress={() => setActiveTab(t.id)}
            >
              <Ionicons
                name={isA ? t.icon : `${t.icon}-outline`}
                size={17}
                color={isA ? theme.accent : theme.textMuted}
              />
              <Text style={[styles.profileTabText, {
                color: isA ? theme.accent : theme.textMuted,
              }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── ABA: ALGORITMO ── */}
      {activeTab === "algo" && (
        <View style={styles.profileSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            O que o algoritmo descobriu sobre você
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            Baseado nas suas curtidas e interesses iniciais
          </Text>

          {sorted.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.surfaceAlt }]}>
              <Ionicons name="analytics-outline" size={38} color={theme.textMuted} />
              <Text style={[styles.emptyBoxText, { color: theme.textMuted }]}>
                Curta posts para o algoritmo aprender seus gostos
              </Text>
            </View>
          ) : (
            sorted.map(([cat, weight], idx) => {
              const meta = CATEGORY_META[cat];
              const pct  = (weight / maxWeight) * 100;
              return (
                <View key={cat} style={[styles.algoItem, {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }]}>
                  <View style={styles.algoItemHeader}>
                    <View style={[styles.algoIconWrap, { backgroundColor: meta.color + "20" }]}>
                      <Ionicons name={meta.icon} size={17} color={meta.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={styles.algoLabelRow}>
                        <Text style={[styles.algoLabel, { color: theme.text }]}>{cat}</Text>
                        {idx === 0 && (
                          <View style={[styles.topBadge, { backgroundColor: meta.color }]}>
                            <Text style={styles.topBadgeText}>Top</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.algoWeightText, { color: theme.textSecondary }]}>
                        {Math.round((weight / totalWeight) * 100)}% relevância · {weight} ponto{weight !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
                    <View style={[styles.progressFill, {
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ── ABA: CURTIDAS (grade 3x3) ── */}
      {activeTab === "likes" && (
        <View>
          {likedPostsData.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.surfaceAlt, margin: 20 }]}>
              <Ionicons name="heart-outline" size={38} color={theme.textMuted} />
              <Text style={[styles.emptyBoxText, { color: theme.textMuted }]}>
                Você ainda não curtiu nenhum post.{"\n"}Explore o feed e curta o que gostar!
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.likesGridLabel, { color: theme.textSecondary }]}>
                {likedPostsData.length} post{likedPostsData.length !== 1 ? "s" : ""} curtido{likedPostsData.length !== 1 ? "s" : ""}
              </Text>

              {/* Grade de imagens estilo Instagram */}
              <View style={styles.likesGrid}>
                {likedPostsData.map((post) => {
                  const meta = CATEGORY_META[post.category];
                  return (
                    <View
                      key={post.id}
                      style={[styles.likeGridCell, { width: IMG_SIZE, height: IMG_SIZE }]}
                    >
                      <Image
                        source={{ uri: post.image }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                      {/* Overlay escuro com badges */}
                      <View style={styles.likeGridOverlay}>
                        {/* Badge da categoria (canto superior esquerdo) */}
                        <View style={[styles.likeGridBadge, { backgroundColor: meta.color }]}>
                          <Ionicons name={meta.icon} size={8} color="#FFF" />
                          <Text style={styles.likeGridBadgeText}>{post.category}</Text>
                        </View>
                        {/* Ícone de coração (canto superior direito) */}
                        <Ionicons name="heart" size={13} color="#FFF" />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      )}

      {/* Botão de logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: theme.border }]}
        onPress={onLogout}
        activeOpacity={0.75}
      >
        <Ionicons name="log-out-outline" size={17} color={theme.like} />
        <Text style={[styles.logoutText, { color: theme.like }]}>Sair e reiniciar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// TELA: EXPLORAR
// ─────────────────────────────────────────────
const ExploreScreen = ({
  theme, userName, userAvatar,
  onLike, likedPosts,
  comments, onAddComment,
  categoryWeights,
}) => {
  const [search, setSearch]                   = useState("");
  // Multi-select: Set de categorias selecionadas
  const [selectedCats, setSelectedCats]       = useState(new Set());
  const [commentPost, setCommentPost]         = useState(null);

  // Categorias de descoberta (peso zero = usuário não tem interesse)
  const discoveryCats = useMemo(() =>
    CATEGORIES.filter(cat => (categoryWeights[cat] || 0) === 0),
  [categoryWeights]);

  // Toggle de categoria (multi-select)
  const toggleCat = useCallback((cat) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const clearCats = useCallback(() => setSelectedCats(new Set()), []);

  // Posts filtrados com multi-select + busca
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const hasCatFilter = selectedCats.size > 0;

    if (hasCatFilter || q) {
      // Modo filtro manual: aplica seleção e/ou busca em todos os posts
      return DATABASE_POSTS.filter(p => {
        const matchCat  = !hasCatFilter || selectedCats.has(p.category);
        const matchText = !q ||
          p.text.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q);
        return matchCat && matchText;
      });
    }
    // Modo descoberta padrão: categorias sem interesse, embaralhadas
    const pool = discoveryCats.length > 0
      ? DATABASE_POSTS.filter(p => discoveryCats.includes(p.category))
      : DATABASE_POSTS;
    return [...pool].sort(() => Math.random() - 0.5);
  }, [search, selectedCats, discoveryCats]);

  const renderItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      theme={theme}
      onLike={onLike}
      onComment={setCommentPost}
      likedPosts={likedPosts}
      commentCount={(comments[item.id] || []).length}
    />
  ), [theme, onLike, likedPosts, comments]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.bg }]}>
      {/* Barra de busca */}
      <View style={[styles.searchBar, {
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        <View style={[styles.searchInputWrap, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="search" size={17} color={theme.textMuted} />
          <TextInput
            style={[styles.searchText, { color: theme.text }]}
            placeholder="Buscar posts ou autores..."
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={17} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Banner de descoberta */}
      {!search && selectedCats.size === 0 && (
        <View style={[styles.discoverBanner, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
          <Ionicons name="compass" size={14} color={theme.accent} />
          <Text style={[styles.discoverBannerText, { color: theme.textSecondary }]}>
            {discoveryCats.length > 0
              ? `${discoveryCats.length} tema${discoveryCats.length > 1 ? "s" : ""} novo${discoveryCats.length > 1 ? "s" : ""} para explorar`
              : "Explore todos os temas disponíveis"}
          </Text>
          {selectedCats.size > 0 && (
            <TouchableOpacity onPress={clearCats} style={styles.clearPill}>
              <Text style={[styles.clearPillText, { color: theme.accent }]}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filtros multi-select */}
      <View style={[styles.exploreFilterWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {/* Linha 1: botão limpar + contagem */}
        {selectedCats.size > 0 && (
          <View style={styles.filterHeader}>
            <Text style={[styles.filterCount, { color: theme.textSecondary }]}>
              {selectedCats.size} categoria{selectedCats.size > 1 ? "s" : ""} selecionada{selectedCats.size > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={clearCats}>
              <Text style={[styles.clearText, { color: theme.accent }]}>Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pills multi-select horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}
        >
          {/* Pill "Descobrir" (limpa seleção) */}
          <TouchableOpacity
            style={[styles.catPill, {
              backgroundColor: selectedCats.size === 0 ? theme.accent : theme.surfaceAlt,
              borderColor:     selectedCats.size === 0 ? theme.accent : theme.border,
            }]}
            onPress={clearCats}
          >
            <Ionicons name="star" size={12} color={selectedCats.size === 0 ? "#FFF" : theme.accent} />
            <Text style={[styles.catPillText, { color: selectedCats.size === 0 ? "#FFF" : theme.text }]}>
              Descobrir
            </Text>
          </TouchableOpacity>

          {/* Divider visual */}
          <View style={[styles.pillDivider, { backgroundColor: theme.border }]} />

          {CATEGORIES.map(cat => {
            const meta    = CATEGORY_META[cat];
            const isSelec = selectedCats.has(cat);
            const isNew   = discoveryCats.includes(cat); // sem interesse prévio
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, {
                  backgroundColor: isSelec ? meta.color : theme.surfaceAlt,
                  borderColor:     isSelec ? meta.color : isNew ? meta.color + "55" : theme.border,
                  borderWidth:     isNew && !isSelec ? 1.5 : 1,
                }]}
                onPress={() => toggleCat(cat)}
                activeOpacity={0.75}
              >
                <Ionicons name={meta.icon} size={12} color={isSelec ? "#FFF" : meta.color} />
                <Text style={[styles.catPillText, { color: isSelec ? "#FFF" : theme.text }]}>{cat}</Text>
                {/* Ponto indicador de tema novo */}
                {isNew && !isSelec && (
                  <View style={[styles.newDot, { backgroundColor: meta.color }]} />
                )}
                {/* Check quando selecionado */}
                {isSelec && (
                  <Ionicons name="checkmark-circle" size={13} color="rgba(255,255,255,0.85)" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista filtrada */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.border }} />
        )}
        ListHeaderComponent={
          selectedCats.size > 0 || search ? (
            <View style={[styles.resultsHeader, { backgroundColor: theme.surfaceAlt }]}>
              <Ionicons name="filter" size={13} color={theme.textSecondary} />
              <Text style={[styles.resultsHeaderText, { color: theme.textSecondary }]}>
                {filtered.length} post{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                {selectedCats.size > 0 ? ` em ${selectedCats.size} categoria${selectedCats.size > 1 ? "s" : ""}` : ""}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={44} color={theme.textMuted} />
            <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
              Nenhum post encontrado
            </Text>
          </View>
        }
      />

      <CommentModal
        visible={!!commentPost}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        theme={theme}
        userName={userName}
        userAvatar={userAvatar}
        comments={comments}
        onAddComment={onAddComment}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const [darkMode,        setDarkMode]        = useState(false);
  const [userData,        setUserData]        = useState(null);
  const [activeTab,       setActiveTab]       = useState("feed");
  const [categoryWeights, setCategoryWeights] = useState({});
  const [likedPosts,      setLikedPosts]      = useState(new Set());
  const [likedPostsData,  setLikedPostsData]  = useState([]); // array com dados completos dos posts curtidos
  const [comments,        setComments]        = useState(SEED_COMMENTS); // { postId: [...] }

  const theme      = darkMode ? DARK : LIGHT;
  const userAvatar = "https://randomuser.me/api/portraits/men/5.jpg";

  // ── Onboarding completo ──────────────────
  const handleOnboardingComplete = (name, selectedCategories) => {
    const weights = {};
    CATEGORIES.forEach(cat => {
      weights[cat] = selectedCategories.includes(cat) ? 5 : 0;
    });
    setCategoryWeights(weights);
    setUserData({ name, interests: selectedCategories });
  };

  // ── Like / Unlike com algoritmo ──────────
  const handleLike = useCallback((post) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        // Unlike: remove do histórico e reduz o peso
        next.delete(post.id);
        setLikedPostsData(d => d.filter(p => p.id !== post.id));
        setCategoryWeights(w => ({
          ...w,
          [post.category]: Math.max(0, (w[post.category] || 0) - 1),
        }));
      } else {
        // Like: adiciona ao histórico (mais recente primeiro) e aumenta o peso
        next.add(post.id);
        setLikedPostsData(d => [post, ...d]);
        setCategoryWeights(w => ({
          ...w,
          [post.category]: (w[post.category] || 0) + 2,
        }));
      }
      return next;
    });
  }, []);

  // ── Adicionar comentário: persiste + atribui 3 pontos na categoria ──
  const handleAddComment = useCallback((postId, comment) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }));
    // Encontra o post para saber a categoria e adicionar peso
    const post = DATABASE_POSTS.find(p => p.id === postId);
    if (post) {
      setCategoryWeights(w => ({
        ...w,
        [post.category]: (w[post.category] || 0) + 3,
      }));
    }
  }, []);

  // ── Logout / Reiniciar ───────────────────
  const handleLogout = () => {
    setUserData(null);
    setCategoryWeights({});
    setLikedPosts(new Set());
    setLikedPostsData([]);
    setComments(SEED_COMMENTS);
    setActiveTab("feed");
  };

  // ── Onboarding ainda não concluído ───────
  if (!userData) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} theme={theme} />;
  }

  // ── Props compartilhadas entre telas ─────
  const shared = {
    theme,
    userName:     userData.name,
    userAvatar,
    onLike:       handleLike,
    likedPosts,
    comments,
    onAddComment: handleAddComment,
  };

  const TABS = [
    { id: "feed",    icon: "home",          label: "Início" },
    { id: "explore", icon: "compass",       label: "Explorar" },
    { id: "profile", icon: "person-circle", label: "Perfil" },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      {/* Header global */}
      <View style={[styles.appHeader, {
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        <View style={[styles.appLogoMini, { backgroundColor: theme.accent }]}>
          <Ionicons name="planet" size={18} color="#FFF" />
        </View>
        <Text style={[styles.appHeaderTitle, { color: theme.text }]}>Nexus</Text>
        <TouchableOpacity
          onPress={() => setDarkMode(d => !d)}
          style={styles.headerAction}
        >
          <Ionicons
            name={darkMode ? "sunny-outline" : "moon-outline"}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Conteúdo da aba ativa */}
      <View style={styles.flex}>
        {activeTab === "feed" && (
          <FeedScreen {...shared} categoryWeights={categoryWeights} />
        )}
        {activeTab === "explore" && (
          <ExploreScreen {...shared} categoryWeights={categoryWeights} />
        )}
        {activeTab === "profile" && (
          <ProfileScreen
            theme={theme}
            userName={userData.name}
            userAvatar={userAvatar}
            categoryWeights={categoryWeights}
            likedPosts={likedPosts}
            likedPostsData={likedPostsData}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, {
        backgroundColor: theme.tabBar,
        borderTopColor: theme.border,
      }]}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={24}
                color={isActive ? theme.accent : theme.textMuted}
              />
              <Text style={[styles.tabLabel, {
                color: isActive ? theme.accent : theme.textMuted,
              }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ── Onboarding ──────────────────────────────────────
  onboardScroll:     { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logoArea:          { alignItems: "center", marginTop: 60, marginBottom: 36 },
  logoCircle:        { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText:          { fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  logoSub:           { fontSize: 15, marginTop: 4 },
  onboardCard:       { gap: 16 },
  onboardTitle:      { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  onboardSub:        { fontSize: 15, lineHeight: 22 },
  nameInput:         { height: 54, borderRadius: 14, paddingHorizontal: 18, fontSize: 17, borderWidth: 1.5, marginTop: 8 },
  primaryBtn:        { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  primaryBtnText:    { color: "#FFF", fontSize: 17, fontWeight: "700" },
  categoriesGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  categoryChip:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50, borderWidth: 1.5 },
  categoryChipText:  { fontSize: 14, fontWeight: "600" },
  selectionCount:    { fontSize: 13, textAlign: "center" },

  // ── App Header ──────────────────────────────────────
  appHeader:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  appLogoMini:       { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  appHeaderTitle:    { flex: 1, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  headerAction:      { padding: 4 },

  // ── Feed ────────────────────────────────────────────
  feedHeader:        { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  feedHeaderRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  feedGreeting:      { fontSize: 13, marginBottom: 2 },
  feedTitle:         { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  refreshBtn:        {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  refreshBtnText:    { fontSize: 13, fontWeight: "700" },

  // ── Post Card ───────────────────────────────────────
  card:              { backgroundColor: "transparent", overflow: "hidden" },
  cardAccentBar:     { height: 3, width: "100%" },
  cardImageWrap:     { position: "relative" },
  cardImage:         { width: "100%", height: 260, backgroundColor: "#D1D5DB" },
  cardImageBadge:    {
    position: "absolute", top: 12, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  cardImageBadgeText:{ color: "#FFF", fontSize: 11, fontWeight: "700" },
  cardImageLikedMark:{
    position: "absolute", top: 12, right: 12,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(239,68,68,0.85)",
    alignItems: "center", justifyContent: "center",
  },
  cardHeader:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, marginBottom: 8 },
  authorName:        { fontSize: 14, fontWeight: "700" },
  categoryRow:       { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  categoryLabel:     { fontSize: 11, fontWeight: "600" },
  categoryBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText: { fontSize: 11, fontWeight: "700" },
  cardText:          { fontSize: 14, lineHeight: 21, paddingHorizontal: 14, marginBottom: 10, color: "#374151" },
  cardActions:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, marginTop: 2, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  actionBtn:         { flexDirection: "row", alignItems: "center", gap: 5, paddingRight: 16 },
  actionCount:       { fontSize: 13, fontWeight: "600" },

  // ── Modal de Comentários ────────────────────────────
  modalBackdrop:     { flex: 1, backgroundColor: "rgba(0,0,0,0.52)" },
  modalSheet:        {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 16,
    maxHeight: "82%",
  },
  modalHandle:       { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  modalHeader:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle:        { fontSize: 17, fontWeight: "800" },
  modalPostPreview:  { flexDirection: "row", alignItems: "flex-start", padding: 10, borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, gap: 8 },
  modalPostAuthor:   { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  modalPostText:     { fontSize: 13, lineHeight: 18 },
  commentsList:      { maxHeight: 280 },
  noComments:        { alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 10 },
  noCommentsText:    { fontSize: 14, textAlign: "center", lineHeight: 20 },
  commentItem:       { flexDirection: "row", gap: 9, alignItems: "flex-start" },
  commentBubble:     { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, flex: 1 },
  commentUser:       { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  commentText:       { fontSize: 14, lineHeight: 20 },
  commentTs:         { fontSize: 11, marginTop: 4, marginLeft: 4 },
  commentInputRow:   { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 6 },
  commentInput:      { flex: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1.5, maxHeight: 100 },
  sendBtn:           { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },

  // ── Tab Bar ─────────────────────────────────────────
  tabBar:            { flexDirection: "row", borderTopWidth: 1, paddingBottom: Platform.OS === "ios" ? 22 : 8, paddingTop: 8 },
  tabItem:           { flex: 1, alignItems: "center", gap: 3 },
  tabLabel:          { fontSize: 11, fontWeight: "600" },

  // ── Perfil ──────────────────────────────────────────
  profileHeader:     { alignItems: "center", padding: 24, borderBottomWidth: 1, gap: 8 },
  profileAvatarWrap: { width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  profileAvatarText: { color: "#FFF", fontSize: 30, fontWeight: "800" },
  profileName:       { fontSize: 21, fontWeight: "800" },
  statsRow:          { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statItem:          { alignItems: "center", paddingHorizontal: 20 },
  statNumber:        { fontSize: 18, fontWeight: "800" },
  statLabel:         { fontSize: 11, marginTop: 2 },
  statDivider:       { width: 1, height: 32 },
  darkToggle:        { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50, borderWidth: 1, marginTop: 6 },
  darkToggleText:    { fontSize: 13, fontWeight: "600" },

  profileTabs:       { flexDirection: "row", borderBottomWidth: 1 },
  profileTab:        { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13 },
  profileTabText:    { fontSize: 13, fontWeight: "700" },

  profileSection:    { padding: 18, gap: 12 },
  sectionTitle:      { fontSize: 17, fontWeight: "800" },
  sectionSub:        { fontSize: 13, marginTop: -4 },

  emptyBox:          { padding: 28, borderRadius: 16, alignItems: "center", gap: 10, marginTop: 8 },
  emptyBoxText:      { fontSize: 14, textAlign: "center", lineHeight: 20 },

  // Algoritmo
  algoItem:          { borderRadius: 16, padding: 14, borderWidth: 1, gap: 10 },
  algoItemHeader:    { flexDirection: "row", alignItems: "center" },
  algoIconWrap:      { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  algoLabelRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  algoLabel:         { fontSize: 15, fontWeight: "700" },
  algoWeightText:    { fontSize: 12, marginTop: 2 },
  topBadge:          { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  topBadgeText:      { color: "#FFF", fontSize: 11, fontWeight: "700" },
  progressTrack:     { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill:      { height: "100%", borderRadius: 3 },

  // Grade de curtidas
  likesGridLabel:    { fontSize: 12, paddingHorizontal: 14, paddingVertical: 10, fontWeight: "600" },
  likesGrid:         { flexDirection: "row", flexWrap: "wrap", gap: 1 },
  likeGridCell:      { overflow: "hidden", position: "relative" },
  likeGridOverlay:   {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  likeGridBadge:     { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 20 },
  likeGridBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },

  // Logout
  logoutBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 14, borderWidth: 1 },
  logoutText:        { fontSize: 15, fontWeight: "700" },

  // ── Explorar ────────────────────────────────────────
  searchBar:         { padding: 12, borderBottomWidth: 1 },
  searchInputWrap:   { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 },
  searchText:        { flex: 1, fontSize: 15 },
  catScroll:         { flexGrow: 0 }, // agora dentro de exploreFilterWrap
  catPill:           { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  catPillText:       { fontSize: 13, fontWeight: "600" },
  emptyState:        { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyStateText:    { fontSize: 15 },

  // ── Explorar: descoberta + multi-select ─────
  discoverBanner:     {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1,
  },
  discoverBannerText: { fontSize: 12, fontWeight: "600", flex: 1 },
  clearPill:          { paddingHorizontal: 8, paddingVertical: 3 },
  clearPillText:      { fontSize: 12, fontWeight: "700" },
  exploreFilterWrap:  { borderBottomWidth: 1 },
  filterHeader:       {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingTop: 10,
  },
  filterCount:        { fontSize: 12, fontWeight: "600" },
  clearText:          { fontSize: 12, fontWeight: "700" },
  pillDivider:        { width: 1, height: 28, alignSelf: "center", marginHorizontal: 4 },
  newDot:             { width: 6, height: 6, borderRadius: 3, marginLeft: 1 },
  resultsHeader:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  resultsHeaderText:  { fontSize: 12, fontWeight: "600" },
});
